import json

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

def addHelpers(file):
    helpersFile = open('../helpers.js')

    # Copy the helper utils to the scoring file
    for line in helpersFile:
        file.write(line)

    helpersFile.close()

def trimEdgeCommas(x):
    x=x.strip()
    if x[-1] == ',':
        x = x[0:-1]
    if x[0] == ',':
        x = x[1:]
    return x


### MAIN EXECUTION ###
scoringFile = open('../score.js', 'w')
addHelpers(scoringFile)

# Get the JSON data and separate it by benchmark, grade, and form.
data = loadJsonData()

for test in data:
    scoringFile.write(f'\n\nlet {test} = [\n')
    # i=0
    j=0
    for row in data[test]:
        line = f"\tfunction b{row['Benchmark']}_g{row['Grade']}_{row['Form']}_{row['Problem']}(answer) " + '{\n'
        method = row['Scoring Method']
        if method == '1':
            line += f"\t\treturn [rtl_1ans('{row['Answer']}', {row['Scores']}, answer), getMax({row['Scores']})] \n" + "\t}"
        elif method == '2':
            line += f"\t\treturn [rtl_fraction('{row['Answer']}', {row['Scores']}, answer, false), getMax({row['Scores']})] \n" + "\t}"
        elif method == '3':
            line += f"\t\treturn [ltr_div('{row['Answer']}', {row['Scores']}, answer), getMax({row['Scores']})] \n" + "\t}"
        elif method == '4':
            a = row['Answer'].replace('(','').replace(')','').split(',')
            s = row['Scores'].replace('(','').replace(')','').split(']')
            line += f"\t\treturn [Math.max(\n\t\t\trtl_fraction('{a[0]}', {trimEdgeCommas(s[0]) + ']'}, answer, true), \n\t\t\trtl_fraction('{a[1]}', {trimEdgeCommas(s[1]) + ']'}, answer, false)), getMax(getDigitList({s})) \n\t\t]\n" + "\t}"
        else:
            line += f"\t\treturn [0, getMax({row['Scores']})] \n\t" + "}"
        
        if j < len(data[test])-1:
            line += ", \n"
            j += 1
        scoringFile.write(line)
    scoringFile.write('\n]')

    




scoringFile.close()

# The Plan:
# Read in JSON                                          DONE
# Separate by benchmark, grade, form                    DONE
# Add to file the JS helper functions                   DONE
# Create the function for each section, ex:             DONE
    # let computation_benchmark1_forma = [
    #     function comp_1a_1(answer) {
    #         return rtl_1ans('847', [1,2,3], answer)
    #     }) ...
#
# Create the function to score each section, ex:
    # function score_b2_comp_forma() {
    #     let total = 0

    #     const problems = document.querySelectorAll('#computation_benchmark2_forma>.problem')
    #     for(let i=0;i<problems.length;i++){
    #         let answer = problems[i].children[0]
    #         let solution = problems[i].children[1]
    #         score = computation_benchmark2_forma[i](answer.value)
    #         solution.innerHTML = `Score: ${score}`
    #         console.log(`Answer: ${answer.value}`)
    #         total += score
    #     }

    #     const totalScore = document.querySelector('#b2fa_total');
    #     totalScore.innerHTML = `Total Score: ${total}/130`
    # }
# BUT total the score from possible scores instead of hardcoding.
