from pymongo import MongoClient
from config import USERNAME, PASSWORD
from flask import request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_bcrypt import Bcrypt
import flask
import os
from builtins import bytes
from documentReader import pdfReader, docxReader, pptReader
from flask_cors import CORS, cross_origin
import json

app = flask.Flask(__name__)
app.config["DEBUG"] = True
jwt = JWTManager(app)
CORS(app)
EMAIL = ''

# from transformers import BartTokenizer, BartForConditionalGeneration, BartConfig
# model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
# tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')


'''
To-Do

2. Code the function which converts the read text into a huge paragraph 
1.1 Create an API for both the models -> Keyword extraction, Summ
3. Adding content -> What the platform is about?, introduction, docs (user guide), logo
2. Code the profile page
1.2 Delete User


1.3 Add new courses
3. Function, which need find knn for any given word and a list of other key words 
4. function to covert these edges into the format requeired by the react component
1. Code the knowledge graph and the courses page
'''


def fun(string:str):
    ...
    return string

@app.route('/summarise', methods=['GET'])
def summarise():
    # return 'hello'
    text = request.args.to_dict()['text']
    inputs = tokenizer([text], max_length=1024, return_tensors='pt')
    summary_ids = model.generate(
        inputs['input_ids'], 
        num_beams=6, early_stopping=True,
        max_length=10000,min_length=1000
    )
    return [tokenizer.decode(g, skip_special_tokens=True, clean_up_tokenization_spaces=False) for g in summary_ids][0]
    
client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
# 'thisisasipprojectanditsnameisnodemind'

app.config['JWT_ACCESS_COOKIE_PATH'] = '/app/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/token/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['CORS_HEADERS'] = 'Content-Type'

# Set the secret key to sign the JWTs with
app.config['JWT_SECRET_KEY'] = 'e4aa2564fefc8a421232c895233838f3f66ab305ef508e47597b27ff744b6131'

@app.route('/addcourse', methods=['PUT'])
def addCourse():
    pass

@app.route('/deleteUser', methods=['PUT'])
def deleteUser():
    pass

@app.route('/auth', methods=['GET'])
def authenticate():
    bcrypt = Bcrypt()
    
    req = request.args.to_dict()
    email = req['email']
    password = req['password']
    
    auth=client['nodemind'].auth
    
    response = auth.find_one({'email_id': email})
    user_data = dict()

    if not response:
        user_data = dict()
        user_data['debug'] = '404'
        # User not found
        return jsonify(user_data)

    if bcrypt.check_password_hash(response['password'], password):
        
        print('Auth success')
        db = client['nodemind'].core
        user_data = db.find({'email_id':response['email_id']})[0]
        del user_data['_id']
        
        access_token = create_access_token(identity=email)
        user_data['access_token'] = access_token
        global EMAIL 
        EMAIL = email
        user_data['debug']='200'
        return user_data
    else:
        user_data['debug'] = '401'
        return user_data

@app.route('/summarizer', methods=['GET'])
def summarizer():
    return "hello"

@app.route('/extract', methods=['PUT'])
def upload_files():    
    UPLOAD_FOLDER = './tmps/'

    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'docx', 'pptx', 'doc'}
    
    
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    file = request.files['file']
    print(file)
    if file.filename == '':
        flash('No selected file')
        return 
    # if file and allowed_file(file.filename):
    #     filename =file.filename
    #     file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    # data = pdfReader(UPLOAD_FOLDER+f'{filename}')
    # data = docxReader(UPLOAD_FOLDER+f'{filename}')
    # print(data.getText())
    # print(data.getText(start=1))
    return {"code":"200"}

@app.route('/signup', methods=['PUT'])
def signup():

    req = request.args.to_dict()

    email = req['email']
    password = req['password']
    username = req['username']
    user_id = req['user_id']

    # 409 => Username exists
    # 410 => email already registered

    db = client['nodemind'].auth
    if db.find_one({'username':username}):
        return {"debug":"409"}
    
    if db.find_one({'email_id':email}):
        return {"debug":"410"}

    check = db.find_one({'email_id':email})
    print()
    bcrypt = Bcrypt()
    print(check)
    if not check:
        
        passcode = bcrypt.generate_password_hash(password)
        
        new_record = {
            'user_id':user_id,
            'username': username,
            'email_id': email,
            'password':passcode.decode("utf-8") 
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
        return {"debug":"200"}
        

port = int(os.environ.get("PORT", 10000))

if __name__ == "__main__":
    '''
    1. build a new image : docker build -t nodemind-apis:{version} .
    2. docker ps
    3. docker commit dcc5a3116234  nodemind-apis:{version}
    4. heroku container:push web --app nodemind-apis
    5. heroku container:release web --app nodemind-apis
    '''

    '''
        Test API calls
        GET https://nodemind-apis.herokuapp.com/auth?email=siddesh@gmail.com&password=testpass
        GET https://nodemind-apis.herokuapp.com/auth?email=ee3002_test1@gmail.com&password=pass

        PUT https://nodemind-apis.herokuapp.com/signup?email=ee3080@gmail.com&username=dip&password=passcode&user_id=0x000003
        GET https://nodemind-apis.herokuapp.com/auth?email=ee3080@gmail.com&password=passcode
        
    '''

    app.run(debug=True,host='0.0.0.0',port=port)

