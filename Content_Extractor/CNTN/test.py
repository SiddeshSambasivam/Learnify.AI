import args
import chainer.links as L
import chainer
import data_handler as dh
import model as cntn
import numpy as np
import sys
from chainer import Chain, optimizers, serializers, Variable
from util import key2value

###load arguments
arg = args.process_command()
testing_url = arg.predict
doc_len = arg.dlen
word_len = arg.wlen
word_dim = arg.wdim
n_units = arg.hdim
n_label = arg.label
filter_length = arg.flen
filter_width = word_len
filter_height = word_dim
output_channel = arg.c
batch_size = arg.b
n_epoch = arg.e
model_url = arg.model

###load dataset
testing = open(testing_url).readlines()
dataset = dh.load_data(testing, doc_len, word_len )

x_train = dataset['source']
keyword_train = dataset['keyword']
y_train = dataset['target']
docs = dataset['docs']
words = dataset['words']

###load model
print 'model:\t\t{}'.format( model_url )
print 'predicted files:{}'.format( testing_url )

model = cntn.CNTN(output_channel, filter_length, filter_width, filter_height, n_units, n_label)
cf = L.Classifier(model)
optimizer = optimizers.Adam()
optimizer.setup(cf)

print '###\tload model'
serializers.load_npz(model_url, model)
N = len(testing)
print '---\tpredict\t\t---'

learned_y = []

sum_test_loss = 0.0
sum_test_acc = 0.0

slen = lambda a, b, c: c if a-b > c else a-b

for i in xrange(0, N, batch_size ):
	_ = slen(N, i, batch_size)
 
	x = chainer.Variable(np.asarray(map( key2value,  x_train[i:i+_], [docs]*_)).astype(np.float32)).reshape(-1, 1, doc_len, word_len, word_dim)
	w = chainer.Variable(np.asarray(map( key2value, keyword_train[i:i+_], [words]*_)).astype(np.float32)).reshape(-1, 1, doc_len, word_len, word_dim)
	t = chainer.Variable(np.asarray(y_train[i:i+batch_size]).astype(np.int32))
		#f = chainer.Variable(np.asarray(f_train[i:i+batch_size]))
	f = []

	
	y= cf(x, w, t)
	y0 = model(x, w)	
	sum_test_loss += float(y.data) * len(t.data)
	sum_test_acc += float(cf.accuracy.data) * len(t.data)
	learned_y.extend(y0.data)
	

#print 'testing mean loss = {}, accuracy = {}'.format(sum_test_loss/len(testing), sum_test_acc/len(testing)) 

print '---\tfin\t\t---'

predicted = [np.argmax(learned_y[i]) for i in xrange(len(learned_y))]

print '---\toutput\t\t---'

with open( 'predicted_score', 'wb') as f:
	for i in xrange(len(predicted)):
		f.write('{}\n'.format(predicted[i]))



