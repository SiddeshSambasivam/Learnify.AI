# NodeMind

NodeMind is a platform for students which converts notes from documents uploaded to a visual representation of knowledge graph to enhance the understanding.

## Development Environment Setup

The sections gets the repository set up in the local system for development.

For Unix Systems:

1. Open Terminal and run the following bash command

   `pip install virtualenv`.

   This will install the virtual environment python package which is create a seperate environment for the project. Virtual environment **prevents potential problems which could raise due to different dependencies of libraries used in the project**.

   Reference: https://virtualenv.pypa.io/en/latest/

2. Run the following command to create a virtualenv and install the project dependencies

   `python3 -m venv nodemind`

   `source nodemind/bin/activate`

   `pip install -r requirements.txt`

## Document Reader Script

To test run the document reader script, run the following commmand `python documentReader.py` from the root directory and it would print out the test documents listed in the Test Files folder.
