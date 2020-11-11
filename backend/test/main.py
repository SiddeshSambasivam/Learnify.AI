import yake
from utils import top_3
from typing import List
from sklearn.neighbors import NearestNeighbors
import numpy as np
import spacy
import os


# text = open("./EE3002C.txt", "r", encoding='UTF-8').read()

class keywordExtractor:

    def __init__(self, path:str, k:int=3) -> None:
        self.text = open("./EE3002C.txt", "r", encoding='UTF-8').read()
        self.nlp = spacy.load("en_core_web_lg")
        self.vec_len = len(nlp("cosine").vector)
        self.k = k

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
    def similarity(kw1, kw2):
        """
        multi-gram word vector = average vector of words
        :return: normalised similarity between 2 key terms score
        """
        doc1 = nlp(kw1)
        doc2 = nlp(kw2)
        return doc1.similarity(doc2)

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


# General settings
language = "en"
max_ngram_size = 3  # default 3, seems to be best performing
numOfKeywords = 50  # default = 20

# Duplication removal
deduplication_thresold = 0.9
deduplication_algo = 'seqm'
windowSize = 1

# Init kw extractor
custom_kw_extractor = yake.KeywordExtractor(lan=language, n=max_ngram_size, dedupLim=deduplication_thresold, dedupFunc=deduplication_algo, windowsSize=windowSize, top=numOfKeywords, features=None)

# Extract kw
keywords = custom_kw_extractor.extract_keywords(text)

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

list = []
list2 = []
for i, kw in enumerate(keywords):
    print(kw)

    list.append((i, kw[1]))  # list w index number
    if not isSubstring(kw[1],list2):
        list2.append(kw[1]) # list w just keywords

graph = top_3(list2)

for i, nn in enumerate(graph):
    print('\n---', list2[i], '---')
    for j, indicator in enumerate(nn):
        if list2[j] == list2[i]:
            continue
        elif indicator == 1:
            print(list2[j])

