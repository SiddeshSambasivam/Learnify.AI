# given lecture and time I should render the graoh for the graph
from pymongo import MongoClient
from config import USERNAME, PASSWORD
from app import keywordExtractor
from tqdm import tqdm
import json

def topTopics(email:str,courseName:str, lectureNo:str):

    client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")
    db = client['nodemind'].core
    print( courseName, lectureNo)
    courses = db.find({'email_id':email})[0]["courses"]
    for i,course in enumerate(courses):
        name = course["course_name"]
        
        if name == courseName:
            print(name)
            if len(course["lectures"]) > 1:
                
                for j, lecture in enumerate(courses[i]["lectures"]):            
                    # print('name of the course', lecture, lectureNo)
                    # print('name of the course', lecture, lectureNo)
                    if lecture["lecture"] == int(lectureNo):                        
                        passData = lecture["data"]
                        break
    
    ke = keywordExtractor()
    # print('name of the course',courses[i]["lectures"][j]["data"])
    ke.text = passData
    
    keywordList = ke.custom_kw_extractor.extract_keywords(passData) 
    kw = sorted(keywordList, key=lambda x: x[0], reverse=True)
    print(*kw, sep='\n')


    graph, keywordList = ke.createGraph()
    KG = keywordExtractor.parseGraph(keywordList, 4, graph)
    # print(len(KG["nodes"]), len(kw))

    min2master = {}

    for v in tqdm(range(3, len(KG["nodes"]))):
        master = {
            "nodes":[],
            "links":[]
        }
        selects = []
        # print()
        # print("Number of nodes= ", v)/
        for pair in kw[:v]:
            selects.append(pair[1])
        # print('printing the selected topics= ',selects)
        for node in KG["nodes"]:
            if node["id"] in selects and node["id"] not in master["nodes"]:
                master["nodes"].append(node)
                # print('added ', node["id"])
        for link in KG["links"]:
            if link['source'] in selects and link["target"] in selects and link not in master["links"]:
                master["links"].append(link)        
        
        min2master[str(v)] = {
            "graph": master,
            "nodesList":selects,
        }
        # print(v, str(v), len(min2master))
        
    
    # filepath = './session_dumps.json'
    # with open(filepath, 'w') as outfile:
    #     json.dump(min2master, outfile, indent=4)    

    return min2master


if __name__ == "__main__":
    topTopics("siddesh@gmail.com", "Semiconductors", 1)


# /email=siddesh@gmail.com&course=Semiconductors&lecture=1
    