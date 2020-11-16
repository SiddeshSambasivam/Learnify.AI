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
import yake
from typing import List
from sklearn.neighbors import NearestNeighbors
import numpy as np
import spacy
from tqdm import tqdm
from utils import *
from session import * 

app = flask.Flask(__name__)
app.config["DEBUG"] = True
jwt = JWTManager(app)
CORS(app)
EMAIL = ''

client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
# 'thisisasipprojectanditsnameisnodemind'

app.config['JWT_ACCESS_COOKIE_PATH'] = '/app/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/token/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['CORS_HEADERS'] = 'Content-Type'

# Set the secret key to sign the JWTs with
app.config['JWT_SECRET_KEY'] = 'e4aa2564fefc8a421232c895233838f3f66ab305ef508e47597b27ff744b6131'

class keywordExtractor:

    def __init__(
        self,
        path:str=None,
        language:str = "en",
        max_ngram_size:int = 3,  
        numOfKeywords:int = 50,       
        deduplication_threshold:float = 0.9,
        deduplication_algo:str = 'seqm',
        windowSize = 1,
        k=3):

        self.language = language
        self.max_ngram_size = max_ngram_size  
        self.numOfKeywords = numOfKeywords
        self.deduplication_threshold = deduplication_threshold 
        self.deduplication_algo = deduplication_algo 
        self.windowSize = windowSize

        self.custom_kw_extractor = yake.KeywordExtractor(
            lan=language, n=max_ngram_size, dedupLim=deduplication_threshold, 
            dedupFunc=deduplication_algo, windowsSize=windowSize, 
            top=numOfKeywords, features=None)

        self.nlp = spacy.load("en_core_web_lg")
        self.vec_len = len(self.nlp("cosine").vector)
        self.k = k
        if path != None:
            self.text = open(path, "r", encoding='UTF-8').read()
        else:
            self.text = ''
    
    @staticmethod
    def isSubstring(str1:str, dictionary:List) -> bool:
        if len(dictionary) <=0:
            return False

        m = len(str1)
        for str2 in dictionary:
            val = float('inf')
            n = len(str2)
            if m>n:
                val = min(str1.find(str2), val)
            else:
                val = min(str2.find(str1), val)

        if val == -1:
            return False

        return True

    def createGraph(self):
        keywords = self.custom_kw_extractor.extract_keywords(self.text) 
        list1 = []
        list2 = []
        for i, kw in enumerate(keywords):
            # print(kw)

            list1.append((i, kw[1]))  # list w index number
            if not keywordExtractor.isSubstring(kw[1],list2):
                list2.append(kw[1]) # list w just keywords

        graph = self.top_3(list2)

        for i, nn in enumerate(graph):
            # print('\n---', list2[i], '---')
            for j, indicator in enumerate(nn):
                if list2[j] == list2[i]:
                    continue
                elif indicator == 1:
                    # print(list2[j])
                    pass
        
        return graph, list2

    # @staticmethod
    def top_3(self, keywords):
        """
        unormalised vector used to calculated knn.
        KNN calculated with Sklearn
        out

        :return: knn sparse graph matrix
        """
        kws_len = len(keywords)

        vecs = np.zeros((kws_len, self.vec_len), dtype=float)
        for i, kw in enumerate(keywords):
            word = self.nlp(kw)
            vec = np.array(word.vector)
            vecs[i] = vec

        nbrs = NearestNeighbors(n_neighbors=self.k+1, algorithm='ball_tree').fit(vecs)
        # distances, indices = nbrs.kneighbors(vecs)

        graph = nbrs.kneighbors_graph(vecs).toarray()
        # print(graph)

        return graph

    @staticmethod
    def intersect(keywords1, keywords2):
        """

        :param keywords1: list of kw from model 1
        :param keywords2: list of kw from model 2
        :return: common keywords list
        """
        intersect = set(keywords1) & set(keywords2)
        keywords = list(intersect)
        return keywords

    @staticmethod
    def similarity(kw1, kw2, nlp):
        """
        multi-gram word vector = average vector of words
        :return: normalised similarity between 2 key terms score
        """
        doc1 = nlp(kw1)
        doc2 = nlp(kw2)
        return doc1.similarity(doc2)
    
    @staticmethod
    def parseGraph(keywords, lect_num, sparseGraph):
        parseData = {
            "nodes":[],
            "links":[]
        }
        nodes, links = [], []
        for kw in keywords:
            sample = {
                "id":kw,
                "group":lect_num
            }
            nodes.append(sample)
        parseData["nodes"] = nodes
        # print(parseData)
        # print(sparseGraph)
        nlp = spacy.load("en_core_web_lg")
        for i, nn in tqdm(enumerate(sparseGraph)):
            for j, indicator in enumerate(nn):
                if keywords[j] == keywords[i]:
                    continue
                elif indicator == 1:
                    # 10 is arbitrary value
                    value =  keywordExtractor.similarity(keywords[i], keywords[j], nlp) * 10
                    sample = {
                        "source":keywords[i],
                        "target":keywords[j],
                        "value": int(value)
                    }
                    # print(sample)
                    links.append(sample)

        parseData["links"] = links
        # print(parseData)
        # with open(filePath+'dumps.json', 'w') as outfile:
        #     json.dump(parseData, outfile, indent=4)    
        return parseData

@app.route('/summarise', methods=['GET'])
def summariser():
    # return 'hello'
    text = request.args.to_dict()['text']
    inputs = tokenizer([text], max_length=1024, return_tensors='pt')
    summary_ids = model.generate(
        inputs['input_ids'], 
        num_beams=6, early_stopping=True,
        max_length=10000,min_length=1000
    )
    return [tokenizer.decode(g, skip_special_tokens=True, clean_up_tokenization_spaces=False) for g in summary_ids][0]

@app.route('/addcourse', methods=['PUT'])
def addCourse():
    course = request.args.to_dict()['course']
    email = request.args.to_dict()['email']
    data=client['nodemind'].core
    newcourse = {
        'course_name':course,
        'lectures':[{
            'lecture':'',
            'data':'',
            'graph':{}
        }],
        "courseGraph":{}
    }
    data.update(
        {'email_id':email},
        {
            '$push':{'courses':newcourse}
        }
    )

    return {"debug":"200"}

@app.route('/deleteUser', methods=['PUT'])
def deleteUser():
    pass

@app.route('/getData', methods=['GET'])
def getData():
    email = request.args.to_dict()['email']
    db = client['nodemind'].core
    user_data = db.find({'email_id':email})[0]
    del user_data['_id']
    
    access_token = create_access_token(identity=email)
    user_data['access_token'] = access_token
    # global EMAIL 
    # EMAIL = email
    user_data['debug']='200'
    return user_data

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

@app.route('/integrate', methods=['GET'])
def integrateGraphs():
    db = client['nodemind'].core
    email = request.args.to_dict()["email"]
    courseName = request.args.to_dict()["course"]
    courses = db.find({'email_id':email})[0]["courses"]
    data=client['nodemind'].core
    print('intergrating graphs: ', courseName)
    masterCourses = {}
    ''' 
    mastercourse = {
        "course":{
            Nodes:[],
            Links:[]
        }
    }
    '''
    userdata = db.find({'email_id':email})[0]
    for i,course in enumerate(courses):
        name = course["course_name"]
        if name == courseName:
            if len(course["lectures"]) > 1:
                graphs, lectureDocs = getGraphs(course["lectures"][1:])
                print(name)
                nodes, nodeList = mergeGraphs(graphs)
                sparseGraph, keywordList = createGraph(nodeList)
                parsedGraph = parseGraph(keywordList, nodes, sparseGraph)
                # masterCourses[name] = parsedGraph
                userdata["courses"][i]["courseGraph"] = parsedGraph
            break

    # pp.pprint(masterCourses)
    # 'course_name':courseName
    
    
    data.update(
        {'email_id':email},
        {
            '$set':{
                'courses':userdata["courses"]
            }
        }
    )

    return {"debug":"200"}

@app.route('/extract', methods=['PUT'])
def upload_files():    
    UPLOAD_FOLDER = './tmps/'

    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    # ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'docx', 'pptx', 'doc'}
    ALLOWED_EXTENSIONS = {'txt'}
    
    
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    file = request.files['file']
    course_name = request.args.to_dict()['course']
    email = request.args.to_dict()['email']

    print(course_name)
    if file.filename == '':
        flash('No selected file')
        # return 
    if file and allowed_file(file.filename):
        filename =file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    

    db = client['nodemind'].core
    # print('email', email)
    user_data = db.find({'email_id':email})[0]
    # print(user_data['courses'])
    for idx, course in enumerate(user_data['courses']):
        
        if course['course_name'] == course_name:
            selectedData = course
            # print("course", selectedData)
            break

    text = open(UPLOAD_FOLDER+f'{filename}', "r", encoding='UTF-8').read()
    print("for course: ", course_name)
    print("number of lectures: ", len(selectedData['lectures']))
    lecture_number = len(selectedData['lectures'])
    print("adding lecture: ", len(selectedData['lectures']))
    if lecture_number == 0:
        lecture_number = 1

    ke = keywordExtractor(path=UPLOAD_FOLDER+f'{filename}')
    graph, keywordList = ke.createGraph()
    KG = keywordExtractor.parseGraph(keywordList, lecture_number, graph)

    selectedData['lectures'].append(
        {
            "lecture": lecture_number,
            "data": text,
            "graph": KG
        }
    )
    user_data['courses'][idx] = selectedData
    
    db.update(
        {'email_id':email},
        {
            '$set':{
                'courses':user_data['courses']
            }
        }
    )
    
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
                "course_name": "",
                "lectures": [{
                    "data": "",
                    "graph":{}
                }],
                "courseGraph":{},
                "keywords":{}
            }]
        })
        return {"debug":"200"}
        
@app.route('/dynamicGraphs', methods=["GET"])
def dynamicGraphs():
    email = request.args.to_dict()["email"]
    course = request.args.to_dict()["course"]
    lectureNo = str(request.args.to_dict()["lecture"]) # in str

    result = topTopics(email, course, lectureNo)
    print('after', result["3"])
    return result




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

