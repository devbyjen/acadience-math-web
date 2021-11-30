import csv
import json

def make_json(csvFilePath, jsonFilePath):

    data = {}
    with open(csvFilePath) as csvf:
        csvReader = csv.DictReader(csvf)
        i=0
        for row in csvReader:
            print('Line ' + str(i))
            i+=1
            key=f"b{row['Benchmark']}_g{row['Grade']}_{row['Form']}_{row['Problem']}"
            data[key] = row
    
    with open(jsonFilePath, 'w') as jsonf:
        print('Dumping JSON data')
        jsonf.write(json.dumps(data, indent=4))

csvFilePath = r'../data/key.csv'
jsonFilePath = r'../data/key.json'
make_json(csvFilePath, jsonFilePath)