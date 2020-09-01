#! python3

import PyPDF2
import docx

class pdfReader:

    def __init__(self, path:str):
        ''' Initiates the pdf reader object for the given file'''
        assert len(path) != 0
        self.pdfFileObj = open(path, 'rb')
        self.pdfReader = PyPDF2.PdfFileReader(self.pdfFileObj)
        self.pages = self.pdfReader.numPages

    def __getitem__(self, start:int, end:int=None):
        ''' 
        Args: 
            start -> Starting page number (index starts from 1)
            end -> Endding page number
        Return:
            Dict with page number as key and the text content as value.
        '''
        pages = dict()
        for i in range(start-1, end):
            pageObj = self.pdfReader.getPage(i)
            pageContent = pageObj.extractText()
            pages[i] = pageContent
        
        return pages

class docxReader:

    def __init__(self, path:str):
        ''' Initiates the pdf reader object for the given file'''
        assert len(path) != 0
        self.doc = docx.Document(path)

    def getText(self):
        ' Returns the text content of the entire document'    
        fullText = []
        for para in self.doc.paragraphs:
            fullText.append(para.text)
        return '\n'.join(fullText)


def main():
    lec1 = pdfReader('./Test Files/test.pdf')
    contents = lec1.__getitem__(1,10)
    for k,v in contents.items():
        print(f'------------- Page {k} -------------')
        print(v)    
    print('\n======================================')

    lec2 = docxReader('./Test Files/test.docx')
    print('\n\nReading the word document...')
    print(lec2.getText())

if __name__ == "__main__":
    main()

    


