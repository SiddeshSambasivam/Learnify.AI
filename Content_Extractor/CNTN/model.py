import chainer.functions as F
import chainer.links as L
from chainer import Chain

class CNTN(Chain):
	def __init__(self, output_channel, filter_length, filter_width, filter_height, n_units, n_label):
		super(CNTN, self).__init__(
			conv_doc = L.ConvolutionND(3, 1, output_channel, (filter_length, filter_width, filter_height)),
			l_doc = L.Linear(None, n_units),

			conv_word = L.ConvolutionND(3, 1, output_channel, (filter_length, filter_width, filter_height)),
			l_word = L.Linear(None, n_units),
			l_final = L.Linear(n_units+n_units, n_label),

		)
		
	def __call__(self, doc, word):
		doc = F.relu(self.conv_doc(doc))
		doc = F.max(doc, axis=2)

		word = F.relu(self.conv_word(word))
		word = F.max(word, axis=2)
	
		clayer = F.concat((doc, word))
		clayer = F.squeeze(clayer)
		y = F.relu(clayer)
		y = self.l_final(y)

		return y

'''
class CNTN(Chain):
	def __init__(self, output_channel, filter_length, filter_width, filter_height, n_units, n_label):
		super(CNTN, self).__init__(
			conv1 = L.ConvolutionND(3, 1, output_channel, (filter_length, filter_width, filter_height)),
			l1 = L.Linear(None, n_units),

			conv2 = L.ConvolutionND(3, 1, output_channel, (filter_length, filter_width, filter_height)),
			l2 = L.Linear(None, n_units),
			l3 = L.Linear(n_units+n_units, n_label),

		)
		
	def __call__(self, doc, word, feature):
		h1 = F.relu(self.conv1(doc))
		h1 = F.max(h1, axis=2)

		h3 = F.relu(self.conv2(word))
		h3 = F.max(h3, axis=2)
	
		h5 = F.concat((h1, h3))
		h5 = F.squeeze(h5)
		h5 = F.concat((h5, feature))
		y = F.relu(h5)
		y = self.l3(y)

		return y

'''
