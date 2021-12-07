@ECHO OFF
ECHO Converting data from CSV to JSON
py .\csv2json.py
PAUSE
ECHO Building JS File
py .\buildJS.py
PAUSE
ECHO Building HTML files
py .\buildHTML.py
PAUSE