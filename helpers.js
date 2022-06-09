// This file contains most of the scoring logic of the entire project. buildJS.py includes all these functions in the final scoring file.
// in the file key.csv, it has a column for "method type". Here are the types:
// 1: single numeric answer, scored right to left on # correct digits (add, subtract, multiply)
// 2: single fraction answer, scored right to left on # correct digits
// 3: single numeric answer, scored left to right on # correct digits (divide)
// 4: single fraction answer, but give bonus points for a simplified version
// 5: single ratio answer, standardized and then compared for exactness
// 6: single string answer, standardized and compared for exactness
// 7: multiple string answers, full marks if any match
// 8: user enters # correct manually
// 9: does answer solve an equation?

// Helper function. Returns number of matching digits in two strings, comparing exact place value.
// 300 = 300 ? return 3.
// 003 = 300 ? return 1.
//1234 = 4321? return 0.
function get_num_correct_digits(correct_answer, answer, flip=false) {
    correct_answer = correct_answer.trim().replaceAll(' ','').replace('$','')
    answer = answer.trim().replaceAll(' ','').replace('$','')


    //for right to left digit comparisons, reverse the strings before comparing.
    if(flip){
        correct_answer = correct_answer.split("").reverse().join("");
        answer = answer.split("").reverse().join("");
    }
    let num = 0;
    for(let i=0; i<correct_answer.length;i++){
        if(answer.length>=i && correct_answer[i] === answer[i]){
            num++
        }
    }
    
    //check for correct answer, but with extra digits.
    //penalty for extra (nonzero) digits: -1 correct digit
    if(num == correct_answer.length    
        && answer.length > correct_answer.length){
		let penalty = false;
		for(let i=correct_answer.length; i<answer.length;i++){
			if(answer[i] != 0){
				penalty = true;
			}
		}

		if(penalty){
			num--
		}
	}
    return num;
}

function getDigitList(x) {
    let list = []
    if(Array.isArray(x)) {
        console.log("it's an array!: " + x)
        x = x.join(",")
    }
    x = x.replaceAll("[","")
    x = x.replaceAll("]", "")
    list = x.split(",")
    console.log(`before split: ${x} after: ${list}`)
    return list
}

function format_remainder(answer) {
    obj = {}
    answer = answer.trim().replace(/^0+/, '')
    if(answer.includes('r')){
        obj.whole = answer.substring(0,(answer.indexOf('r')))
        obj.rem = answer.substring(answer.indexOf('r')+1)
    } else {
        obj.whole = answer
    }
    return obj
}


function format_fraction(answer){
    obj = {}
    answer = answer.trim()
    if(answer.includes(' ')){
        obj.whole = answer.substring(0,(answer.indexOf(' ')))
        answer = answer.substring(answer.indexOf(' ')+1)
    }
    obj.top = answer.substring(0,answer.indexOf('/'))
    obj.bottom = answer.substr(answer.indexOf('/')+1)
    return obj
}

function format_ratio(answer){
    obj = {}
    answer = answer.trim().replace(' ','').replace('/',':')
    obj.left = answer.substring(0,answer.indexOf(':'))
    obj.right = answer.substr(answer.indexOf(':')+1)
    return obj
}


// SCORING FUNCTIONS
// All have scores as a param - required to be an array of possible, nonzero scores. 
// Number of digits correct = array position returned.

// Scoring for single-answer computation problems, scored right to left
// method type: 1
function rtl_1ans(correct_answer, scores, answer) {
    try{
        answer = answer.replace(/,/, '')
        let num = get_num_correct_digits(correct_answer, answer, true)
        if(num == 0)
            return 0
        return scores[num-1]
    } catch {
        return 0
    }
}

// Scoring for fractions
// answer formatting: object with possible keys: whole, top, bottom.
// values inside answer object must be strings
// Scoring for fractions
// answer formatting: object with possible keys: whole, top, bottom.
// values inside answer object must be strings
// method type: 2
function rtl_fraction(correct_answer, scores, answer, isBonus=false) {
    try {
        let num = 0
        if(typeof answer == 'undefined' || answer == ''){
            console.log("Answer was undefined.")
            return 0
        }
        if(typeof correct_answer == 'string'){
            correct_answer = format_fraction(correct_answer)
        }
        if(typeof answer == 'string') {
            answer = format_fraction(answer)
        }

        if('whole' in correct_answer && 'whole' in answer){
            num += get_num_correct_digits(correct_answer.whole, answer.whole, true)
        }
        if('top' in correct_answer && 'top' in answer){
            num += get_num_correct_digits(correct_answer.top, answer.top, true)
        }
        if('bottom' in correct_answer && 'bottom' in answer){
            num += get_num_correct_digits(correct_answer.bottom, answer.bottom, true)
        }


        //find number of digits in correct answer & answer
        let numDigits = correct_answer.top.length + correct_answer.bottom.length
        let actualDigits = answer.top.length + answer.bottom.length
        if(correct_answer.whole){
            numDigits+=correct_answer.whole.length
        }
        if(answer.whole){
            actualDigits += answer.whole.length
        }

        //bonus answer must be EXACT, for the bonus points. Check if answer is longer than it should be, and return 0 if so.
        //This catches edge case of 8 9/9 simplified = 9, but is giving full marks bc the right-to-left unsimplified answer(8 9/9) ends with the full bonus answer (9)
        if(isBonus && actualDigits != numDigits){
            return 0
        }

        //test for nonstandard, but correct answer. Make sure not to give the extra points for simplified answer
        console.log(`Digits correct: ${num}/${numDigits}`)
        if(!isBonus && num < numDigits){
            console.log(`Testing for nonstandard. correct: ${correct_answer.whole} ${correct_answer.top}/${correct_answer.bottom}  answer: ${answer.whole} ${answer.top}/${answer.bottom}`)
            let correct_as_decimal = 0
            correct_as_decimal += correct_answer.whole? parseFloat(correct_answer.whole):0
            correct_as_decimal += parseFloat(correct_answer.top/correct_answer.bottom)
            let answer_as_decimal = 0
            answer_as_decimal += answer.whole? parseFloat(answer.whole):0
            answer_as_decimal += parseFloat(answer.top/answer.bottom)

            //Give top nonbonus score, because whatever they wrote is technically correct.
            if(correct_as_decimal == answer_as_decimal) {
                console.log(`${correct_as_decimal} = ${answer_as_decimal}, giving full (non-bonus) points.`)
                return scores[scores.length-1] 
            }
        }
        if(num == 0){

            return 0
        }
        console.log(`score: ${scores[num-1]}`)
        return scores[num-1]
    } catch {
        return 0
    }
}

// Scoring for division problems
// answer formatting: object with possible keys: whole, rem.
// values inside answer object must be strings
// method type: 3
function ltr_div(correct_answer, scores, answer) {
    try{
        let num = 0
        if(typeof correct_answer == 'string'){
            correct_answer = format_remainder(correct_answer)
        }
        if(typeof answer == 'string') {
            answer = format_remainder(answer)
        }
        
        console.log(`Scoring division problem. Correct answer: ${correct_answer.whole}r${correct_answer.rem} Answer: ${answer.whole}r${answer.rem}`)
        if('whole' in correct_answer && 'whole' in answer){
            num += get_num_correct_digits(correct_answer.whole, answer.whole)
            console.log("# correct in whole: "+num)
        }
        if('rem' in correct_answer && 'rem' in answer){
            num += get_num_correct_digits(correct_answer.rem, answer.rem)
            console.log("# correct with rem: " + num)
        }
        if(num == 0)
            return 0
        return scores[num-1]
    } catch {
        return 0
    }
}

// method type: 4 is for fractions with multiple correct answers (bonus points for a simplified answer.) This logic is found in buildJS.py, and then used to build score.js


// Scoring for ratio problems. Exact answer only (or equivalent)
// answer formatting: string
// format both answers to remove commas, whitespace, etc.
// method type: 5
function ratio_exact(correct_answer, scores, answer) {
    try{
        console.log("scoring a ratio")
        let num = 0
        if(typeof answer == 'undefined' || answer == ''){
            console.log("Answer was undefined.")
            return 0
        }
        correct_answer = format_ratio(correct_answer)
        answer = format_ratio(answer)
        
        console.log("correct: " + correct_answer.left + ":" + correct_answer.right 
        + "\nanswer: "+answer.left + ":" + answer.right)

        if('left' in correct_answer && 'left' in answer){
            num += get_num_correct_digits(correct_answer.left, answer.left, true)
        }
        if('right' in correct_answer && 'right' in answer){
            num += get_num_correct_digits(correct_answer.right, answer.right, true)
        }


        console.log("num correct: "+num)

        //find number of digits in correct answer & answer
        let numDigits = correct_answer.left.length + correct_answer.right.length
        let actualDigits = answer.left.length + answer.right.length

        //test for nonstandard, but correct answer. Make sure not to give the extra points for simplified answer
        console.log(`Digits correct: ${num}/${numDigits}`)
        if(num < numDigits){
            console.log(`Testing for nonstandard. correct: ${correct_answer.left}:${correct_answer.right}  answer: ${answer.left}:${answer.right}`)
            let correct_as_decimal = 0
            correct_as_decimal += parseFloat(correct_answer.left/correct_answer.right)
            let answer_as_decimal = 0
            answer_as_decimal += parseFloat(answer.left/answer.right)

            //Give top nonbonus score, because whatever they wrote is technically correct.
            if(correct_as_decimal == answer_as_decimal) {
                console.log(`${correct_as_decimal} = ${answer_as_decimal}, giving full points.`)
                return scores[0] 
            }
        }
        console.log("here 1")
        if(num == 0){
            return 0
        }
        return scores[0]
    } catch {
        return 0
    }
}

// Scoring for problems with one exact answer only, no equivalents
// answer formatting: string
// method type: 6
function single_exact_answer(correct_answer, scores, answer) {
    try{
        //standardize numerical strings by removing whitespace and commas
        correct_answer=correct_answer.trim().replaceAll(',','').toLowerCase()
        answer = answer.trim().replaceAll(',','').toLowerCase()
        if(correct_answer == answer){
            return scores[0]
        }
        return 0
     } catch {
        return 0
    }
}

// Scoring for problems with multiple non-numerical acceptable answers 
//answer formatting: string
// correct_answer formatting: array of strings
// method type: 7
function multiple_exact_answers(correct_answer, scores, answer) {
    try{
        console.log("multip answer")
        let correct_answers
        if(typeof(correct_answer) == 'array'){
            correct_answers = correct_answer
        } else if(typeof(correct_answer) == 'string'){
            correct_answers = correct_answer.trim().replace('(','').replace(')','').split(',')
        }

        
        answer = answer.trim().replace(' ','').toLowerCase()
        for(let c in correct_answers){
            let cor = correct_answers[c].trim().replace(' ','').toLowerCase()
            console.log("comparing cor: " + cor + " and answer: " + answer)
            if(cor == answer){
                console.log("match!")
                return scores[0]
            }
        }
        return 0
    } catch {
       return 0
   }

}

// scorer compares how many items were completed successfully.
// method type: 8
function num_correct(correct_answer, scores, answer) {
    try{
        if(!answer || answer == '0'){
            return 0
        }
        let num = parseInt(answer)
        if(num > scores.length || num < 0){
            console.log('invalid number correct')
            return 0
        }
        return scores[num-1]
    } catch {
       return 0
   }

}

// does their answer solve an equation?
// correct_answer formatting: string equation, including x (to be replaced by their answer).
// method type: 9
function solves_equation(correct_answer, scores, answer) {
    try{
        console.log("Does the answer: " + answer + " solve the equation: " + correct_answer + "?")
        let equation = correct_answer.replace('x', answer).replace('X', answer)
        let left = equation.substring(0,equation.indexOf('='))
        let right = equation.substring(equation.indexOf('=')+1)
        console.log("left: " + left + " right: " + right)
        try {
            let a1=eval(left)
            let a2=eval(right)
            if(a1 == a2){
                return scores[0]
            }
        } catch {
            console.log("error evaluating equation. ")
        }
        return 0;
    } catch {
    return 0
    }
}

//add a note for special problems with trouble.
//This is done in the css with ::before


function getMax(scores) {
    let max = 0
    for(let i=0;i<scores.length;i++){
        if(parseInt(scores[i])>parseInt(max)){
            max=scores[i]
        }
    }
    return max
}

function toggleTeacherMode() {
    let t = document.querySelector('.teacherMode');
    let p = document.querySelector('.teacherMode > p > span');
    let b = document.querySelector('.teacherMode > button');
    let forms = document.querySelectorAll('.form-section');
    if(t.classList.contains('on')){
        p.innerHTML = 'OFF'
        b.innerHTML = 'Turn ON'
        t.classList.remove('on');
        for(f in forms){
            let newURL = f.style.backgroundImage.replace('.jpg','-markup.jpg');
            f.style.backgroundImage = newURL;
        }
    }
    else {
        p.innerHTML = 'ON';
        b.innerHTML = 'Turn OFF';
        t.classList.add('on');
        for(f in forms){
            let newURL = f.style.backgroundImage.replace('-markup.jpg','.jpg');
            f.style.backgroundImage = newURL;
        }

    }
}


function scoreIt(testName, benchmark, grade, form) {
    try {
        console.log(`scoring ${testName}`)
        let total = 0
        let max = 0
        let possible = 0
        let problems = document.querySelectorAll(`#${testName} .problem`)
        console.log(`${problems.length} problems found`)
        for(let i=0;i<problems.length;i++){
            let answer = problems[i].children[0]
            let solution = problems[i].children[1]
            returns = eval(`${testName}[i](answer.value)`)
            score = returns[0]
            possible = returns[1]
            solution.innerHTML = `${score}/${possible}`
            if(score < possible){
                solution.innerHTML = '<span class="wrong">' + solution.innerHTML + '</span>'
            } else {
                solution.innerHTML = '<span class="right">' + solution.innerHTML + '</span>'
            }
            console.log(`${i+1}. ${score}/${possible}`)
            total += parseInt(score)
            max += parseInt(possible)
            console.log(`so far: ${total}/${max}`)
        }
        const totalScore = document.querySelector(`#${testName}_total`);
        totalScore.innerHTML = `Score:  <span>${total} /${max}</span>`
    } catch (e) {
        console.log("error in scoreIt function, testName "+ testName)
    }
}

function reset(section) {
   console.log("resetting section " + section)
   try {
        let problems = document.querySelectorAll(`#${section} .problem`)
        let total = document.querySelector(`#${section} .total`)
        total.innerHTML = "Score:"

        for(let i=0;i<problems.length;i++){
            console.log()
            problems[i].children[0].value = ""
            problems[i].children[1].innerHTML = ""
        }
    } catch (e) {
        console.log("error resetting section " + section)
    }  

}

function resetCAP(bench, grade) {
    reset(`b${bench}_g${grade}_c`)
    reset(`b${bench}_g${grade}_d`)
    reset(`b${bench}_g${grade}_e`)
    reset(`b${bench}_g${grade}_f`)
    reset(`b${bench}_g${grade}_g`)
    let cap_final = document.querySelector('#CAP_total')
    cap_final.innerHTML = 'Total CAP Score: '
    
    let top = document.getElementById(`b${bench}_g${grade}_c`)
    console.log('focusing on: ' + top)
    top.scrollIntoView()

}

function scoreAllCAP(bench,grade){
    let totalScore = 0;
    let totalPossible = 0;
    let forms = ["c","d","e","f","g"];
    console.log("scoring all CAP")
    forms.forEach(i => {
        testName = 'b' + bench + "_g" + grade + "_" + i
        console.log("scoring " + testName)
        scoreIt(testName, bench, grade, i);
        try {
            let range = document.getElementById(testName+"_total").innerHTML;
            console.log("1: " + range)
            range = range.replace("<span>","").replace("</span>","").replace("Score:","")
            console.log("2: " + range);
            let subtotal = parseInt(range.substring(0,range.indexOf('/')).trim());
            console.log("subtotal: " + subtotal)
            let maxx = parseInt(range.substring(range.indexOf('/')+1).trim());
            console.log("maxx:" + maxx)
            console.log("blah score: " + subtotal + " / " + maxx)
            totalScore += subtotal
            totalPossible += maxx
        } catch (e) {
            console.log('error adding ' + testName + ' to total CAP score.\n' + e.message)
        }
    });
    let total_CAP_element = document.getElementById('CAP_total')
    total_CAP_element.innerHTML = 'Total CAP Score: <span>' + totalScore + " / " + totalPossible + "</span>";
}