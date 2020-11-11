import yake
from utils import top_3
from typing import List
from sklearn.neighbors import NearestNeighbors
import numpy as np
import spacy
import os
import json
from tqdm import tqdm


# text = open("./EE3002C.txt", "r", encoding='UTF-8').read()

class keywordExtractor:

    def __init__(
        self,
        path:str,
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
        self.text = open(path, "r", encoding='UTF-8').read()
    
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
            print(kw)

            list1.append((i, kw[1]))  # list w index number
            if not keywordExtractor.isSubstring(kw[1],list2):
                list2.append(kw[1]) # list w just keywords

        graph = top_3(list2)

        for i, nn in enumerate(graph):
            print('\n---', list2[i], '---')
            for j, indicator in enumerate(nn):
                if list2[j] == list2[i]:
                    continue
                elif indicator == 1:
                    print(list2[j])
        
        return graph, list2

    @staticmethod
    def top_3(keywords):
        """
        unormalised vector used to calculated knn.
        KNN calculated with Sklearn
        out

        :return: knn sparse graph matrix
        """
        kws_len = len(keywords)

        vecs = np.zeros((kws_len, vec_len), dtype=float)
        for i, kw in enumerate(keywords):
            word = nlp(kw)
            vec = np.array(word.vector)
            vecs[i] = vec

        nbrs = NearestNeighbors(n_neighbors=k+1, algorithm='ball_tree').fit(vecs)
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
    def parseGraph(keywords, lect_num, sparseGraph, filePath):
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
                    print(sample)
                    links.append(sample)

        parseData["links"] = links
        # print(parseData)
        # with open(filePath+'dumps.json', 'w') as outfile:
        #     json.dump(parseData, outfile, indent=4)    
        return parseData

if __name__ == "__main__":
    ke = keywordExtractor(path="./EE3002C.txt")
    graph, keywordList = ke.createGraph()
    filepath = './'
    keywordExtractor.parseGraph(keywordList, 3, graph, filepath)