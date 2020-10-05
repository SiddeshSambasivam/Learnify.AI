from pymongo import MongoClient
from config import USERNAME, PASSWORD
from flask import request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_bcrypt import Bcrypt
import flask
import os
from builtins import bytes
from documentReader import pdfReader, docxReader, pptReader


app = flask.Flask(__name__)
app.config["DEBUG"] = True
jwt = JWTManager(app)

EMAIL = ''

client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
# 'thisisasipprojectanditsnameisnodemind'

app.config['JWT_ACCESS_COOKIE_PATH'] = '/app/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/token/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False

# Set the secret key to sign the JWTs with
app.config['JWT_SECRET_KEY'] = 'e4aa2564fefc8a421232c895233838f3f66ab305ef508e47597b27ff744b6131'

@app.route('/auth', methods=['GET'])
def authenticate():
    # email:str ,password:str
    # /auth?email={}&password={}
    # /auth?email=ee3002_test1@gmail.com&password=pass
    bcrypt = Bcrypt()
    
    req = request.args.to_dict()
    email = req['email']
    password = req['password']
    # client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")
    auth=client['nodemind']
    print(email)
    response = auth.auth.find({'email_id': email})
    user_data = dict()
    print(response)

    print(' actual password =>', response['password'])

    if bcrypt.check_password_hash(response['password'], password):
        
        print('Auth success')
        db = client['nodemind'].core
        user_data = db.find({'email_id':response['email_id']})[0]
        del user_data['_id']
        
        access_token = create_access_token(identity=email)
        user_data['access_token'] = access_token
        global EMAIL 
        EMAIL = email
        return jsonify(user_data)
    else:
        user_data['debug'] = 'Auth Unsuccessful: Username/password incorrect'
        return jsonify(user_data)

@app.route('/upload', methods=['PUT'])
def upload_files():    
    # course, lecture, data
    file = request.files['file']
    print(file.read())
    return "200"

@app.route('/signup', methods=['PUT'])
def signup():
    # ?email=ee3002@gmail.com&username=dip&password=password&user_id=0x000002

    # http://0.0.0.0:6000/signup?email=ee3002_test1@gmail.com&username=dip_test1&password=pass&user_id=0x000002
    req = request.args.to_dict()
    if len(req) <= 0:
        return 'test'

    email = req['email']
    password = req['password']
    username = req['username']
    user_id = req['user_id']

    db = client['nodemind'].auth
    if db.find_one({'username':username}):
        return "error: username already exists!"

    check = db.find_one({'email':email})
    bcrypt = Bcrypt()
    # Create a new user in auth and a empty record in the core database
    if not check:
        passcode = bcrypt.generate_password_hash(password)
        new_record = {
            'user_id':user_id,
            'username': username,
            'email_id': email,
            'password': bytes(passcode)
        }
        db.insert_one(new_record)
        client['nodemind'].core.insert_one({
            "user_id": user_id,
            "username": username,
            "email_id": email,
            "courses": [{
                "course_id": "",
                "course_name": "",
                "lectures": [{
                    "lecture": "",
                    "data": ""
                }]
            }]
        })
        return "success"
    else:
        return "error: user already exists!"

port = int(os.environ.get("PORT", 6000))

if __name__ == "__main__":
    '''
    1. build a new image : docker build -t nodemind-apis:{version} .
    2. docker ps
    3. docker commit dcc5a3116234  nodemind-apis:{version}
    4. heroku container:push web --app nodemind-apis
    5. heroku container:release web --app nodemind-apis
    '''

    '''
        GET https://nodemind-apis.herokuapp.com/auth?email=ee3002_test1@gmail.com&password=pass
        GET https://nodemind-apis.herokuapp.com/auth?email=ee3080@gmail.com&password=testpass
        PUT https://nodemind-apis.herokuapp.com/signup?email=ee3002_test2gmail.com&username=dip_test2&password=passcode&user_id=0x000003
    '''

    app.run(debug=True,host='0.0.0.0',port=port)

