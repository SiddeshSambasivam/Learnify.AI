from collections import deque
from numpy import concatenate, zeros

boc = 'abcdefghijklmnopqrstuvwxyz'

def getBOC():
	return boc

def char2idx( c ):
	v = (len(boc)+1)*[0]
	if c in boc:
		v[boc.index(c)] = 1
	else:
		v[len(boc)] = 1
	return v

def vector( word, length=30 ):
	wov = []
	
	if len(word) <= length:
		wov = map(char2idx, word)

		z =  zeros((length-len(wov), len(boc)+1))
		wov = concatenate((wov, z), axis=0)
	
		return wov
	else:
		return zeros((length, len(boc)+1))

