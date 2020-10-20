from transformers import BartTokenizer, BartForConditionalGeneration, BartConfig
import flask 
from flask import request
import os

app = flask.Flask(__name__)
app.config["DEBUG"] = True

model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')

@app.route('/summarise', methods=['GET'])
def summarise():
    # return 'hello'
    text = request.args.to_dict()['text']
    inputs = tokenizer([text], max_length=1024, return_tensors='pt')
    summary_ids = model.generate(
        inputs['input_ids'], 
        num_beams=6, early_stopping=True,
        max_length=10000,min_length=1000
    )
    return [tokenizer.decode(g, skip_special_tokens=True, clean_up_tokenization_spaces=False) for g in summary_ids][0]

port = int(os.environ.get("PORT", 6000))

if __name__ == "__main__":

    app.run(debug=True,host='0.0.0.0',port=port)
