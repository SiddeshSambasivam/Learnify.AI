# Keyword Extraction with Character-level Convolutional Neural Tensor Networks
## 1. Introduction
Keywordextractionisacriticaltechniqueinnaturallanguageprocessing. For this essential task we present a simple yet efficient architecture involving character-level convolutional neural tensor networks. The proposed architecture learns the relations between a document and each word within the document and treats keyword extraction as a supervised binary classification problem. In contrast to traditional supervised approaches, our model learns the distributional vector representations for both documents and words, which directly embeds semantic information and background knowledge without the need for handcrafted features.
Most importantly, we model semantics down to the character level to capture morphological information about words, which although ignored in related lit- erature effectively mitigates the unknown word problem in supervised learning approaches for keyword extraction. In the experiments, we compare the proposed model with several state-of-the-art supervised and unsupervised approaches for keyword extraction. Experiments conducted on two datasets attest the effectiveness of the proposed deep learning framework in significantly outperforming several baseline methods.

### 1.1. Requirements
- python2.7
- Chainer
- nltk

if using GPU
- cupy

### 1.2. Datasets

We provide two dataset, SemEval2013 and Inspec, and the original version is from
https://github.com/snkim/AutomaticKeyphraseExtraction

```
|--data/
  |--semeval_wo_stem
  |--inspec_wo_stem
  |--test.txt
```

The dataset we used is from Hulth2003 and SemEval2010 with removing stopwords and stemming. And it contains a toy testing document.

### 1.3. Getting Started
#### Download
```
$ git clone https://github.com/cnclabs/CNTN
$ cd ./CNTN
```

#### Install python packages:
```
$ pip install -r requirements.txt
```

## 2. Usage
The model we provided is trained by **semeval_wo_stem** and is for the documents with stemming and removing stopwords.


### 2.1 Preprocess 
Data preporcessing is following by 
https://github.com/Tixierae/EMNLP_2016

### 2.2 Train a new model
```
$ python train.py
```

### 2.3 Get the keywords from a document
```
$ python predict.py
```

#### Parameters
```
$ python train.py -h
usage: Training [-h] [--dlen DLEN] [--wlen WLEN] [--wdim WDIM] [--hdim HDIM]
                [--label LABEL] [--flen FLEN] [--channel CHANNEL]
                [--batch BATCH] [--epoch EPOCH] [--gpu GPU] 
                [--model MODEL] [--train TRAIN] [--predict PREDICT]

Arguments

optional arguments:
  -h, --help            show this help message and exit
  --dlen,     -dl        doc length                        default=300
  --wlen,     -wl        word length                       default=30
  --wdim,     -wd        word dimension                    default=27
  --hdim,     -hd        dimension of hidden layer         default=50
  --flen,     -f         filter length                     default=3
  --channel,  -c         channel size                      default=50
  --batch,    -b         batch size                        default=64
  --epoch,    -e         epoch size                        default=50
  --gpu,      -g         gpu device(-1=cpu, 0,1,...=gpu)   default=0  
  --model,    -model     path of model                     default=./model
  --train,    -train     path of training data             default=./data/semeval_wo_stem/train.txt
  --predict,  -predict   path of predicted data            default=./data/test.txt
```


## 3. Citation
```
@inbook{inbook,
author = {Lin, Zhe-Li and Wang, Chuan-Ju},
year = {2019},
month = {03},
pages = {400-413},
title = {Keyword Extraction with Character-Level Convolutional Neural Tensor Networks},
isbn = {978-3-030-16141-5},
doi = {10.1007/978-3-030-16148-4_31}
}
```
