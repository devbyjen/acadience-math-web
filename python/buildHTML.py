import json

GRADE_NAMES = {'1':'First Grade', '2':'Second Grade', '3':'Third Grade', '4':'Fourth Grade', '5':'Fifth Grade', '6':'Sixth Grade'}
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

benchmarks = ['1','2','3']

for bench in benchmarks:
    testsByGrade = {'1': [], '2': [], '3': [], '4': [], '5': [], '6': []}
    gridByGrade = {'1': '5x5', '2': '5x4', '3': '5x5', '4': '5x5', '5': '4x4', '6': '4x4'}

    for test in data: 
        benchmark = test[1]
        if benchmark == bench:
            grade = test[4]
            testsByGrade[grade].append(data[test])

    for grade in testsByGrade:
        gradeName = GRADE_NAMES[grade]
        htmlFile = open(f'../b{bench}g{grade}.html', 'w')
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-94B2RRF86V"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag()""" + "{dataLayer.push(arguments);}" + f"""
  gtag('js', new Date());

  gtag('config', 'G-94B2RRF86V');
</script>

    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="style/main.css" />
    <link rel="stylesheet" type="text/css" href="style/images.css" />
    <title>Acadience Math Computation Scoring - Benchmark {bench} - {gradeName}</title>

</head>
<body>
    <h1>Acadience Math Computation Scoring - Benchmark {bench} - {gradeName}</h1>
        <ul>
        <li><b>Jump to Other Grades in Benchmark {bench}:</b></li>
        <li><a href="./b{bench}g1.html">First Grade</a></li>
        <li><a href="./b{bench}g2.html">Second Grade</a></li>
        <li><a href="./b{bench}g3.html">Third Grade</a></li>
        <li><a href="./b{bench}g4.html">Fourth Grade</a></li>
        <li><a href="./b{bench}g5.html">Fifth Grade</a></li>
        <li><a href="./b{bench}g6.html">Sixth Grade</a></li>
        <li><b><a href="./home.html">Back to Home</a></b></li>
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
        <p>The fastest way to fill this out will be to click inside the first answer space, type the answer, then TAB to the next. Click "Score It!" when completed, and "Clear Answers" to score a new test.</p>
    </section>


    <div class="grade-container">
"""            
        html += f"""
        <section id="grade{grade}" class="grade">
            <h2>{gradeName}</h2>
            <div class="form-sections">"""
        for t in testsByGrade[grade]:
            form = t[0]['Form']
            testName = f"b{bench}_g{grade}_{form}"
            print(f'found a test! {testName}')

            html += f"""
                <div id="{testName}" class="form-section grid{gridByGrade[grade]}" style="background-image: url('./images/{testName}.jpg');">
                    <div class="grid">"""
            i=0
            for row in data[testName]:
                html += f"""
                    <div class="problem">
                        <input type="text" class="answer"></input>
                        <div class="solution"></div>
                    </div>
    """
                i+=1
            html += f"""
                </div>
                <div class="buttons">
                    <button class="reset" onclick="reset('{testName}')">Clear Answers</button>
                    <button class="score" onclick="scoreIt('{testName}', '{bench}', '{grade}', '{form}')">Score It!</button>
                    <div class="total" id='{testName}_total'>Score: </div>
                </div>
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

