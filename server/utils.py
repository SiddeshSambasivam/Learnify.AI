from pymongo import MongoClient
from config import USERNAME, PASSWORD
from sklearn.neighbors import NearestNeighbors
from gensim.parsing.preprocessing import remove_stopwords
import numpy as np
import spacy
import pprint
from tqdm import tqdm
import spacy
import json

sp = spacy.load('en_core_web_sm')
all_stopwords = sp.Defaults.stop_words
pp = pprint.PrettyPrinter(indent=4)

from transformers import BartTokenizer, BartForConditionalGeneration, BartConfig
model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')

def summarise(text):
    print('[!] Tokenizing texts')
    inputs = tokenizer([text], max_length=1024, return_tensors='pt')
    print('[!] Summarising texts')
    summary_ids = model.generate(inputs['input_ids'], num_beams=6, early_stopping=True,max_length=300,min_length=100)
    return [tokenizer.decode(g, skip_special_tokens=True, clean_up_tokenization_spaces=False) for g in summary_ids][0]


def summarizeCourse(lectureDocs):
    '''
    Reference: https://github.com/arumugam666/eduGraph/blob/master/complete_pipeline.py
    {
        "1":{
            "keywords": summary
        }
    }
    '''

    master = dict()
    for i, (lec, (text, keys)) in enumerate(lectureDocs.items()):
        # print('text', text)
        # print('\n\nkeys: ', keys)
        doc1 = sp(text)
        sents = list(doc1.sents)
        key_sentence_dict = dict()
        for keyphrase in tqdm(keys):
            popped = 0

            key_sentence_dict[keyphrase] = []
            for ind,sent in enumerate(sents):
                sent = str(sent)
                sent= sent.lower()
                if keyphrase in sent:
                    if len(key_sentence_dict[keyphrase]) < 5:
                        key_sentence_dict[keyphrase].append(sent)

            corpus = " ".join(key_sentence_dict[keyphrase])
            print(f'Key: {keyphrase} => {len(corpus)}')
            # print(f'summary: {summarise(corpus)}\n')
            key_sentence_dict[keyphrase] = summarise(corpus)

        # print(key_sentence_dict)
        master[lec] = key_sentence_dict
    
    return master


def top_3(keywords):
    """
    unormalised vector used to calculated knn.
    KNN calculated with Sklearn
    out

    :return: knn sparse graph matrix
    """
    kws_len = len(keywords)
    k = 3
    nlp = spacy.load("en_core_web_lg")
    vecs = np.zeros((kws_len, len(nlp("cosine").vector)), dtype=float)
    for i, kw in enumerate(keywords):
        word = nlp(kw)
        vec = np.array(word.vector)
        vecs[i] = vec

    nbrs = NearestNeighbors(n_neighbors=k+1, algorithm='ball_tree').fit(vecs)

    graph = nbrs.kneighbors_graph(vecs).toarray()

    return graph

def isSubstring(str1:str, dictionary:list) -> bool:
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

def createGraph(keywords):
    list1 = []
    list2 = []
    for i, kw in enumerate(keywords):
        list1.append((i, kw))  # list w index number
        if not isSubstring(kw,list2):
            list2.append(kw) # list w just keywords

    graph = top_3(list2)
    print("\ncreating sparse graph")
    for i, nn in tqdm(enumerate(graph)):
        # print('\n---', list2[i], '---')
        for j, indicator in enumerate(nn):
            if list2[j] == list2[i]:
                continue
            elif indicator == 1:
                # print(list2[j])
                pass
    
    return graph, list2

def getGraphs(lectures):
    graphs = []
    lectureDocs = dict()
    for lecture in lectures:
        if lecture['lecture'] != "":
            graphs.append(lecture["graph"]['nodes'])
            nodes = []
            for node in lecture["graph"]['nodes']:
                if node['id'] != '':
                    nodes.append(node['id'])

            lectureDocs[lecture['lecture']] = [
                lecture["data"],
                nodes
            ]
    
    return graphs, lectureDocs

def clean(text:str):
    text = remove_stopwords(text)
    text_tokens = text.split()
    tokens_without_sw= [word for word in text_tokens if not word in all_stopwords]
    result = ' '.join(tokens_without_sw)

    return result

def mergeGraphs(graphs):
    '''
    graphs = [    
        {
            Nodes:[],
        },
        {
            Nodes:[],
            Links:[]
        }
    ]

    output = {
        "node":Node
    }

    masterList = ["node1",  "node2", ... "nodeN"]
    '''
    masterKeywords = []
    output = {}
    for graph in graphs:
        for node in graph:
            print(node)
            node_id = node["id"]
            # node["id"] = node_id
            output[node_id] = node
            masterKeywords.append(node_id)
    
    return output, masterKeywords

def similarity(kw1, kw2, nlp):
    """
    multi-gram word vector = average vector of words
    :return: normalised similarity between 2 key terms score
    """
    doc1 = nlp(kw1)
    doc2 = nlp(kw2)
    return doc1.similarity(doc2)

def parseGraph(keywordList, keywordDict, sparseGraph):
    parseData = {
        "nodes":[],
        "links":[]
    }
    nodes, links = [], []
    for kw in keywordList:
        # print(kw)
        sample = {
            "id":kw,
            "group":keywordDict[kw]["group"]
        }
        nodes.append(sample)
    parseData["nodes"] = nodes
    # print(parseData)
    # print(sparseGraph)
    nlp = spacy.load("en_core_web_lg")
    print('\nCreating Sparse Graphs')
    for i, nn in tqdm(tqdm(enumerate(sparseGraph))):
        for j, indicator in enumerate(nn):
            if keywordList[j] == keywordList[i]:
                continue
            elif indicator == 1:
                # 10 is arbitrary value
                value = similarity(keywordList[i], keywordList[j], nlp) * 5
                sample = {
                    "source":keywordList[i],
                    "target":keywordList[j],
                    "value": int(value)
                }
                # print(sample)
                links.append(sample)

    parseData["links"] = links
    return parseData

if __name__ == "__main__":
    client = MongoClient(f"mongodb+srv://{USERNAME}:{PASSWORD}@cluster0.symhm.gcp.mongodb.net/test")
    db = client['nodemind'].core
    courses = db.find({'email_id':"siddesh@gmail.com"})[0]["courses"]
    masterCourses = {}
    ''' 
    mastercourse = {
        "course":{
            Nodes:[],
            Links:[]
        }
    }
    '''
    # for course in courses[1]:
    #     name = course["course_name"]
    #     if len(course["lectures"]) > 1:
    #         graphs, lectureDocs = getGraphs(course["lectures"][1:])
    #         print(name)
    #         nodes, nodeList = mergeGraphs(graphs)
    #         sparseGraph, keywordList = createGraph(nodeList)
    #         # print(keywordList)
    #         # parsedGraph = parseGraph(keywordList, nodes, sparseGraph)
    #         master = summarizeCourse(lectureDocs)
    #         filepath = './' + name + '_dumps.json'
    #         with open(filepath, 'w') as outfile:
    #             json.dump(master, outfile, indent=4)    
    #         # masterCourses[name] = parsedGraph

    name = courses[1]["course_name"]
    graphs, lectureDocs = getGraphs(courses[1]["lectures"][1:])
    print(name)
    nodes, nodeList = mergeGraphs(graphs)
    sparseGraph, keywordList = createGraph(nodeList)
    # print(keywordList)
    # parsedGraph = parseGraph(keywordList, nodes, sparseGraph)
    master = summarizeCourse(lectureDocs)
    filepath = './' + name + '_dumps.json'
    with open(filepath, 'w') as outfile:
        json.dump(master, outfile, indent=4)    
    # pp.pprint(masterCourses)


# Iterate through each of the course
# get all the nodes from the lectures for each course.

# get all the instances for each keyword and create a corpus for each keyword
# summarize the corpus and assign it as the value to the node_id key

# when new lecture is added 
# get all the nodes and summarize the corpus and add it to the course's
# summary page.
