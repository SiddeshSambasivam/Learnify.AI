import args
import chainer.links as L
import chainer
import data_handler as dh
import model as cntn
import numpy as np
import sys
from chainer import Chain, cuda, optimizers, serializers, Variable
from util import key2value

###load arguments
arg = args.process_command()
train_url = arg.train
doc_len = arg.dlen
word_len = arg.wlen
word_dim = arg.wdim
n_units = arg.hdim
n_label = arg.label
filter_length = arg.flen
filter_width = word_len
filter_height = word_dim
output_channel = arg.channel
batch_size = arg.batch
n_epoch = arg.epoch
output_model = arg.model
gpu = arg.gpu

print 'doc len\t\t:\t{}'.format(doc_len)
print 'word len\t:\t{}'.format(word_len)
print 'word dim\t:\t{}'.format(word_dim)
print '# of hidden\t:\t{}'.format(n_units)
print '# of output\t:\t{}'.format(n_label)
print 'filter size\t:\t{}x{}x{}'.format(filter_length, filter_width, filter_height)
print 'batch size\t:\t{}'.format(batch_size)

###load model
model = cntn.CNTN(output_channel, filter_length, filter_width, filter_height, n_units, n_label)
cf = L.Classifier(model)
optimizer = optimizers.Adam()
optimizer.setup(cf)

###load dataset
training = open(train_url).readlines()
dataset = dh.load_data( training, doc_len, word_len )

x_train = dataset['source']
keyword_train = dataset['keyword']
y_train = dataset['target']
docs = dataset['docs']
words = dataset['words']

N = len(training)
print '# of training\t:\t{}'.format(N)

###gpu setting
if gpu == -1:
	xp = np
	print '###\tUsing CPU'
else:
	cuda.get_device(gpu).use()
	xp = cuda.cupy
	model.to_gpu(gpu)
	print '###\tUsing GPU Device {}'.format(gpu)


print '\n###\ttraining '
print '{}\tloss\t\taccuracy'.format(n_epoch)

slen = lambda a, b, c: c if a-b > c else a-b

for epoch in xrange(1, n_epoch+1):
	sum_train_loss = 0.0
	sum_train_accuracy = 0.0
	
	#total_loss = []

	for i in xrange(0, N, batch_size):
		_ = slen(N, i, batch_size)
 	
		x = chainer.Variable(xp.asarray(map( key2value, x_train[i:i+_], [docs]*_)).astype(xp.float32)).reshape(-1, 1, doc_len, word_len, word_dim)
		w = chainer.Variable(xp.asarray(map( key2value, keyword_train[i:i+_], [words]*_)).astype(xp.float32)).reshape(-1, 1, doc_len, word_len, word_dim)
		t = chainer.Variable(xp.asarray(y_train[i:i+_]).astype(xp.int32))
		optimizer.update(cf, x, w, t)

		sum_train_loss += float(cf.loss.data) * len(t.data)
		sum_train_accuracy += float(cf.accuracy.data) * len(t.data)

		#total_loss.append(sum_train_loss)
	print '{}\t{}\t{}'.format(epoch, sum_train_loss/N, sum_train_accuracy/N)

###save model
print '###\tsave model'
serializers.save_npz( output_model, model )
