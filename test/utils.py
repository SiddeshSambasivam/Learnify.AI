import spacy
import numpy as np
from sklearn.neighbors import NearestNeighbors

nlp = spacy.load("en_core_web_lg")

k = 3
vec_len = len(nlp("cosine").vector)


def intersect(keywords1, keywords2):
    """

    :param keywords1: list of kw from model 1
    :param keywords2: list of kw from model 2
    :return: common keywords list
    """
    intersect = set(keywords1) & set(keywords2)
    keywords = list(intersect)
    return keywords


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


def stemmer(keyword, kw_list):
    for i, kw in enumerate(kw_list):
        if keyword.find(kw_list) == 0:
            kw_list.remove(keyword)
    return kw_list


if __name__ == '__main__':
    # keywords = ['key', 'word', 'keyword', 'keyhole', 'english']
    list1 = ['words', 'word', 'key', 'keyword', 'keyhole', 'laptop', 'hello']
    list2 = ['words', 'word', 'cat', 'rand', 'key', 'laptop', 'hello']
    common = intersect(list1, list2)

    # Cal KNN, pass kw to KNN func
    graph = top_3(common)

    # print out nearest words for each keyword
    for i, nn in enumerate(graph):
        print('\n---', common[i], '---')
        for j, indicator in enumerate(nn):
            if common[j] == common[i]:
                continue
            elif indicator == 1:
                print(common[j])

    for kw in list1:
        list1 = stemmer(kw, list1)


# print(similarity('key', 'keyword'))
# print(similarity('key', 'word'))
# print(similarity('keyhole', 'word'))
# print(similarity('english', 'word'))

