from pymongo import MongoClient
from config import USERNAME, PASSWORD
import json

client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")

data=client['nodemind'].core
userdata = data.find({'email_id':"siddesh@gmail.com"})[0]

with open('./ee3002 microprocessors_dumps.json') as json_file:
    microp = json.load(json_file)

with open('./Semiconductors_dumps.json') as json_file:
    semicon = json.load(json_file)

# print(microp.keys(), '\n', semicon.keys())
insert = {
    "ee3002 microprocessors":microp,
    "Semiconductors":semicon
}

for i,course in enumerate(["ee3002 microprocessors", "Semiconductors"]):

    userdata["courses"][i]["keywords"] = insert[course]

data.update(
    {'email_id':"siddesh@gmail.com"},
    {
        '$set':{
            'courses':userdata["courses"]
        }
    }
)




