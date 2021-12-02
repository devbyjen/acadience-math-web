import json

GRADE_NAMES = {'k': 'Kindergarten', '1':'First Grade', '2':'Second Grade', '3':'Third Grade', '4':'Fourth Grade', '5':'Fifth Grade', '6':'Sixth Grade'}
PRETTY_TEST_NAMES = {'a': 'Computation Form A', 'b': 'Computation Form B', 'c': 'Concepts and Application'}

def loadJsonData():
    jsonFile = open('../data/key.json')
    data = json.load(jsonFile)
    jsonFile.close()

    separateTests = {}

    for key in data:
        keys = key.split('_')
        test = f'{keys[0]}_{keys[1]}_{keys[2]}' #benchmark_grade_form
        if test not in separateTests:
            separateTests[test] = []
        separateTests[test].append(data[key])
    return separateTests


### MAIN EXECUTION ###

# Get the JSON data and separate it by benchmark, grade, and form.
data = loadJsonData()

benchmarks = [1,2,3]

for i in benchmarks:
    htmlFile = open(f'../benchmark{i}.html', 'w')

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="style/main.css" />
    <title>Acadience Math Scoring - Benchmark {i}</title>
</head>
<body>
    <h1>Acadience Math Scoring - Benchmark {i}</h1>
        <ul>
        <li><a href="#kindergarten">Kindergarten</a></li>
        <li><a href="#grade1">First Grade</a></li>
        <li><a href="#grade2">Second Grade</a></li>
        <li><a href="#grade3">Third Grade</a></li>
        <li><a href="#grade4">Fourth Grade</a></li>
        <li><a href="#grade5">Fifth Grade</a></li>
        <li><a href="#grade6">Sixth Grade</a></li>
    </ul>

    <section>
        <h2>Instructions</h2>
        <p>This is a scoring module for Acadience Math. Type in the children's answers, and it will score every digit for you, giving partial credit where earned. Please let me know about any issues you find while using this! <a href="mailto:devbyjen@gmail.com">devbyjen@gmail.com</a></a></p>
        <p>You MUST type the answers in exactly this way:
            <ul>
                <li>Fractions:  9 3/4. Put a single space between the whole number and the fraction. Only use a forward slash.</li>
                <li>Remainders: 123r1. No spaces, and separate the whole and the remainder with a LOWER CASE r.</li>
            </ul>
        </p>
        <p>The fastest way to fill this out will be to click inside the first answer space, type the answer, then TAB to the next. Click "Score It!" when completed.</p>
    </section>

    <div class="grade-container">
"""            

    testsByGrade = {'k': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': []}

    for test in data: 
        benchmark = test[1]
        print(f"{benchmark} {i}")
        if benchmark == str(i):
            grade = test[4]
            testsByGrade[grade].append(data[test])
            print(f"adding {test} to {benchmark}")

    for grade in testsByGrade:
        gradeName = GRADE_NAMES[grade]
        html += f"""
        <section id="grade{grade}" class="grade">
            <h2>{gradeName}</h2>
            <div class="form-sections">"""
        for t in testsByGrade[grade]:
            print(f"found a test! grade: {grade} test: {t}")
            benchmark = t[0]['Benchmark']
            form = t[0]['Form']
            testName = f"b{benchmark}_g{grade}_{form}"
            html += f"""
                <div id="g{grade}_{form}" class="form-section">
                    <h3>{PRETTY_TEST_NAMES[form]}</h3>
                    <button class="reset" onclick="reset('g{grade}_{form}')">Clear Answers</button>"""
            i=0
            for row in data[testName]:
                html += f"""
                    <div class="problem">{i+1}. 
                        <input type="text" class="answer"></input>
                        <div class="solution"></div>
                    </div>
    """
                i+=1
            html += f"""
                    <button class="score" onclick="scoreIt('{testName}', '{benchmark}', '{grade}', '{form}')">Score It!</button>
                    <div class="total" id='g{grade}_{form}_total'>Total Score: </div>
                </div>
    """

    html += f"""
            </div>
        </section>
        </body>
        <script src="score.js"></script>
    </html>
    """

    htmlFile.write(html)
    htmlFile.close()

