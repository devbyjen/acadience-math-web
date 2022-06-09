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

let b2_g4_a = [
	function b2_g4_a_1(answer) {
		return [rtl_1ans('498', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g4_a_2(answer) {
		return [rtl_1ans('7120', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_a_3(answer) {
		return [rtl_fraction('6 1/3', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b2_g4_a_4(answer) {
		return [rtl_1ans('72', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g4_a_5(answer) {
		return [ltr_div('44r2', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b2_g4_a_6(answer) {
		return [rtl_1ans('103', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g4_a_7(answer) {
		return [rtl_fraction('7/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g4_a_8(answer) {
		return [rtl_1ans('685', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g4_a_9(answer) {
		return [rtl_1ans('1056', [2,4,6,9], answer), getMax([2,4,6,9])] 
	}, 
	function b2_g4_a_10(answer) {
		return [rtl_fraction('1 1/8', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b2_g4_a_11(answer) {
		return [ltr_div('119r4', [3,6,9,13], answer), getMax([3,6,9,13])] 
	}, 
	function b2_g4_a_12(answer) {
		return [ltr_div('5', [1], answer), getMax([1])] 
	}, 
	function b2_g4_a_13(answer) {
		return [rtl_1ans('5644', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b2_g4_a_14(answer) {
		return [rtl_fraction('1/5', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g4_a_15(answer) {
		return [rtl_1ans('4680', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_a_16(answer) {
		return [rtl_fraction('1 1/4', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b2_g4_a_17(answer) {
		return [rtl_fraction('1/4 ', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g4_a_18(answer) {
		return [rtl_fraction('1/6', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g4_a_19(answer) {
		return [rtl_1ans('4338', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_a_20(answer) {
		return [ltr_div('78r5', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b2_g4_a_21(answer) {
		return [ltr_div('40r1', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b2_g4_a_22(answer) {
		return [rtl_1ans('1938', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b2_g4_a_23(answer) {
		return [rtl_1ans('4879', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_a_24(answer) {
		return [rtl_1ans('6622', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_a_25(answer) {
		return [rtl_1ans('299', [2,5,8], answer), getMax([2,5,8])] 
	}
]

let b2_g4_b = [
	function b2_g4_b_1(answer) {
		return [rtl_1ans('965', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g4_b_2(answer) {
		return [rtl_1ans('7411', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_b_3(answer) {
		return [rtl_fraction('1 1/3', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b2_g4_b_4(answer) {
		return [rtl_1ans('54', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g4_b_5(answer) {
		return [ltr_div('137r2', [3,6,10,14], answer), getMax([3,6,10,14])] 
	}, 
	function b2_g4_b_6(answer) {
		return [rtl_1ans('61', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g4_b_7(answer) {
		return [Math.max(
			rtl_fraction('3/4', [0,3], answer, true),
			rtl_fraction('6/8', [1,2], answer, false)), getMax(getDigitList(['[0,3', ',[1,2', ''])) 
		]
	}, 
	function b2_g4_b_8(answer) {
		return [rtl_1ans('6789', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_b_9(answer) {
		return [rtl_1ans('858', [2,5,8], answer), getMax([2,5,8])] 
	}, 
	function b2_g4_b_10(answer) {
		return [Math.max(
			rtl_fraction('5 1/4', [0,0,4], answer, true),
			rtl_fraction(' 5 2/8', [1,2,3], answer, false)), getMax(getDigitList(['[0,0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b2_g4_b_11(answer) {
		return [ltr_div('31r3', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b2_g4_b_12(answer) {
		return [ltr_div('40r1', [1], answer), getMax([1])] 
	}, 
	function b2_g4_b_13(answer) {
		return [rtl_1ans('1088', [2,4,7,10], answer), getMax([2,4,7,10])] 
	}, 
	function b2_g4_b_14(answer) {
		return [Math.max(
			rtl_fraction('1/2', [0,4], answer, true),
			rtl_fraction(' 5/10', [1,2,3], answer, false)), getMax(getDigitList(['[0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b2_g4_b_15(answer) {
		return [rtl_1ans('4312', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_b_16(answer) {
		return [rtl_fraction('9 3/4', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b2_g4_b_17(answer) {
		return [rtl_fraction('1/3', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g4_b_18(answer) {
		return [rtl_fraction('1/6', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g4_b_19(answer) {
		return [rtl_1ans('5238', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_b_20(answer) {
		return [ltr_div('71r4', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b2_g4_b_21(answer) {
		return [ltr_div('117r1', [3,6,9,13], answer), getMax([3,6,9,13])] 
	}, 
	function b2_g4_b_22(answer) {
		return [rtl_1ans('2581', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b2_g4_b_23(answer) {
		return [rtl_1ans('8658', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_b_24(answer) {
		return [rtl_1ans('5241', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g4_b_25(answer) {
		return [rtl_1ans('627', [2,5,8], answer), getMax([2,5,8])] 
	}
]

let b2_g5_a = [
	function b2_g5_a_1(answer) {
		return [rtl_1ans('9221', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_a_2(answer) {
		return [rtl_1ans('4812', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b2_g5_a_3(answer) {
		return [Math.max(
			rtl_fraction('9 1/8', [0,0,10], answer, true),
			rtl_fraction(' 8 9/8', [3,6,9], answer, false)), getMax(getDigitList(['[0,0,10', ',[3,6,9', ''])) 
		]
	}, 
	function b2_g5_a_4(answer) {
		return [rtl_1ans('32153', [2,3,4,11,14], answer), getMax([2,3,4,11,14])] 
	}, 
	function b2_g5_a_5(answer) {
		return [ltr_div('92', [5,10], answer), getMax([5,10])] 
	}, 
	function b2_g5_a_6(answer) {
		return [ltr_div('304r1', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b2_g5_a_7(answer) {
		return [Math.max(
			rtl_fraction('3 1/2', [0,0,4], answer, true),
			rtl_fraction(' 3 2/4',  [1,2,3], answer, false)), getMax(getDigitList(['[0,0,4', ', [1,2,3', ''])) 
		]
	}, 
	function b2_g5_a_8(answer) {
		return [rtl_fraction('1/3', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g5_a_9(answer) {
		return [rtl_1ans('8667', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_a_10(answer) {
		return [rtl_1ans('2241', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_a_11(answer) {
		return [ltr_div('32', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g5_a_12(answer) {
		return [Math.max(
			rtl_fraction('1/6', [0,9], answer, true),
			rtl_fraction(' 12/72', [2,4,6,8], answer, false)), getMax(getDigitList(['[0,9', ',[2,4,6,8', ''])) 
		]
	}, 
	function b2_g5_a_13(answer) {
		return [ltr_div('40r1', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g5_a_14(answer) {
		return [rtl_1ans('10648', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b2_g5_a_15(answer) {
		return [rtl_fraction(' 9 13/14', [2,4,6,8,11], answer, false), getMax([2,4,6,8,11])] 
	}, 
	function b2_g5_a_16(answer) {
		return [rtl_1ans('49802', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}
]

let b2_g5_b = [
	function b2_g5_b_1(answer) {
		return [rtl_1ans('8046', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_b_2(answer) {
		return [rtl_1ans('6400', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b2_g5_b_3(answer) {
		return [Math.max(
			rtl_fraction('7', [12], answer, true),
			rtl_fraction('6 10/10', [2,4,6,8,11], answer, false)), getMax(getDigitList(['[12', ',[2,4,6,8,11', ''])) 
		]
	}, 
	function b2_g5_b_4(answer) {
		return [rtl_1ans('25340', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b2_g5_b_5(answer) {
		return [ltr_div('58', [6,12], answer), getMax([6,12])] 
	}, 
	function b2_g5_b_6(answer) {
		return [ltr_div('21r1', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b2_g5_b_7(answer) {
		return [rtl_fraction('5 3/5', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b2_g5_b_8(answer) {
		return [Math.max(
			rtl_fraction('2/5', [0,4], answer, true),
			rtl_fraction('4/10', [1,2,3], answer, false)), getMax(getDigitList(['[0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b2_g5_b_9(answer) {
		return [rtl_1ans('8778', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_b_10(answer) {
		return [rtl_1ans('1350', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_b_11(answer) {
		return [ltr_div('4', [5], answer), getMax([5])] 
	}, 
	function b2_g5_b_12(answer) {
		return [rtl_fraction('13/18', [2,4,6,8], answer, false), getMax([2,4,6,8])] 
	}, 
	function b2_g5_b_13(answer) {
		return [ltr_div('40r1', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g5_b_14(answer) {
		return [rtl_1ans('10197', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b2_g5_b_15(answer) {
		return [Math.max(
			rtl_fraction('9', [10], answer, true),
			rtl_fraction(' 8 9/9', [3,6,9], answer, false)), getMax(getDigitList(['[10', ',[3,6,9', ''])) 
		]
	}, 
	function b2_g5_b_16(answer) {
		return [rtl_1ans('19656', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}
]

let b2_g6_a = [
	function b2_g6_a_1(answer) {
		return [rtl_1ans('87.7', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_a_2(answer) {
		return [rtl_1ans('1.02', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_a_3(answer) {
		return [rtl_1ans('16131', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b2_g6_a_4(answer) {
		return [ltr_div('70', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g6_a_5(answer) {
		return [rtl_fraction('4 1/9', [2,4,7], answer, false), getMax([2,4,7])] 
	}, 
	function b2_g6_a_6(answer) {
		return [rtl_1ans('78.4', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b2_g6_a_7(answer) {
		return [rtl_1ans('68.59', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b2_g6_a_8(answer) {
		return [rtl_1ans('27.72', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b2_g6_a_9(answer) {
		return [ltr_div('150', [4,8,12], answer), getMax([4,8,12])] 
	}, 
	function b2_g6_a_10(answer) {
		return [rtl_1ans('8.35', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_a_11(answer) {
		return [rtl_1ans('32.2', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_a_12(answer) {
		return [ltr_div('156', [6,12,18], answer), getMax([6,12,18])] 
	}, 
	function b2_g6_a_13(answer) {
		return [rtl_1ans('13.65', [2,4,6,9,12,15], answer), getMax([2,4,6,9,12,15])] 
	}, 
	function b2_g6_a_14(answer) {
		return [ltr_div('3.6', [4,8,12], answer), getMax([4,8,12])] 
	}, 
	function b2_g6_a_15(answer) {
		return [rtl_1ans('5.95', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_a_16(answer) {
		return [ltr_div('10.3', [4,7,10,14], answer), getMax([4,7,10,14])] 
	}
]

let b2_g6_b = [
	function b2_g6_b_1(answer) {
		return [rtl_1ans('74.8', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_b_2(answer) {
		return [rtl_1ans('5.01', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_b_3(answer) {
		return [rtl_1ans('41888', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b2_g6_b_4(answer) {
		return [ltr_div('110', [4,8,13], answer), getMax([4,8,13])] 
	}, 
	function b2_g6_b_5(answer) {
		return [rtl_fraction('3 1/6', [2,4,7], answer, false), getMax([2,4,7])] 
	}, 
	function b2_g6_b_6(answer) {
		return [rtl_1ans('68.58', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b2_g6_b_7(answer) {
		return [rtl_1ans('8.68', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_b_8(answer) {
		return [rtl_1ans('25.83', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b2_g6_b_9(answer) {
		return [ltr_div('210', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b2_g6_b_10(answer) {
		return [rtl_1ans('9.06', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_b_11(answer) {
		return [rtl_1ans('29.4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_b_12(answer) {
		return [ltr_div('39', [5,11], answer), getMax([5,11])] 
	}, 
	function b2_g6_b_13(answer) {
		return [rtl_1ans('46.851', [2,4,6,9,12,15], answer), getMax([2,4,6,9,12,15])] 
	}, 
	function b2_g6_b_14(answer) {
		return [ltr_div('0.7', [3,6], answer), getMax([3,6])] 
	}, 
	function b2_g6_b_15(answer) {
		return [rtl_1ans('1.75', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g6_b_16(answer) {
		return [ltr_div('10.5', [4,7,10,14], answer), getMax([4,7,10,14])] 
	}
]

let b2_g3_a = [
	function b2_g3_a_1(answer) {
		return [rtl_1ans('89', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_2(answer) {
		return [rtl_1ans('979', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_a_3(answer) {
		return [rtl_1ans('72', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_4(answer) {
		return [rtl_1ans('0', [1], answer), getMax([1])] 
	}, 
	function b2_g3_a_5(answer) {
		return [rtl_1ans('86', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_6(answer) {
		return [rtl_1ans('90', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_7(answer) {
		return [rtl_1ans('42', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_8(answer) {
		return [rtl_1ans('754', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_a_9(answer) {
		return [ltr_div('210', [1], answer), getMax([1])] 
	}, 
	function b2_g3_a_10(answer) {
		return [rtl_1ans('35', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_11(answer) {
		return [rtl_1ans('42', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_12(answer) {
		return [ltr_div('8.35', [1], answer), getMax([1])] 
	}, 
	function b2_g3_a_13(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_14(answer) {
		return [rtl_1ans('941', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_a_15(answer) {
		return [rtl_1ans('420', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_a_16(answer) {
		return [rtl_1ans('79', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_17(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_18(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b2_g3_a_19(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b2_g3_a_20(answer) {
		return [rtl_1ans('40', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_21(answer) {
		return [rtl_1ans('705', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_a_22(answer) {
		return [rtl_1ans('28', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_23(answer) {
		return [rtl_1ans('67', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_a_24(answer) {
		return [ltr_div('2', [1], answer), getMax([1])] 
	}, 
	function b2_g3_a_25(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}
]

let b2_g3_b = [
	function b2_g3_b_1(answer) {
		return [rtl_1ans('88', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_2(answer) {
		return [rtl_1ans('867', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_b_3(answer) {
		return [rtl_1ans('56', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_4(answer) {
		return [rtl_1ans('0', [1], answer), getMax([1])] 
	}, 
	function b2_g3_b_5(answer) {
		return [rtl_1ans('82', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_6(answer) {
		return [rtl_1ans('75', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_7(answer) {
		return [rtl_1ans('21', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_8(answer) {
		return [rtl_1ans('174', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_b_9(answer) {
		return [ltr_div('8', [1], answer), getMax([1])] 
	}, 
	function b2_g3_b_10(answer) {
		return [rtl_1ans('26', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_11(answer) {
		return [rtl_1ans('80', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_12(answer) {
		return [ltr_div('5', [1], answer), getMax([1])] 
	}, 
	function b2_g3_b_13(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_14(answer) {
		return [rtl_1ans('815', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_b_15(answer) {
		return [rtl_1ans('720', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_b_16(answer) {
		return [rtl_1ans('89', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_17(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b2_g3_b_18(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_19(answer) {
		return [ltr_div('8', [1], answer), getMax([1])] 
	}, 
	function b2_g3_b_20(answer) {
		return [rtl_1ans('45', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_21(answer) {
		return [rtl_1ans('430', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_b_22(answer) {
		return [rtl_1ans('48', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_b_23(answer) {
		return [rtl_1ans('388', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g3_b_24(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b2_g3_b_25(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}
]

let b1_g2_a = [
	function b1_g2_a_1(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b1_g2_a_2(answer) {
		return [rtl_1ans('29', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_3(answer) {
		return [rtl_1ans('86', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_4(answer) {
		return [rtl_1ans('71', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_5(answer) {
		return [rtl_1ans('93', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_6(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_a_7(answer) {
		return [rtl_1ans('99', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_8(answer) {
		return [rtl_1ans('48', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_9(answer) {
		return [rtl_1ans('21', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_10(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_11(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b1_g2_a_12(answer) {
		return [rtl_1ans('81', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_13(answer) {
		return [rtl_1ans('46', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_14(answer) {
		return [rtl_1ans('57', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_15(answer) {
		return [rtl_1ans('67', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_16(answer) {
		return [rtl_1ans('52', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_17(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b1_g2_a_18(answer) {
		return [rtl_1ans('95', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_19(answer) {
		return [rtl_1ans('78', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_a_20(answer) {
		return [rtl_1ans('37', [1,2], answer), getMax([1,2])] 
	}
]

let b1_g2_b = [
	function b1_g2_b_1(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_2(answer) {
		return [rtl_1ans('79', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_3(answer) {
		return [rtl_1ans('23', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_4(answer) {
		return [rtl_1ans('44', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_5(answer) {
		return [rtl_1ans('99', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_6(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b1_g2_b_7(answer) {
		return [rtl_1ans('98', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_8(answer) {
		return [rtl_1ans('28', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_9(answer) {
		return [rtl_1ans('23', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_10(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b1_g2_b_11(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b1_g2_b_12(answer) {
		return [rtl_1ans('60', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_13(answer) {
		return [rtl_1ans('67', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_14(answer) {
		return [rtl_1ans('88', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_15(answer) {
		return [rtl_1ans('89', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_16(answer) {
		return [rtl_1ans('93', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_17(answer) {
		return [rtl_1ans('40', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_18(answer) {
		return [rtl_1ans('63', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_19(answer) {
		return [rtl_1ans('38', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_b_20(answer) {
		return [rtl_1ans('38', [1,2], answer), getMax([1,2])] 
	}
]

let b2_g2_a = [
	function b2_g2_a_1(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_2(answer) {
		return [rtl_1ans('89', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_3(answer) {
		return [rtl_1ans('86', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_4(answer) {
		return [rtl_1ans('71', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_5(answer) {
		return [rtl_1ans('96', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_6(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b2_g2_a_7(answer) {
		return [rtl_1ans('99', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_8(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b2_g2_a_9(answer) {
		return [rtl_1ans('33', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_10(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_11(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b2_g2_a_12(answer) {
		return [rtl_1ans('91', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_13(answer) {
		return [rtl_1ans('49', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_14(answer) {
		return [rtl_1ans('48', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_15(answer) {
		return [rtl_1ans('79', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_16(answer) {
		return [rtl_1ans('30', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_17(answer) {
		return [rtl_1ans('31', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_18(answer) {
		return [rtl_1ans('80', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_19(answer) {
		return [rtl_1ans('79', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_a_20(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}
]

let b2_g2_b = [
	function b2_g2_b_1(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b2_g2_b_2(answer) {
		return [rtl_1ans('17', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_3(answer) {
		return [rtl_1ans('75', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_4(answer) {
		return [rtl_1ans('90', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_5(answer) {
		return [rtl_1ans('90', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_6(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b2_g2_b_7(answer) {
		return [rtl_1ans('59', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_8(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b2_g2_b_9(answer) {
		return [rtl_1ans('70', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_10(answer) {
		return [rtl_1ans('51', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_11(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b2_g2_b_12(answer) {
		return [rtl_1ans('90', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_13(answer) {
		return [rtl_1ans('98', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_14(answer) {
		return [rtl_1ans('87', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_15(answer) {
		return [rtl_1ans('97', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_16(answer) {
		return [rtl_1ans('32', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_17(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_18(answer) {
		return [rtl_1ans('41', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_19(answer) {
		return [rtl_1ans('89', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_b_20(answer) {
		return [rtl_1ans('65', [1,2], answer), getMax([1,2])] 
	}
]

let b3_g2_a = [
	function b3_g2_a_1(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_2(answer) {
		return [rtl_1ans('77', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_3(answer) {
		return [rtl_1ans('34', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_4(answer) {
		return [rtl_1ans('90', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_5(answer) {
		return [rtl_1ans('86', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_6(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b3_g2_a_7(answer) {
		return [rtl_1ans('87', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_8(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b3_g2_a_9(answer) {
		return [rtl_1ans('93', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_10(answer) {
		return [rtl_1ans('21', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_11(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b3_g2_a_12(answer) {
		return [rtl_1ans('92', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_13(answer) {
		return [rtl_1ans('35', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_14(answer) {
		return [rtl_1ans('73', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_15(answer) {
		return [rtl_1ans('78', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_16(answer) {
		return [rtl_1ans('50', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_17(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_18(answer) {
		return [rtl_1ans('90', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_19(answer) {
		return [rtl_1ans('98', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_a_20(answer) {
		return [rtl_1ans('17', [1,2], answer), getMax([1,2])] 
	}
]

let b3_g2_b = [
	function b3_g2_b_1(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_2(answer) {
		return [rtl_1ans('25', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_3(answer) {
		return [rtl_1ans('69', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_4(answer) {
		return [rtl_1ans('94', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_5(answer) {
		return [rtl_1ans('85', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_6(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b3_g2_b_7(answer) {
		return [rtl_1ans('88', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_8(answer) {
		return [rtl_1ans('34', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_9(answer) {
		return [rtl_1ans('61', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_10(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_11(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b3_g2_b_12(answer) {
		return [rtl_1ans('53', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_13(answer) {
		return [rtl_1ans('37', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_14(answer) {
		return [rtl_1ans('89', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_15(answer) {
		return [rtl_1ans('98', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_16(answer) {
		return [rtl_1ans('31', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_17(answer) {
		return [rtl_1ans('41', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_18(answer) {
		return [rtl_1ans('93', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_19(answer) {
		return [rtl_1ans('68', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_b_20(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}
]

let b1_g3_a = [
	function b1_g3_a_1(answer) {
		return [rtl_1ans('66', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_2(answer) {
		return [rtl_1ans('691', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_3(answer) {
		return [rtl_1ans('63', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_4(answer) {
		return [rtl_1ans('0', [1], answer), getMax([1])] 
	}, 
	function b1_g3_a_5(answer) {
		return [rtl_1ans('84', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_6(answer) {
		return [rtl_1ans('38', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_7(answer) {
		return [rtl_1ans('32', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_8(answer) {
		return [rtl_1ans('403', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_9(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b1_g3_a_10(answer) {
		return [rtl_1ans('92', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_11(answer) {
		return [rtl_1ans('83', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_12(answer) {
		return [ltr_div('7', [1], answer), getMax([1])] 
	}, 
	function b1_g3_a_13(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_14(answer) {
		return [rtl_1ans('902', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_15(answer) {
		return [rtl_1ans('540', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_16(answer) {
		return [rtl_1ans('188', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_17(answer) {
		return [rtl_1ans('37', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_18(answer) {
		return [rtl_1ans('25', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_19(answer) {
		return [ltr_div('8', [1], answer), getMax([1])] 
	}, 
	function b1_g3_a_20(answer) {
		return [rtl_1ans('27', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_21(answer) {
		return [rtl_1ans('423', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_22(answer) {
		return [rtl_1ans('64', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_a_23(answer) {
		return [rtl_1ans('663', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_a_24(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b1_g3_a_25(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}
]

let b1_g3_b = [
	function b1_g3_b_1(answer) {
		return [rtl_1ans('77', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_2(answer) {
		return [rtl_1ans('872', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_3(answer) {
		return [rtl_1ans('54', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_4(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b1_g3_b_5(answer) {
		return [rtl_1ans('68', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_6(answer) {
		return [rtl_1ans('78', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_7(answer) {
		return [rtl_1ans('35', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_8(answer) {
		return [rtl_1ans('931', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_9(answer) {
		return [ltr_div('9', [1], answer), getMax([1])] 
	}, 
	function b1_g3_b_10(answer) {
		return [rtl_1ans('21', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_11(answer) {
		return [rtl_1ans('82', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_12(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b1_g3_b_13(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g3_b_14(answer) {
		return [rtl_1ans('900', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_15(answer) {
		return [rtl_1ans('180', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_16(answer) {
		return [rtl_1ans('171', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_17(answer) {
		return [rtl_1ans('28', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_18(answer) {
		return [rtl_1ans('64', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_19(answer) {
		return [ltr_div('8', [1], answer), getMax([1])] 
	}, 
	function b1_g3_b_20(answer) {
		return [rtl_1ans('24', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_21(answer) {
		return [rtl_1ans('810', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_22(answer) {
		return [rtl_1ans('99', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_b_23(answer) {
		return [rtl_1ans('237', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g3_b_24(answer) {
		return [ltr_div('2', [1], answer), getMax([1])] 
	}, 
	function b1_g3_b_25(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}
]

let b3_g3_a = [
	function b3_g3_a_1(answer) {
		return [rtl_1ans('98', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_2(answer) {
		return [rtl_1ans('88', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_3(answer) {
		return [rtl_1ans('72', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_4(answer) {
		return [rtl_1ans('0', [1], answer), getMax([1])] 
	}, 
	function b3_g3_a_5(answer) {
		return [rtl_1ans('63', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_6(answer) {
		return [rtl_1ans('70', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_7(answer) {
		return [rtl_1ans('28', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_8(answer) {
		return [rtl_1ans('610', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_a_9(answer) {
		return [ltr_div('4', [1], answer), getMax([1])] 
	}, 
	function b3_g3_a_10(answer) {
		return [rtl_1ans('24', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_11(answer) {
		return [rtl_1ans('71', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_12(answer) {
		return [ltr_div('8', [1], answer), getMax([1])] 
	}, 
	function b3_g3_a_13(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_14(answer) {
		return [rtl_1ans('800', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_a_15(answer) {
		return [rtl_1ans('150', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_a_16(answer) {
		return [rtl_1ans('286', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_a_17(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b3_g3_a_18(answer) {
		return [rtl_1ans('81', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_19(answer) {
		return [ltr_div('7', [1], answer), getMax([1])] 
	}, 
	function b3_g3_a_20(answer) {
		return [rtl_1ans('40', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_21(answer) {
		return [rtl_1ans('501', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_a_22(answer) {
		return [rtl_1ans('88', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_23(answer) {
		return [rtl_1ans('78', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_a_24(answer) {
		return [ltr_div('2', [1], answer), getMax([1])] 
	}, 
	function b3_g3_a_25(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}
]

let b3_g3_b = [
	function b3_g3_b_1(answer) {
		return [rtl_1ans('97', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_2(answer) {
		return [rtl_1ans('279', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_3(answer) {
		return [rtl_1ans('54', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_4(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b3_g3_b_5(answer) {
		return [rtl_1ans('99', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_6(answer) {
		return [rtl_1ans('74', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_7(answer) {
		return [rtl_1ans('36', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_8(answer) {
		return [rtl_1ans('305', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_9(answer) {
		return [ltr_div('2', [1], answer), getMax([1])] 
	}, 
	function b3_g3_b_10(answer) {
		return [rtl_1ans('40', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_11(answer) {
		return [rtl_1ans('71', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_12(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b3_g3_b_13(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_14(answer) {
		return [rtl_1ans('740', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_15(answer) {
		return [rtl_1ans('100', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_16(answer) {
		return [rtl_1ans('136', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_17(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b3_g3_b_18(answer) {
		return [rtl_1ans('36', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_19(answer) {
		return [ltr_div('6', [1], answer), getMax([1])] 
	}, 
	function b3_g3_b_20(answer) {
		return [rtl_1ans('32', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_21(answer) {
		return [rtl_1ans('800', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_22(answer) {
		return [rtl_1ans('84', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_b_23(answer) {
		return [rtl_1ans('387', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g3_b_24(answer) {
		return [ltr_div('7', [1], answer), getMax([1])] 
	}, 
	function b3_g3_b_25(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}
]

let b1_g4_a = [
	function b1_g4_a_1(answer) {
		return [rtl_1ans('847', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g4_a_2(answer) {
		return [rtl_1ans('7020', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_a_3(answer) {
		return [rtl_fraction('2 2/5', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b1_g4_a_4(answer) {
		return [rtl_1ans('72', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g4_a_5(answer) {
		return [ltr_div('143r1', [3,6,10,14], answer), getMax([3,6,10,14])] 
	}, 
	function b1_g4_a_6(answer) {
		return [rtl_1ans('123', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g4_a_7(answer) {
		return [rtl_fraction('7/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_a_8(answer) {
		return [rtl_1ans('6886', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_a_9(answer) {
		return [rtl_1ans('209', [2,5,8], answer), getMax([2,5,8])] 
	}, 
	function b1_g4_a_10(answer) {
		return [Math.max(
			rtl_fraction('8 1/4', [0,0,5], answer, true),
			rtl_fraction(' 8 3/12', [1,2,3,4], answer, false)), getMax(getDigitList(['[0,0,5', ',[1,2,3,4', ''])) 
		]
	}, 
	function b1_g4_a_11(answer) {
		return [ltr_div('80r2', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b1_g4_a_12(answer) {
		return [ltr_div('7', [1], answer), getMax([1])] 
	}, 
	function b1_g4_a_13(answer) {
		return [rtl_1ans('7128', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g4_a_14(answer) {
		return [rtl_fraction('3/4', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_a_15(answer) {
		return [rtl_1ans('3156', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_a_16(answer) {
		return [Math.max(
			rtl_fraction('7 2/5', [0,0,5], answer, true),
			rtl_fraction('7 4/10',  [1,2,3,4], answer, false)), getMax(getDigitList(['[0,0,5', ', [1,2,3,4', ''])) 
		]
	}, 
	function b1_g4_a_17(answer) {
		return [rtl_fraction('2/3', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_a_18(answer) {
		return [rtl_fraction('7/12', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b1_g4_a_19(answer) {
		return [rtl_1ans('5803', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_a_20(answer) {
		return [ltr_div('156r3', [3,6,10,14], answer), getMax([3,6,10,14])] 
	}, 
	function b1_g4_a_21(answer) {
		return [ltr_div('132r1', [3,6,9,12], answer), getMax([3,6,9,12])] 
	}, 
	function b1_g4_a_22(answer) {
		return [rtl_1ans('1495', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g4_a_23(answer) {
		return [rtl_1ans('1746', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_a_24(answer) {
		return [rtl_1ans('9206', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_a_25(answer) {
		return [rtl_1ans('408', [2,5,8], answer), getMax([2,5,8])] 
	}
]

let b1_g4_b = [
	function b1_g4_b_1(answer) {
		return [rtl_1ans('398', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g4_b_2(answer) {
		return [rtl_1ans('7132', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_b_3(answer) {
		return [rtl_fraction('9 3/4', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b1_g4_b_4(answer) {
		return [rtl_1ans('56', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g4_b_5(answer) {
		return [ltr_div('96r3', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b1_g4_b_6(answer) {
		return [rtl_1ans('262', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g4_b_7(answer) {
		return [rtl_fraction('3/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_b_8(answer) {
		return [rtl_1ans('4359', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_b_9(answer) {
		return [rtl_1ans('198', [2,5,8], answer), getMax([2,5,8])] 
	}, 
	function b1_g4_b_10(answer) {
		return [Math.max(
			rtl_fraction('5 3/4', [0,0,4], answer, true),
			rtl_fraction(' 5 6/8', [1,2,3], answer, false)), getMax(getDigitList(['[0,0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b1_g4_b_11(answer) {
		return [ltr_div('31r4', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b1_g4_b_12(answer) {
		return [ltr_div('7', [1], answer), getMax([1])] 
	}, 
	function b1_g4_b_13(answer) {
		return [rtl_1ans('2688', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g4_b_14(answer) {
		return [rtl_fraction('3/5', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_b_15(answer) {
		return [rtl_1ans('7974', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_b_16(answer) {
		return [rtl_fraction('2 1/3', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b1_g4_b_17(answer) {
		return [rtl_fraction('2/3', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_b_18(answer) {
		return [rtl_fraction('5/6', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g4_b_19(answer) {
		return [rtl_1ans('3934', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_b_20(answer) {
		return [ltr_div('72r1', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b1_g4_b_21(answer) {
		return [ltr_div('206r3', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g4_b_22(answer) {
		return [rtl_1ans('2755', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g4_b_23(answer) {
		return [rtl_1ans('4089', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_b_24(answer) {
		return [rtl_1ans('5006', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g4_b_25(answer) {
		return [rtl_1ans('861', [2,5,8], answer), getMax([2,5,8])] 
	}
]

let b3_g4_a = [
	function b3_g4_a_1(answer) {
		return [rtl_1ans('898', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g4_a_2(answer) {
		return [rtl_1ans('7121', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_a_3(answer) {
		return [rtl_fraction('1 1/3', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b3_g4_a_4(answer) {
		return [rtl_1ans('54', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g4_a_5(answer) {
		return [ltr_div('98r6', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b3_g4_a_6(answer) {
		return [rtl_1ans('67', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g4_a_7(answer) {
		return [rtl_fraction('7/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g4_a_8(answer) {
		return [rtl_1ans('3887', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_a_9(answer) {
		return [rtl_1ans('492', [2,5,8], answer), getMax([2,5,8])] 
	}, 
	function b3_g4_a_10(answer) {
		return [rtl_fraction('1 1/6', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b3_g4_a_11(answer) {
		return [ltr_div('101r8', [2,4,7,10], answer), getMax([2,4,7,10])] 
	}, 
	function b3_g4_a_12(answer) {
		return [ltr_div('9', [1], answer), getMax([1])] 
	}, 
	function b3_g4_a_13(answer) {
		return [rtl_1ans('1184', [2,4,7,10], answer), getMax([2,4,7,10])] 
	}, 
	function b3_g4_a_14(answer) {
		return [rtl_fraction('3/4', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g4_a_15(answer) {
		return [rtl_1ans('5124', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_a_16(answer) {
		return [Math.max(
			rtl_fraction('7 1/2', [0,0,4], answer, true),
			rtl_fraction(' 7 2/4', [1,2,3], answer, false)), getMax(getDigitList(['[0,0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b3_g4_a_17(answer) {
		return [rtl_fraction('2/3', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g4_a_18(answer) {
		return [Math.max(
			rtl_fraction('1/2', [0,3], answer, true),
			rtl_fraction(' 3/6', [1,2], answer, false)), getMax(getDigitList(['[0,3', ',[1,2', ''])) 
		]
	}, 
	function b3_g4_a_19(answer) {
		return [rtl_1ans('5634', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_a_20(answer) {
		return [ltr_div('258r1', [3,6,10,14], answer), getMax([3,6,10,14])] 
	}, 
	function b3_g4_a_21(answer) {
		return [ltr_div('200r2', [3,6,9,12], answer), getMax([3,6,9,12])] 
	}, 
	function b3_g4_a_22(answer) {
		return [rtl_1ans('2024', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b3_g4_a_23(answer) {
		return [rtl_1ans('6877', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_a_24(answer) {
		return [rtl_1ans('3421', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_a_25(answer) {
		return [rtl_1ans('627', [2,5,8], answer), getMax([2,5,8])] 
	}
]

let b3_g4_b = [
	function b3_g4_b_1(answer) {
		return [rtl_1ans('898', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g4_b_2(answer) {
		return [rtl_1ans('3632', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_3(answer) {
		return [rtl_fraction('6 2/3', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b3_g4_b_4(answer) {
		return [rtl_1ans('63', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g4_b_5(answer) {
		return [ltr_div('184r2', [3,6,10,14], answer), getMax([3,6,10,14])] 
	}, 
	function b3_g4_b_6(answer) {
		return [rtl_1ans('340', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g4_b_7(answer) {
		return [Math.max(
			rtl_fraction('1/2', [0,3], answer, true),
			rtl_fraction('3/6', [1,2], answer, false)), getMax(getDigitList(['[0,3', ',[1,2', ''])) 
		]
	}, 
	function b3_g4_b_8(answer) {
		return [rtl_1ans('6488', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_9(answer) {
		return [rtl_1ans('869', [2,5,8], answer), getMax([2,5,8])] 
	}, 
	function b3_g4_b_10(answer) {
		return [rtl_fraction('11 7/8', [1,2,3,4], answer, false), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_11(answer) {
		return [ltr_div('313r1', [3,6,9,12], answer), getMax([3,6,9,12])] 
	}, 
	function b3_g4_b_12(answer) {
		return [ltr_div('3', [1], answer), getMax([1])] 
	}, 
	function b3_g4_b_13(answer) {
		return [rtl_1ans('4704', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b3_g4_b_14(answer) {
		return [Math.max(
			rtl_fraction('1/2', [0,3], answer, true),
			rtl_fraction('2/4', [1,2], answer, false)), getMax(getDigitList(['[0,3', ',[1,2', ''])) 
		]
	}, 
	function b3_g4_b_15(answer) {
		return [rtl_1ans('1518', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_16(answer) {
		return [Math.max(
			rtl_fraction('7 1/2', [0,0,4], answer, true),
			rtl_fraction('7 2/4', [1,2,3], answer, false)), getMax(getDigitList(['[0,0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b3_g4_b_17(answer) {
		return [rtl_fraction('1/5', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g4_b_18(answer) {
		return [rtl_fraction('5/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g4_b_19(answer) {
		return [rtl_1ans('4904', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_20(answer) {
		return [ltr_div('46r8', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b3_g4_b_21(answer) {
		return [ltr_div('111r2', [3,6,9,12], answer), getMax([3,6,9,12])] 
	}, 
	function b3_g4_b_22(answer) {
		return [rtl_1ans('650', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b3_g4_b_23(answer) {
		return [rtl_1ans('6287', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_24(answer) {
		return [rtl_1ans('9101', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g4_b_25(answer) {
		return [rtl_1ans('935', [2,5,8], answer), getMax([2,5,8])] 
	}
]

let b1_g5_a = [
	function b1_g5_a_1(answer) {
		return [rtl_1ans('8005', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_a_2(answer) {
		return [rtl_1ans('2730', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g5_a_3(answer) {
		return [rtl_fraction('3 1/6', [3,6,9], answer, false), getMax([3,6,9])] 
	}, 
	function b1_g5_a_4(answer) {
		return [rtl_1ans('61625', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b1_g5_a_5(answer) {
		return [ltr_div('76', [6,12], answer), getMax([6,12])] 
	}, 
	function b1_g5_a_6(answer) {
		return [ltr_div('90r6', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b1_g5_a_7(answer) {
		return [rtl_fraction('4 1/4', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b1_g5_a_8(answer) {
		return [rtl_fraction('3/4', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g5_a_9(answer) {
		return [rtl_1ans('6529', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_a_10(answer) {
		return [rtl_1ans('2244', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_a_11(answer) {
		return [ltr_div('25', [5,11], answer), getMax([5,11])] 
	}, 
	function b1_g5_a_12(answer) {
		return [rtl_fraction('39/40', [2,4,6,8], answer, false), getMax([2,4,6,8])] 
	}, 
	function b1_g5_a_13(answer) {
		return [ltr_div('50', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g5_a_14(answer) {
		return [rtl_1ans('9823', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g5_a_15(answer) {
		return [Math.max(
			rtl_fraction('10 7/18', [0,0,0,0,12], answer, true),
			rtl_fraction(' 9 25/18', [2,4,6,8,11], answer, false)), getMax(getDigitList(['[0,0,0,0,12', ',[2,4,6,8,11', ''])) 
		]
	}, 
	function b1_g5_a_16(answer) {
		return [rtl_1ans('43378', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}
]

let b1_g5_b = [
	function b1_g5_b_1(answer) {
		return [rtl_1ans('6242', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_b_2(answer) {
		return [rtl_1ans('7414', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g5_b_3(answer) {
		return [rtl_fraction('4 1/14', [2,4,7,10], answer, false), getMax([2,4,7,10])] 
	}, 
	function b1_g5_b_4(answer) {
		return [rtl_1ans('52272', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b1_g5_b_5(answer) {
		return [ltr_div('84', [6,12], answer), getMax([6,12])] 
	}, 
	function b1_g5_b_6(answer) {
		return [ltr_div('445r1', [3,6,9,13], answer), getMax([3,6,9,13])] 
	}, 
	function b1_g5_b_7(answer) {
		return [rtl_fraction('6 4/5', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b1_g5_b_8(answer) {
		return [Math.max(
			rtl_fraction('1/5', [0,4], answer, true),
			rtl_fraction(' 2/10', [1,2,3], answer, false)), getMax(getDigitList(['[0,4', ',[1,2,3', ''])) 
		]
	}, 
	function b1_g5_b_9(answer) {
		return [rtl_1ans('7776', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_b_10(answer) {
		return [rtl_1ans('5352', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_b_11(answer) {
		return [ltr_div('12', [5,11], answer), getMax([5,11])] 
	}, 
	function b1_g5_b_12(answer) {
		return [rtl_fraction('25/36', [2,4,6,8], answer, false), getMax([2,4,6,8])] 
	}, 
	function b1_g5_b_13(answer) {
		return [ltr_div('50', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g5_b_14(answer) {
		return [rtl_1ans('5830', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b1_g5_b_15(answer) {
		return [Math.max(
			rtl_fraction('5 9/10', [0,0,0,14], answer, true),
			rtl_fraction(' 5 18/20',  [0,0,0,0,13], answer, true),
			rtl_fraction(' 59/10',  [0,0,0,13], answer, true),
			rtl_fraction(' 118/20',  [2,4,6,9,12], answer, false)), getMax(getDigitList(['[0,0,0,14', ', [0,0,0,0,13', ', [0,0,0,13', ', [2,4,6,9,12', ''])) 
		]
	}, 
	function b1_g5_b_16(answer) {
		return [rtl_1ans('16020', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}
]

let b3_g5_a = [
	function b3_g5_a_1(answer) {
		return [rtl_1ans('9512', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_a_2(answer) {
		return [rtl_1ans('7975', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b3_g5_a_3(answer) {
		return [Math.max(
			rtl_fraction('3 7/10', [0,0,0,15], answer, true),
			rtl_fraction(' 37/10', [3,6,10,14], answer, false)), getMax(getDigitList(['[0,0,0,15', ',[3,6,10,14', ''])) 
		]
	}, 
	function b3_g5_a_4(answer) {
		return [rtl_1ans('33733', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b3_g5_a_5(answer) {
		return [ltr_div('98', [6,12], answer), getMax([6,12])] 
	}, 
	function b3_g5_a_6(answer) {
		return [ltr_div('102r4', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b3_g5_a_7(answer) {
		return [Math.max(
			rtl_fraction('9 1/2', [0,0,5], answer, true),
			rtl_fraction(' 9 5/10', [1,2,3,4], answer, false)), getMax(getDigitList(['[0,0,5', ',[1,2,3,4', ''])) 
		]
	}, 
	function b3_g5_a_8(answer) {
		return [Math.max(
			rtl_fraction('1/2', [0,3], answer, true),
			rtl_fraction(' 2/4', [1,2], answer, false)), getMax(getDigitList(['[0,3', ',[1,2', ''])) 
		]
	}, 
	function b3_g5_a_9(answer) {
		return [rtl_1ans('1849', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_a_10(answer) {
		return [rtl_1ans('4144', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_a_11(answer) {
		return [ltr_div('7', [5], answer), getMax([5])] 
	}, 
	function b3_g5_a_12(answer) {
		return [Math.max(
			rtl_fraction('1 22/63', [0,0,0,0,9], answer, true),
			rtl_fraction(' 85/63', [2,4,6,8], answer, false)), getMax(getDigitList(['[0,0,0,0,9', ',[2,4,6,8', ''])) 
		]
	}, 
	function b3_g5_a_13(answer) {
		return [ltr_div('40', [4,9], answer), getMax([4,9])] 
	}, 
	function b3_g5_a_14(answer) {
		return [rtl_1ans('10263', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b3_g5_a_15(answer) {
		return [rtl_fraction('9 7/12', [2,4,7,10], answer, false), getMax([2,4,7,10])] 
	}, 
	function b3_g5_a_16(answer) {
		return [rtl_1ans('12972', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}
]

let b3_g5_b = [
	function b3_g5_b_1(answer) {
		return [rtl_1ans('8733', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_b_2(answer) {
		return [rtl_1ans('4860', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b3_g5_b_3(answer) {
		return [Math.max(
			rtl_fraction('10 1/4', [0,0,0,12], answer, true),
			rtl_fraction(' 9 5/4',  [0,0,11], answer, true),
			rtl_fraction(' 10 2/8',  [0,0,0,11], answer, true),
			rtl_fraction(' 9 10/8',  [2,4,7,10], answer, false)), getMax(getDigitList(['[0,0,0,12', ', [0,0,11', ', [0,0,0,11', ', [2,4,7,10', ''])) 
		]
	}, 
	function b3_g5_b_4(answer) {
		return [rtl_1ans('28210', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b3_g5_b_5(answer) {
		return [ltr_div('38', [6,12], answer), getMax([6,12])] 
	}, 
	function b3_g5_b_6(answer) {
		return [ltr_div('50r4', [3,6,9], answer), getMax([3,6,9])] 
	}, 
	function b3_g5_b_7(answer) {
		return [rtl_fraction('9 3/4', [1,2,3], answer, false), getMax([1,2,3])] 
	}, 
	function b3_g5_b_8(answer) {
		return [rtl_fraction('4/5', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g5_b_9(answer) {
		return [rtl_1ans('4806', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_b_10(answer) {
		return [rtl_1ans('6244', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_b_11(answer) {
		return [ltr_div('15', [5,11], answer), getMax([5,11])] 
	}, 
	function b3_g5_b_12(answer) {
		return [Math.max(
			rtl_fraction('1 23/35', [0,0,0,0,11], answer, true),
			rtl_fraction(' 58/35',  [0,0,0,10], answer, true),
			rtl_fraction(' 1 46/70',  [0,0,0,0,10], answer, true),
			rtl_fraction(' 116/70',  [1,3,5,7,9], answer, false)), getMax(getDigitList(['[0,0,0,0,11', ', [0,0,0,10', ', [0,0,0,0,10', ', [1,3,5,7,9', ''])) 
		]
	}, 
	function b3_g5_b_13(answer) {
		return [ltr_div('280', [5,10,15], answer), getMax([5,10,15])] 
	}, 
	function b3_g5_b_14(answer) {
		return [rtl_1ans('4660', [2,5,8,11], answer), getMax([2,5,8,11])] 
	}, 
	function b3_g5_b_15(answer) {
		return [Math.max(
			rtl_fraction('5', [10], answer, true),
			rtl_fraction(' 4 4/4', [3,6,9], answer, false)), getMax(getDigitList(['[10', ',[3,6,9', ''])) 
		]
	}, 
	function b3_g5_b_16(answer) {
		return [rtl_1ans('72384', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}
]

let b1_g6_a = [
	function b1_g6_a_1(answer) {
		return [rtl_1ans('88.9', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_a_2(answer) {
		return [rtl_1ans('1.32', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_a_3(answer) {
		return [rtl_1ans('45708', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b1_g6_a_4(answer) {
		return [ltr_div('190', [5,10,15], answer), getMax([5,10,15])] 
	}, 
	function b1_g6_a_5(answer) {
		return [Math.max(
			rtl_fraction('3 1/6', [0,0,9], answer, true),
			rtl_fraction(' 3 3/18', [2,4,6,8], answer, false)), getMax(getDigitList(['[0,0,9', ',[2,4,6,8', ''])) 
		]
	}, 
	function b1_g6_a_6(answer) {
		return [rtl_1ans('40.72', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b1_g6_a_7(answer) {
		return [rtl_1ans('46.81', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b1_g6_a_8(answer) {
		return [rtl_1ans('96.72', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b1_g6_a_9(answer) {
		return [ltr_div('610', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b1_g6_a_10(answer) {
		return [rtl_1ans('9.02', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_a_11(answer) {
		return [rtl_1ans('8.1', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g6_a_12(answer) {
		return [ltr_div('199', [6,12,18], answer), getMax([6,12,18])] 
	}, 
	function b1_g6_a_13(answer) {
		return [rtl_1ans('70.848', [2,4,6,9,12,15], answer), getMax([2,4,6,9,12,15])] 
	}, 
	function b1_g6_a_14(answer) {
		return [ltr_div('0.3', [3,6], answer), getMax([3,6])] 
	}, 
	function b1_g6_a_15(answer) {
		return [rtl_1ans('1.79', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_a_16(answer) {
		return [ltr_div('10.3', [4,7,10,14], answer), getMax([4,7,10,14])] 
	}
]

let b1_g6_b = [
	function b1_g6_b_1(answer) {
		return [rtl_1ans('68.3', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_b_2(answer) {
		return [rtl_1ans('1.11', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_b_3(answer) {
		return [rtl_1ans('61542', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b1_g6_b_4(answer) {
		return [ltr_div('30', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g6_b_5(answer) {
		return [rtl_fraction('5 1/9', [2,4,7], answer, false), getMax([2,4,7])] 
	}, 
	function b1_g6_b_6(answer) {
		return [rtl_1ans('63.21', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b1_g6_b_7(answer) {
		return [rtl_1ans('26.79', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b1_g6_b_8(answer) {
		return [rtl_1ans('88.83', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b1_g6_b_9(answer) {
		return [ltr_div('50', [3,6], answer), getMax([3,6])] 
	}, 
	function b1_g6_b_10(answer) {
		return [rtl_1ans('7.05', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_b_11(answer) {
		return [rtl_1ans('9.8', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g6_b_12(answer) {
		return [ltr_div('225', [5,10,16], answer), getMax([5,10,16])] 
	}, 
	function b1_g6_b_13(answer) {
		return [rtl_1ans('23.736', [2,4,6,9,12,15], answer), getMax([2,4,6,9,12,15])] 
	}, 
	function b1_g6_b_14(answer) {
		return [ltr_div('1.8', [4,8,12], answer), getMax([4,8,12])] 
	}, 
	function b1_g6_b_15(answer) {
		return [rtl_1ans('4.85', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g6_b_16(answer) {
		return [ltr_div('10.7', [4,7,10,14], answer), getMax([4,7,10,14])] 
	}
]

let b3_g6_a = [
	function b3_g6_a_1(answer) {
		return [rtl_1ans('49.8', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_a_2(answer) {
		return [rtl_1ans('2.22', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_a_3(answer) {
		return [rtl_1ans('20925', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b3_g6_a_4(answer) {
		return [ltr_div('30', [4,9], answer), getMax([4,9])] 
	}, 
	function b3_g6_a_5(answer) {
		return [Math.max(
			rtl_fraction('9 4/5', [0,0,9], answer, true),
			rtl_fraction(' 9 8/10', [2,4,6,8], answer, false)), getMax(getDigitList(['[0,0,9', ',[2,4,6,8', ''])) 
		]
	}, 
	function b3_g6_a_6(answer) {
		return [rtl_1ans('63.15', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b3_g6_a_7(answer) {
		return [rtl_1ans('53.48', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b3_g6_a_8(answer) {
		return [rtl_1ans('38.88', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b3_g6_a_9(answer) {
		return [ltr_div('310', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b3_g6_a_10(answer) {
		return [rtl_1ans('8.63', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_a_11(answer) {
		return [rtl_1ans('15.6', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_a_12(answer) {
		return [ltr_div('96', [6,12], answer), getMax([6,12])] 
	}, 
	function b3_g6_a_13(answer) {
		return [rtl_1ans('50.735', [2,4,6,9,12,15], answer), getMax([2,4,6,9,12,15])] 
	}, 
	function b3_g6_a_14(answer) {
		return [ltr_div('0.6', [3,6], answer), getMax([3,6])] 
	}, 
	function b3_g6_a_15(answer) {
		return [rtl_1ans('2.34', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_a_16(answer) {
		return [ltr_div('10.3', [4,7,10,14], answer), getMax([4,7,10,14])] 
	}
]

let b3_g6_b = [
	function b3_g6_b_1(answer) {
		return [rtl_1ans('86.9', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_b_2(answer) {
		return [rtl_1ans('3.12', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_b_3(answer) {
		return [rtl_1ans('61304', [2,5,8,11,14], answer), getMax([2,5,8,11,14])] 
	}, 
	function b3_g6_b_4(answer) {
		return [ltr_div('110', [4,8,13], answer), getMax([4,8,13])] 
	}, 
	function b3_g6_b_5(answer) {
		return [Math.max(
			rtl_fraction('3 1/2', [0,0,9], answer, true),
			rtl_fraction(' 3 6/12', [2,4,6,8], answer, false)), getMax(getDigitList(['[0,0,9', ',[2,4,6,8', ''])) 
		]
	}, 
	function b3_g6_b_6(answer) {
		return [rtl_1ans('30.5', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b3_g6_b_7(answer) {
		return [rtl_1ans('72.57', [1,2,3,4,5], answer), getMax([1,2,3,4,5])] 
	}, 
	function b3_g6_b_8(answer) {
		return [rtl_1ans('48.99', [2,4,6,9,12], answer), getMax([2,4,6,9,12])] 
	}, 
	function b3_g6_b_9(answer) {
		return [ltr_div('320', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b3_g6_b_10(answer) {
		return [rtl_1ans('6.1', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_b_11(answer) {
		return [rtl_1ans('28.8', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_b_12(answer) {
		return [ltr_div('114', [5,10,16], answer), getMax([5,10,16])] 
	}, 
	function b3_g6_b_13(answer) {
		return [rtl_1ans('13.794', [2,4,6,9,12,15], answer), getMax([2,4,6,9,12,15])] 
	}, 
	function b3_g6_b_14(answer) {
		return [ltr_div('1.2', [4,8,12], answer), getMax([4,8,12])] 
	}, 
	function b3_g6_b_15(answer) {
		return [rtl_1ans('5.48', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g6_b_16(answer) {
		return [ltr_div('40.2', [4,7,10,14], answer), getMax([4,7,10,14])] 
	}
]

let b1_g1_a = [
	function b1_g1_a_1(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_2(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_3(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_4(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_5(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_6(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_7(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_8(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_9(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_10(answer) {
		return [rtl_1ans('5', [1,], answer), getMax([1,])] 
	}, 
	function b1_g1_a_11(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_12(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_13(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_14(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_15(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_16(answer) {
		return [rtl_1ans('1', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_17(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_18(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_19(answer) {
		return [rtl_1ans('13', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_20(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_21(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_22(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b1_g1_a_23(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_a_24(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}
]

let b1_g1_b = [
	function b1_g1_b_1(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_2(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_3(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_4(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_5(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_6(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_7(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_8(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_9(answer) {
		return [rtl_1ans('17', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_10(answer) {
		return [rtl_1ans('3', [1,], answer), getMax([1,])] 
	}, 
	function b1_g1_b_11(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_12(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_13(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_14(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_15(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_16(answer) {
		return [rtl_1ans('19', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_17(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_18(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_19(answer) {
		return [rtl_1ans('19', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_20(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_21(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b1_g1_b_22(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_23(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g1_b_24(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}
]

let b2_g1_a = [
	function b2_g1_a_1(answer) {
		return [rtl_1ans('7', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_2(answer) {
		return [rtl_1ans('11', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_3(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_4(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_5(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_6(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_7(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_8(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_9(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_10(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_11(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_12(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_13(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_14(answer) {
		return [rtl_1ans('13', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_15(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_16(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_17(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_18(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_19(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_20(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_21(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b2_g1_a_22(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_23(answer) {
		return [rtl_1ans('19', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_a_24(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}
]

let b2_g1_b = [
	function b2_g1_b_1(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g1_b_2(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}
]

let b3_g1_a = [
	function b3_g1_a_1(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_2(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_3(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_4(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_5(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_6(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_7(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_8(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_9(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_10(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_11(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_12(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_13(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_14(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_15(answer) {
		return [rtl_1ans('12', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_16(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_17(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_18(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_19(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_20(answer) {
		return [rtl_1ans('14', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_21(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b3_g1_a_22(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_23(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_a_24(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}
]

let b3_g1_b = [
	function b3_g1_b_1(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_2(answer) {
		return [rtl_1ans('13', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_3(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_4(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_5(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_6(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_7(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_8(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_9(answer) {
		return [rtl_1ans('19', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_10(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_11(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_12(answer) {
		return [rtl_1ans('20', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_13(answer) {
		return [rtl_1ans('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_14(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_15(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_16(answer) {
		return [rtl_1ans('19', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_17(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_18(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_19(answer) {
		return [rtl_1ans('18', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_20(answer) {
		return [rtl_1ans('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_21(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b3_g1_b_22(answer) {
		return [rtl_1ans('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_23(answer) {
		return [rtl_1ans('19', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g1_b_24(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}
]

let b1_g2_c = [
	function b1_g2_c_1a(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_1b(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_1c(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_1d(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_1e(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_c_2(answer) {
		return [single_exact_answer('3', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_3a(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_3b(answer) {
		return [single_exact_answer('>', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_3c(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_4(answer) {
		return [single_exact_answer('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_c_5(answer) {
		return [rtl_1ans('15', [2,5], answer), getMax([2,5])] 
	}, 
	function b1_g2_c_6(answer) {
		return [num_correct('2', [1,2], answer), getMax([1,2])] 
	}
]

let b1_g2_d = [
	function b1_g2_d_7(answer) {
		return [rtl_1ans('11', [2,4], answer), getMax([2,4])] 
	}, 
	function b1_g2_d_8(answer) {
		return [rtl_1ans('4', [3], answer), getMax([3])] 
	}, 
	function b1_g2_d_9(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b1_g2_d_10(answer) {
		return [rtl_1ans('613', [3,5,8], answer), getMax([3,5,8])] 
	}, 
	function b1_g2_d_11(answer) {
		return [rtl_1ans('14', [2,5], answer), getMax([2,5])] 
	}, 
	function b1_g2_d_12(answer) {
		return [rtl_1ans('9', [4], answer), getMax([4])] 
	}
]

let b1_g2_e = [
	function b1_g2_e_13a(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_13b(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_13c(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_13d(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_13e(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_13f(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_14a(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b1_g2_e_14b(answer) {
		return [rtl_1ans('25', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g2_e_15(answer) {
		return [rtl_1ans('6', [7], answer), getMax([7])] 
	}, 
	function b1_g2_e_16(answer) {
		return [rtl_1ans('71', [5,11], answer), getMax([5,11])] 
	}
]

let b2_g2_c = [
	function b2_g2_c_1a(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_1b(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_1c(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_2(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_3a(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_3b(answer) {
		return [single_exact_answer('>', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_3c(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_4(answer) {
		return [single_exact_answer('10', [1], answer), getMax([1])] 
	}, 
	function b2_g2_c_5(answer) {
		return [rtl_1ans('14', [2,5], answer), getMax([2,5])] 
	}, 
	function b2_g2_c_6(answer) {
		return [num_correct('2', [1,2], answer), getMax([1,2])] 
	}
]

let b2_g2_d = [
	function b2_g2_d_7(answer) {
		return [rtl_1ans('14', [2,4], answer), getMax([2,4])] 
	}, 
	function b2_g2_d_8(answer) {
		return [rtl_1ans('5', [3], answer), getMax([3])] 
	}, 
	function b2_g2_d_9(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b2_g2_d_10(answer) {
		return [rtl_1ans('497', [3,5,8], answer), getMax([3,5,8])] 
	}, 
	function b2_g2_d_11(answer) {
		return [rtl_1ans('20', [2,5], answer), getMax([2,5])] 
	}
]

let b2_g2_e = [
	function b2_g2_e_12(answer) {
		return [rtl_1ans('9', [4], answer), getMax([4])] 
	}, 
	function b2_g2_e_13a(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_13b(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_13c(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_13d(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_13e(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_13f(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_14a(answer) {
		return [rtl_1ans('7', [1], answer), getMax([1])] 
	}, 
	function b2_g2_e_14b(answer) {
		return [ltr_div('10', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g2_e_15(answer) {
		return [rtl_1ans('2', [7], answer), getMax([7])] 
	}, 
	function b2_g2_e_16(answer) {
		return [rtl_1ans('37', [4,8], answer), getMax([4,8])] 
	}
]

let b3_g2_c = [
	function b3_g2_c_1a(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_1b(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_1c(answer) {
		return [rtl_1ans('3', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_1d(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_2(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_3a(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_3b(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_3c(answer) {
		return [single_exact_answer('>', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_4(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b3_g2_c_5(answer) {
		return [rtl_1ans('22', [2,5], answer), getMax([2,5])] 
	}, 
	function b3_g2_c_6(answer) {
		return [num_correct('2', [1,2], answer), getMax([1,2])] 
	}
]

let b3_g2_d = [
	function b3_g2_d_7(answer) {
		return [rtl_1ans('14', [2,4], answer), getMax([2,4])] 
	}, 
	function b3_g2_d_8(answer) {
		return [rtl_1ans('6', [4], answer), getMax([4])] 
	}, 
	function b3_g2_d_9(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b3_g2_d_10(answer) {
		return [rtl_1ans('339', [3,5,8], answer), getMax([3,5,8])] 
	}, 
	function b3_g2_d_11(answer) {
		return [rtl_1ans('23', [2,5], answer), getMax([2,5])] 
	}
]

let b3_g2_e = [
	function b3_g2_e_12(answer) {
		return [rtl_1ans('6', [4], answer), getMax([4])] 
	}, 
	function b3_g2_e_13a(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_13b(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_13c(answer) {
		return [rtl_1ans('2', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_13d(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_13e(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_13f(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_14a(answer) {
		return [rtl_1ans('1', [1], answer), getMax([1])] 
	}, 
	function b3_g2_e_14b(answer) {
		return [ltr_div('50', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g2_e_15(answer) {
		return [rtl_1ans('8', [9], answer), getMax([9])] 
	}, 
	function b3_g2_e_16(answer) {
		return [rtl_1ans('46', [4,9], answer), getMax([4,9])] 
	}
]

let b1_g3_c = [
	function b1_g3_c_1a(answer) {
		return [rtl_1ans('8', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_1b(answer) {
		return [rtl_1ans('16', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_c_2(answer) {
		return [rtl_fraction('4/6', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g3_c_3a(answer) {
		return [single_exact_answer('250', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3b(answer) {
		return [single_exact_answer('300', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3c(answer) {
		return [single_exact_answer('740', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3d(answer) {
		return [single_exact_answer('700', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3e(answer) {
		return [single_exact_answer('220', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3f(answer) {
		return [single_exact_answer('200', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3g(answer) {
		return [single_exact_answer('840', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_3h(answer) {
		return [single_exact_answer('800', [1], answer), getMax([1])] 
	}, 
	function b1_g3_c_4(answer) {
		return [rtl_1ans('15', [2,4], answer), getMax([2,4])] 
	}, 
	function b1_g3_c_5a(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b1_g3_c_5b(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}
]

let b1_g3_d = [
	function b1_g3_d_6(answer) {
		return [rtl_1ans('9', [3], answer), getMax([3])] 
	}, 
	function b1_g3_d_7(answer) {
		return [rtl_1ans('28', [2,4], answer), getMax([2,4])] 
	}, 
	function b1_g3_d_8a(answer) {
		return [rtl_fraction('5/1', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g3_d_8b(answer) {
		return [rtl_fraction('8/1', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b1_g3_d_9(answer) {
		return [rtl_1ans('5', [4], answer), getMax([4])] 
	}, 
	function b1_g3_d_10(answer) {
		return [rtl_1ans('2', [4], answer), getMax([4])] 
	}, 
	function b1_g3_d_11(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b1_g3_d_12(answer) {
		return [rtl_1ans('3', [4], answer), getMax([4])] 
	}
]

let b1_g3_e = [
	function b1_g3_e_13(answer) {
		return [rtl_1ans('72', [4,8], answer), getMax([4,8])] 
	}, 
	function b1_g3_e_14(answer) {
		return [rtl_1ans('6', [1], answer), getMax([1])] 
	}, 
	function b1_g3_e_15(answer) {
		return [rtl_1ans('32', [3,7], answer), getMax([3,7])] 
	}, 
	function b1_g3_e_16a(answer) {
		return [rtl_1ans('9', [1], answer), getMax([1])] 
	}, 
	function b1_g3_e_16b(answer) {
		return [rtl_1ans('00', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g3_e_17(answer) {
		return [rtl_1ans('64', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g3_e_18(answer) {
		return [rtl_1ans('84', [5,10], answer), getMax([5,10])] 
	}
]

let b1_g3_f = [
	function b1_g3_f_19(answer) {
		return [rtl_1ans('44', [5,11], answer), getMax([5,11])] 
	}, 
	function b1_g3_f_20(answer) {
		return [rtl_1ans('112', [2,4,6], answer), getMax([2,4,6])] 
	}
]

let b2_g3_c = [
	function b2_g3_c_1a(answer) {
		return [ltr_div('11', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_c_1b(answer) {
		return [rtl_1ans('06', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_c_2(answer) {
		return [rtl_fraction('3/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g3_c_3a(answer) {
		return [single_exact_answer('370', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3b(answer) {
		return [single_exact_answer('400', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3c(answer) {
		return [single_exact_answer('940', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3d(answer) {
		return [single_exact_answer('900', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3e(answer) {
		return [single_exact_answer('760', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3f(answer) {
		return [single_exact_answer('800', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3g(answer) {
		return [single_exact_answer('830', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_3h(answer) {
		return [single_exact_answer('800', [1], answer), getMax([1])] 
	}, 
	function b2_g3_c_4(answer) {
		return [rtl_1ans('21', [2,4], answer), getMax([2,4])] 
	}, 
	function b2_g3_c_5a(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b2_g3_c_5b(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}
]

let b2_g3_d = [
	function b2_g3_d_6(answer) {
		return [rtl_1ans('14', [2,4], answer), getMax([2,4])] 
	}, 
	function b2_g3_d_7(answer) {
		return [rtl_1ans('48', [2,4], answer), getMax([2,4])] 
	}, 
	function b2_g3_d_8a(answer) {
		return [rtl_fraction('4/1', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g3_d_8b(answer) {
		return [rtl_fraction('8/1', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b2_g3_d_9(answer) {
		return [rtl_1ans('6', [4], answer), getMax([4])] 
	}, 
	function b2_g3_d_10(answer) {
		return [rtl_1ans('3', [4], answer), getMax([4])] 
	}, 
	function b2_g3_d_11(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b2_g3_d_12(answer) {
		return [rtl_1ans('56', [2,5], answer), getMax([2,5])] 
	}
]

let b2_g3_e = [
	function b2_g3_e_13(answer) {
		return [rtl_1ans('52', [4,8], answer), getMax([4,8])] 
	}, 
	function b2_g3_e_14(answer) {
		return [single_exact_answer('10', [1], answer), getMax([1])] 
	}, 
	function b2_g3_e_15(answer) {
		return [rtl_1ans('40', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g3_e_16a(answer) {
		return [rtl_1ans('4', [1], answer), getMax([1])] 
	}, 
	function b2_g3_e_16b(answer) {
		return [ltr_div('30', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g3_e_17(answer) {
		return [rtl_1ans('30', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g3_e_18(answer) {
		return [rtl_1ans('72', [4,8], answer), getMax([4,8])] 
	}
]

let b2_g3_f = [
	function b2_g3_f_19(answer) {
		return [rtl_1ans('36', [5,11], answer), getMax([5,11])] 
	}, 
	function b2_g3_f_20(answer) {
		return [rtl_1ans('117', [2,4,6], answer), getMax([2,4,6])] 
	}
]

let b3_g3_c = [
	function b3_g3_c_1a(answer) {
		return [ltr_div('4', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_1b(answer) {
		return [ltr_div('57', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_c_2(answer) {
		return [rtl_fraction('2/8', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g3_c_3a(answer) {
		return [single_exact_answer('500', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3b(answer) {
		return [single_exact_answer('500', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3c(answer) {
		return [single_exact_answer('260', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3d(answer) {
		return [single_exact_answer('300', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3e(answer) {
		return [single_exact_answer('770', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3f(answer) {
		return [single_exact_answer('800', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3g(answer) {
		return [single_exact_answer('630', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_3h(answer) {
		return [single_exact_answer('600', [1], answer), getMax([1])] 
	}, 
	function b3_g3_c_4(answer) {
		return [rtl_1ans('12', [2,4], answer), getMax([2,4])] 
	}, 
	function b3_g3_c_5a(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b3_g3_c_5b(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}
]

let b3_g3_d = [
	function b3_g3_d_6(answer) {
		return [rtl_1ans('8', [3], answer), getMax([3])] 
	}, 
	function b3_g3_d_7(answer) {
		return [rtl_1ans('28', [2,4], answer), getMax([2,4])] 
	}, 
	function b3_g3_d_8a(answer) {
		return [rtl_fraction('6/1', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g3_d_8b(answer) {
		return [rtl_fraction('3/1', [1,2], answer, false), getMax([1,2])] 
	}, 
	function b3_g3_d_9(answer) {
		return [rtl_1ans('5', [4], answer), getMax([4])] 
	}, 
	function b3_g3_d_10(answer) {
		return [rtl_1ans('7', [4], answer), getMax([4])] 
	}, 
	function b3_g3_d_11(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b3_g3_d_12(answer) {
		return [rtl_1ans('68', [2,5], answer), getMax([2,5])] 
	}
]

let b3_g3_e = [
	function b3_g3_e_13(answer) {
		return [rtl_1ans('6', [11], answer), getMax([11])] 
	}, 
	function b3_g3_e_14(answer) {
		return [single_exact_answer('12', [1], answer), getMax([1])] 
	}, 
	function b3_g3_e_15(answer) {
		return [rtl_1ans('84', [4,9], answer), getMax([4,9])] 
	}, 
	function b3_g3_e_16a(answer) {
		return [rtl_1ans('5', [1], answer), getMax([1])] 
	}, 
	function b3_g3_e_16b(answer) {
		return [ltr_div('15', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g3_e_17(answer) {
		return [rtl_1ans('72', [4,9], answer), getMax([4,9])] 
	}, 
	function b3_g3_e_18(answer) {
		return [rtl_1ans('76', [5,10], answer), getMax([5,10])] 
	}
]

let b3_g3_f = [
	function b3_g3_f_19(answer) {
		return [rtl_1ans('63', [4,9], answer), getMax([4,9])] 
	}, 
	function b3_g3_f_20(answer) {
		return [rtl_1ans('128', [2,4,6], answer), getMax([2,4,6])] 
	}
]

let b1_g4_c = [
	function b1_g4_c_1a(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_c_1b(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_c_1c(answer) {
		return [multiple_exact_answers('(no,n)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_c_2a(answer) {
		return [single_exact_answer('>', [1], answer), getMax([1])] 
	}, 
	function b1_g4_c_2b(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b1_g4_c_2c(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b1_g4_c_3a(answer) {
		return [solves_equation('X%4=0',[2], answer), getMax([2])] 
	}, 
	function b1_g4_c_3b(answer) {
		return [solves_equation('X%4=0',[2], answer), getMax([2])] 
	}, 
	function b1_g4_c_3c(answer) {
		return [solves_equation('X%4=0',[2], answer), getMax([2])] 
	}, 
	function b1_g4_c_4(answer) {
		return [rtl_1ans('22', [6,12], answer), getMax([6,12])] 
	}, 
	function b1_g4_c_5a(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b1_g4_c_5b(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b1_g4_c_5c(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b1_g4_c_6(answer) {
		return [rtl_1ans('135', [4,9,14], answer), getMax([4,9,14])] 
	}
]

let b1_g4_d = [
	function b1_g4_d_7a(answer) {
		return [single_exact_answer('c', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_7b(answer) {
		return [multiple_exact_answers('(a,d)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_7c(answer) {
		return [multiple_exact_answers('(b,e,f)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_8a(answer) {
		return [single_exact_answer('2500', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_8b(answer) {
		return [single_exact_answer('2460', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_8c(answer) {
		return [single_exact_answer('2000', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_8d(answer) {
		return [single_exact_answer('4700', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_8e(answer) {
		return [single_exact_answer('4670', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_8f(answer) {
		return [single_exact_answer('5000', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_9(answer) {
		return [rtl_1ans('4', [4], answer), getMax([4])] 
	}, 
	function b1_g4_d_10a(answer) {
		return [single_exact_answer('<', [3], answer), getMax([3])] 
	}, 
	function b1_g4_d_10b(answer) {
		return [single_exact_answer('=', [3], answer), getMax([3])] 
	}, 
	function b1_g4_d_11a(answer) {
		return [single_exact_answer('120', [2], answer), getMax([2])] 
	}, 
	function b1_g4_d_11b(answer) {
		return [single_exact_answer('420', [2], answer), getMax([2])] 
	}, 
	function b1_g4_d_11c(answer) {
		return [single_exact_answer('240', [2], answer), getMax([2])] 
	}, 
	function b1_g4_d_12(answer) {
		return [multiple_exact_answers('(yes,y)', [2], answer), getMax([2])] 
	}, 
	function b1_g4_d_13a(answer) {
		return [single_exact_answer('60000', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_13b(answer) {
		return [single_exact_answer('8000', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_13c(answer) {
		return [single_exact_answer('400', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_13d(answer) {
		return [single_exact_answer('70', [1], answer), getMax([1])] 
	}, 
	function b1_g4_d_13e(answer) {
		return [single_exact_answer('2', [1], answer), getMax([1])] 
	}
]

let b1_g4_e = [
	function b1_g4_e_14(answer) {
		return [rtl_1ans('215', [5,10,16], answer), getMax([5,10,16])] 
	}, 
	function b1_g4_e_15a(answer) {
		return [multiple_exact_answers('(0.9, .9)', [2], answer), getMax([2])] 
	}, 
	function b1_g4_e_15b(answer) {
		return [multiple_exact_answers('(0.79, .79)', [2], answer), getMax([2])] 
	}, 
	function b1_g4_e_16(answer) {
		return [rtl_1ans('2.88', [3,6,9,12], answer), getMax([3,6,9,12])] 
	}, 
	function b1_g4_e_17a(answer) {
		return [multiple_exact_answers('(37,83)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_e_17b(answer) {
		return [multiple_exact_answers('(37,83)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_e_17c(answer) {
		return [multiple_exact_answers('(90,88)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_e_17d(answer) {
		return [multiple_exact_answers('(90,88)', [1], answer), getMax([1])] 
	}, 
	function b1_g4_e_18(answer) {
		return [rtl_1ans('2', [5], answer), getMax([5])] 
	}, 
	function b1_g4_e_19(answer) {
		return [rtl_fraction('2 1/4', [3,6,9], answer, false), getMax([3,6,9])] 
	}, 
	function b1_g4_e_20(answer) {
		return [rtl_1ans('9', [4], answer), getMax([4])] 
	}
]

let b2_g4_c = [
	function b2_g4_c_1a(answer) {
		return [multiple_exact_answers('(no,n)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_c_1b(answer) {
		return [multiple_exact_answers('(no,n)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_c_1c(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_c_2a(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b2_g4_c_2b(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b2_g4_c_2c(answer) {
		return [single_exact_answer('>', [1], answer), getMax([1])] 
	}, 
	function b2_g4_c_3a(answer) {
		return [solves_equation('X%3=0',[2], answer), getMax([2])] 
	}, 
	function b2_g4_c_3b(answer) {
		return [solves_equation('X%3=0',[2], answer), getMax([2])] 
	}, 
	function b2_g4_c_3c(answer) {
		return [solves_equation('X%3=0',[2], answer), getMax([2])] 
	}, 
	function b2_g4_c_4(answer) {
		return [rtl_1ans('33', [6,12], answer), getMax([6,12])] 
	}, 
	function b2_g4_c_5a(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b2_g4_c_5b(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b2_g4_c_5c(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b2_g4_c_6(answer) {
		return [rtl_1ans('192', [4,9,14], answer), getMax([4,9,14])] 
	}
]

let b2_g4_d = [
	function b2_g4_d_7a(answer) {
		return [single_exact_answer('e', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_7b(answer) {
		return [multiple_exact_answers('(a,b,d)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_7c(answer) {
		return [multiple_exact_answers('(c,f)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_8a(answer) {
		return [single_exact_answer('8300', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_8b(answer) {
		return [single_exact_answer('8260', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_8c(answer) {
		return [single_exact_answer('8000', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_8d(answer) {
		return [single_exact_answer('6400', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_8e(answer) {
		return [single_exact_answer('6440', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_8f(answer) {
		return [single_exact_answer('6000', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_9(answer) {
		return [rtl_1ans('3', [4], answer), getMax([4])] 
	}, 
	function b2_g4_d_10a(answer) {
		return [single_exact_answer('<', [3], answer), getMax([3])] 
	}, 
	function b2_g4_d_10b(answer) {
		return [single_exact_answer('<', [3], answer), getMax([3])] 
	}, 
	function b2_g4_d_11a(answer) {
		return [single_exact_answer('48', [2], answer), getMax([2])] 
	}, 
	function b2_g4_d_11b(answer) {
		return [single_exact_answer('64', [2], answer), getMax([2])] 
	}, 
	function b2_g4_d_11c(answer) {
		return [single_exact_answer('80', [2], answer), getMax([2])] 
	}, 
	function b2_g4_d_12(answer) {
		return [multiple_exact_answers('(yes,y)', [2], answer), getMax([2])] 
	}, 
	function b2_g4_d_13a(answer) {
		return [single_exact_answer('40000', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_13b(answer) {
		return [single_exact_answer('3000', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_13c(answer) {
		return [single_exact_answer('700', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_13d(answer) {
		return [single_exact_answer('90', [1], answer), getMax([1])] 
	}, 
	function b2_g4_d_13e(answer) {
		return [single_exact_answer('7', [1], answer), getMax([1])] 
	}
]

let b2_g4_e = [
	function b2_g4_e_14(answer) {
		return [rtl_1ans('198', [5,10,16], answer), getMax([5,10,16])] 
	}, 
	function b2_g4_e_15a(answer) {
		return [multiple_exact_answers('(.1,0.1)', [2], answer), getMax([2])] 
	}, 
	function b2_g4_e_15b(answer) {
		return [multiple_exact_answers('(.35,0.35)', [2], answer), getMax([2])] 
	}, 
	function b2_g4_e_16(answer) {
		return [rtl_1ans('2.16', [4,6,8,12], answer), getMax([4,6,8,12])] 
	}, 
	function b2_g4_e_17a(answer) {
		return [multiple_exact_answers('(41,67)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_e_17b(answer) {
		return [multiple_exact_answers('(41,67)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_e_17c(answer) {
		return [multiple_exact_answers('(24,25)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_e_17d(answer) {
		return [multiple_exact_answers('(24,25)', [1], answer), getMax([1])] 
	}, 
	function b2_g4_e_18(answer) {
		return [rtl_1ans('4', [6], answer), getMax([6])] 
	}, 
	function b2_g4_e_19(answer) {
		return [rtl_fraction('2 1/4', [3,6,9], answer, false), getMax([3,6,9])] 
	}, 
	function b2_g4_e_20(answer) {
		return [rtl_1ans('7', [4], answer), getMax([4])] 
	}
]

let b3_g4_c = [
	function b3_g4_c_1a(answer) {
		return [multiple_exact_answers('(no,n)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_c_1b(answer) {
		return [multiple_exact_answers('(no,n)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_c_1c(answer) {
		return [multiple_exact_answers('(yes,y)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_c_2a(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b3_g4_c_2b(answer) {
		return [single_exact_answer('<', [1], answer), getMax([1])] 
	}, 
	function b3_g4_c_2c(answer) {
		return [single_exact_answer('>', [1], answer), getMax([1])] 
	}, 
	function b3_g4_c_3a(answer) {
		return [solves_equation('X%8=0',[2], answer), getMax([2])] 
	}, 
	function b3_g4_c_3b(answer) {
		return [solves_equation('X%8=0',[2], answer), getMax([2])] 
	}, 
	function b3_g4_c_3c(answer) {
		return [solves_equation('X%8=0',[2], answer), getMax([2])] 
	}, 
	function b3_g4_c_4(answer) {
		return [rtl_1ans('23', [6,12], answer), getMax([6,12])] 
	}, 
	function b3_g4_c_5a(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b3_g4_c_5b(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b3_g4_c_5c(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b3_g4_c_6(answer) {
		return [rtl_1ans('123', [4,8,13], answer), getMax([4,8,13])] 
	}
]

let b3_g4_d = [
	function b3_g4_d_7a(answer) {
		return [single_exact_answer('f', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_7b(answer) {
		return [multiple_exact_answers('(a,b)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_7c(answer) {
		return [multiple_exact_answers('(c,d,e)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_8a(answer) {
		return [single_exact_answer('8200', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_8b(answer) {
		return [single_exact_answer('8180', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_8c(answer) {
		return [single_exact_answer('8000', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_8d(answer) {
		return [single_exact_answer('7300', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_8e(answer) {
		return [single_exact_answer('7290', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_8f(answer) {
		return [single_exact_answer('7000', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_9(answer) {
		return [rtl_1ans('8', [4], answer), getMax([4])] 
	}, 
	function b3_g4_d_10a(answer) {
		return [single_exact_answer('<', [3], answer), getMax([3])] 
	}, 
	function b3_g4_d_10b(answer) {
		return [single_exact_answer('<', [3], answer), getMax([3])] 
	}, 
	function b3_g4_d_11a(answer) {
		return [single_exact_answer('8000', [2], answer), getMax([2])] 
	}, 
	function b3_g4_d_11b(answer) {
		return [single_exact_answer('3000', [2], answer), getMax([2])] 
	}, 
	function b3_g4_d_11c(answer) {
		return [single_exact_answer('6000', [2], answer), getMax([2])] 
	}, 
	function b3_g4_d_12(answer) {
		return [multiple_exact_answers('(yes,y)', [2], answer), getMax([2])] 
	}, 
	function b3_g4_d_13a(answer) {
		return [single_exact_answer('20000', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_13b(answer) {
		return [single_exact_answer('9000', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_13c(answer) {
		return [single_exact_answer('500', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_13d(answer) {
		return [single_exact_answer('60', [1], answer), getMax([1])] 
	}, 
	function b3_g4_d_13e(answer) {
		return [single_exact_answer('6', [1], answer), getMax([1])] 
	}
]

let b3_g4_e = [
	function b3_g4_e_14(answer) {
		return [rtl_1ans('178', [5,10,16], answer), getMax([5,10,16])] 
	}, 
	function b3_g4_e_15a(answer) {
		return [multiple_exact_answers('(.6,0.6)', [2], answer), getMax([2])] 
	}, 
	function b3_g4_e_15b(answer) {
		return [multiple_exact_answers('(.61,0.61)', [2], answer), getMax([2])] 
	}, 
	function b3_g4_e_16(answer) {
		return [rtl_1ans('7.85', [4,6,8,12], answer), getMax([4,6,8,12])] 
	}, 
	function b3_g4_e_17a(answer) {
		return [multiple_exact_answers('(37,47)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_e_17b(answer) {
		return [multiple_exact_answers('(37,47)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_e_17c(answer) {
		return [multiple_exact_answers('(48,60)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_e_17d(answer) {
		return [multiple_exact_answers('(48,60)', [1], answer), getMax([1])] 
	}, 
	function b3_g4_e_18(answer) {
		return [rtl_1ans('2', [5], answer), getMax([5])] 
	}, 
	function b3_g4_e_19(answer) {
		return [rtl_fraction('3 1/4', [3,6,9], answer, false), getMax([3,6,9])] 
	}, 
	function b3_g4_e_20(answer) {
		return [rtl_1ans('8', [4], answer), getMax([4])] 
	}
]

let b1_g5_c = [
	function b1_g5_c_1a(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b1_g5_c_1b(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b1_g5_c_1c(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b1_g5_c_2(answer) {
		return [num_correct('4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b1_g5_c_3(answer) {
		return [rtl_1ans('12', [5,10], answer), getMax([5,10])] 
	}, 
	function b1_g5_c_4(answer) {
		return [rtl_1ans('6', [9], answer), getMax([9])] 
	}, 
	function b1_g5_c_5(answer) {
		return [rtl_fraction('19/24', [2,4,6,8], answer, false), getMax([2,4,6,8])] 
	}, 
	function b1_g5_c_6a(answer) {
		return [single_exact_answer('7.5', [1], answer), getMax([1])] 
	}, 
	function b1_g5_c_6b(answer) {
		return [single_exact_answer('7.48', [1], answer), getMax([1])] 
	}, 
	function b1_g5_c_6c(answer) {
		return [single_exact_answer('7.478', [1], answer), getMax([1])] 
	}, 
	function b1_g5_c_6d(answer) {
		return [single_exact_answer('6.4', [1], answer), getMax([1])] 
	}, 
	function b1_g5_c_6e(answer) {
		return [single_exact_answer('6.44', [1], answer), getMax([1])] 
	}, 
	function b1_g5_c_6f(answer) {
		return [single_exact_answer('6.436', [1], answer), getMax([1])] 
	}
]

let b1_g5_d = [
	function b1_g5_d_7a(answer) {
		return [single_exact_answer('6', [2], answer), getMax([2])] 
	}, 
	function b1_g5_d_7b(answer) {
		return [single_exact_answer('4', [2], answer), getMax([2])] 
	}, 
	function b1_g5_d_8a(answer) {
		return [single_exact_answer('15', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8b(answer) {
		return [single_exact_answer('25', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8c(answer) {
		return [single_exact_answer('18', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8d(answer) {
		return [single_exact_answer('30', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8e(answer) {
		return [single_exact_answer('21', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8f(answer) {
		return [single_exact_answer('35', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8g(answer) {
		return [single_exact_answer('24', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8h(answer) {
		return [single_exact_answer('40', [1], answer), getMax([1])] 
	}, 
	function b1_g5_d_8i(answer) {
		return [num_correct('2', [1,2], answer), getMax([1,2])] 
	}, 
	function b1_g5_d_9(answer) {
		return [rtl_1ans('80', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g5_d_10(answer) {
		return [rtl_fraction('1/24', [1,3,5], answer, false), getMax([1,3,5])] 
	}
]

let b1_g5_e = [
	function b1_g5_e_11(answer) {
		return [rtl_1ans('1.92', [4,9,14,19], answer), getMax([4,9,14,19])] 
	}, 
	function b1_g5_e_12(answer) {
		return [multiple_exact_answers('(yes,y)', [2], answer), getMax([2])] 
	}, 
	function b1_g5_e_13(answer) {
		return [rtl_1ans('60', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g5_e_14(answer) {
		return [ltr_div('3.6', [1,3,7], answer), getMax([1,3,7])] 
	}, 
	function b1_g5_e_15(answer) {
		return [multiple_exact_answers('(yes,y)', [3], answer), getMax([3])] 
	}, 
	function b1_g5_e_16(answer) {
		return [rtl_fraction('1/16', [2,4,6], answer, false), getMax([2,4,6])] 
	}
]

let b2_g5_c = [
	function b2_g5_c_1a(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b2_g5_c_1b(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b2_g5_c_1c(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b2_g5_c_2(answer) {
		return [num_correct('4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b2_g5_c_3(answer) {
		return [rtl_1ans('29', [6,12], answer), getMax([6,12])] 
	}, 
	function b2_g5_c_4(answer) {
		return [rtl_1ans('5', [13], answer), getMax([13])] 
	}, 
	function b2_g5_c_5(answer) {
		return [rtl_fraction('5/6', [3,6], answer, false), getMax([3,6])] 
	}, 
	function b2_g5_c_6a(answer) {
		return [single_exact_answer('3.2', [1], answer), getMax([1])] 
	}, 
	function b2_g5_c_6b(answer) {
		return [single_exact_answer('3.18', [1], answer), getMax([1])] 
	}, 
	function b2_g5_c_6c(answer) {
		return [single_exact_answer('3.183', [1], answer), getMax([1])] 
	}, 
	function b2_g5_c_6d(answer) {
		return [single_exact_answer('9.2', [1], answer), getMax([1])] 
	}, 
	function b2_g5_c_6e(answer) {
		return [single_exact_answer('9.16', [1], answer), getMax([1])] 
	}, 
	function b2_g5_c_6f(answer) {
		return [single_exact_answer('9.162', [1], answer), getMax([1])] 
	}
]

let b2_g5_d = [
	function b2_g5_d_7a(answer) {
		return [single_exact_answer('6', [2], answer), getMax([2])] 
	}, 
	function b2_g5_d_7b(answer) {
		return [single_exact_answer('3', [2], answer), getMax([2])] 
	}, 
	function b2_g5_d_8a(answer) {
		return [single_exact_answer('10', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8b(answer) {
		return [single_exact_answer('20', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8c(answer) {
		return [single_exact_answer('12', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8d(answer) {
		return [single_exact_answer('24', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8e(answer) {
		return [single_exact_answer('14', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8f(answer) {
		return [single_exact_answer('28', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8g(answer) {
		return [single_exact_answer('16', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8h(answer) {
		return [single_exact_answer('32', [1], answer), getMax([1])] 
	}, 
	function b2_g5_d_8i(answer) {
		return [num_correct('2', [1,2], answer), getMax([1,2])] 
	}, 
	function b2_g5_d_9(answer) {
		return [rtl_1ans('40', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g5_d_10(answer) {
		return [rtl_fraction('2/15', [1,3,5], answer, false), getMax([1,3,5])] 
	}
]

let b2_g5_e = [
	function b2_g5_e_11(answer) {
		return [rtl_1ans('3.28', [5,10,15,20], answer), getMax([5,10,15,20])] 
	}, 
	function b2_g5_e_12(answer) {
		return [multiple_exact_answers('(yes,y)', [2], answer), getMax([2])] 
	}, 
	function b2_g5_e_13(answer) {
		return [rtl_1ans('80', [4,9], answer), getMax([4,9])] 
	}, 
	function b2_g5_e_14(answer) {
		return [ltr_div('2.8', [1,3,7], answer), getMax([1,3,7])] 
	}, 
	function b2_g5_e_15(answer) {
		return [multiple_exact_answers('(yes,y)', [3], answer), getMax([3])] 
	}, 
	function b2_g5_e_16(answer) {
		return [rtl_fraction('3/32', [2,4,6], answer, false), getMax([2,4,6])] 
	}
]

let b3_g5_c = [
	function b3_g5_c_1a(answer) {
		return [single_exact_answer('<', [2], answer), getMax([2])] 
	}, 
	function b3_g5_c_1b(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b3_g5_c_1c(answer) {
		return [single_exact_answer('>', [2], answer), getMax([2])] 
	}, 
	function b3_g5_c_2(answer) {
		return [num_correct('4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}, 
	function b3_g5_c_3(answer) {
		return [rtl_1ans('18', [6,12], answer), getMax([6,12])] 
	}, 
	function b3_g5_c_4(answer) {
		return [rtl_1ans('4', [13], answer), getMax([13])] 
	}, 
	function b3_g5_c_5(answer) {
		return [rtl_fraction('13/15', [2,4,6,8], answer, false), getMax([2,4,6,8])] 
	}, 
	function b3_g5_c_6a(answer) {
		return [single_exact_answer('4.2', [1], answer), getMax([1])] 
	}, 
	function b3_g5_c_6b(answer) {
		return [single_exact_answer('4.22', [1], answer), getMax([1])] 
	}, 
	function b3_g5_c_6c(answer) {
		return [single_exact_answer('4.222', [1], answer), getMax([1])] 
	}, 
	function b3_g5_c_6d(answer) {
		return [single_exact_answer('4.4', [1], answer), getMax([1])] 
	}, 
	function b3_g5_c_6e(answer) {
		return [single_exact_answer('4.38', [1], answer), getMax([1])] 
	}, 
	function b3_g5_c_6f(answer) {
		return [single_exact_answer('4.379', [1], answer), getMax([1])] 
	}
]

let b3_g5_d = [
	function b3_g5_d_7a(answer) {
		return [single_exact_answer('5', [2], answer), getMax([2])] 
	}, 
	function b3_g5_d_7b(answer) {
		return [single_exact_answer('4', [2], answer), getMax([2])] 
	}, 
	function b3_g5_d_8a(answer) {
		return [single_exact_answer('15', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8b(answer) {
		return [single_exact_answer('20', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8c(answer) {
		return [single_exact_answer('18', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8d(answer) {
		return [single_exact_answer('24', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8e(answer) {
		return [single_exact_answer('21', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8f(answer) {
		return [single_exact_answer('28', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8g(answer) {
		return [single_exact_answer('24', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8h(answer) {
		return [single_exact_answer('32', [1], answer), getMax([1])] 
	}, 
	function b3_g5_d_8i(answer) {
		return [num_correct('2', [1,2], answer), getMax([1,2])] 
	}, 
	function b3_g5_d_9(answer) {
		return [rtl_1ans('16', [3,7], answer), getMax([3,7])] 
	}, 
	function b3_g5_d_10(answer) {
		return [rtl_fraction('1/24', [1,3,5], answer, false), getMax([1,3,5])] 
	}
]

let b3_g5_e = [
	function b3_g5_e_11(answer) {
		return [ltr_div('3.60', [5,10,15,20], answer), getMax([5,10,15,20])] 
	}, 
	function b3_g5_e_12(answer) {
		return [multiple_exact_answers('(yes,y)', [2], answer), getMax([2])] 
	}, 
	function b3_g5_e_13(answer) {
		return [rtl_1ans('126', [3,7,10], answer), getMax([3,7,10])] 
	}, 
	function b3_g5_e_14(answer) {
		return [ltr_div('5.6', [1,3,7], answer), getMax([1,3,7])] 
	}, 
	function b3_g5_e_15(answer) {
		return [multiple_exact_answers('(yes,y)', [3], answer), getMax([3])] 
	}, 
	function b3_g5_e_16(answer) {
		return [rtl_fraction('1/28', [2,4,6], answer, false), getMax([2,4,6])] 
	}
]

let b1_g6_c = [
	function b1_g6_c_1(answer) {
		return [ratio_exact('24:61', [2], answer), getMax([2])] 
	}, 
	function b1_g6_c_2a(answer) {
		return [rtl_1ans('6', [11], answer), getMax([11])] 
	}, 
	function b1_g6_c_2b(answer) {
		return [single_exact_answer('5', [5], answer), getMax([5])] 
	}, 
	function b1_g6_c_3a(answer) {
		return [single_exact_answer('2', [1], answer), getMax([1])] 
	}, 
	function b1_g6_c_3b(answer) {
		return [single_exact_answer('3', [1], answer), getMax([1])] 
	}, 
	function b1_g6_c_3c(answer) {
		return [single_exact_answer('1', [1], answer), getMax([1])] 
	}, 
	function b1_g6_c_4(answer) {
		return [num_correct('2', [3,6], answer), getMax([3,6])] 
	}, 
	function b1_g6_c_5a(answer) {
		return [rtl_1ans('72', [4,9], answer), getMax([4,9])] 
	}, 
	function b1_g6_c_5b(answer) {
		return [rtl_1ans('576', [7,14,21], answer), getMax([7,14,21])] 
	}, 
	function b1_g6_c_6(answer) {
		return [rtl_1ans('3', [6], answer), getMax([6])] 
	}
]

let b1_g6_d = [
	function b1_g6_d_7(answer) {
		return [num_correct('3', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g6_d_8a(answer) {
		return [multiple_exact_answers('(true,t)', [3], answer), getMax([3])] 
	}, 
	function b1_g6_d_8b(answer) {
		return [multiple_exact_answers('(false, f)', [3], answer), getMax([3])] 
	}, 
	function b1_g6_d_9a(answer) {
		return [single_exact_answer('6', [1], answer), getMax([1])] 
	}, 
	function b1_g6_d_9b(answer) {
		return [single_exact_answer('30', [1], answer), getMax([1])] 
	}, 
	function b1_g6_d_9c(answer) {
		return [single_exact_answer('60', [1], answer), getMax([1])] 
	}, 
	function b1_g6_d_9d(answer) {
		return [single_exact_answer('15', [1], answer), getMax([1])] 
	}, 
	function b1_g6_d_10a(answer) {
		return [single_exact_answer('-8', [1], answer), getMax([1])] 
	}, 
	function b1_g6_d_10b(answer) {
		return [single_exact_answer('2', [1], answer), getMax([1])] 
	}, 
	function b1_g6_d_10c(answer) {
		return [num_correct('4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}
]

let b1_g6_e = [
	function b1_g6_e_11a(answer) {
		return [multiple_exact_answers('($10,10)', [1], answer), getMax([1])] 
	}, 
	function b1_g6_e_11b(answer) {
		return [multiple_exact_answers('($15,15)', [1], answer), getMax([1])] 
	}, 
	function b1_g6_e_11c(answer) {
		return [multiple_exact_answers('($25,25)', [1], answer), getMax([1])] 
	}, 
	function b1_g6_e_11d(answer) {
		return [multiple_exact_answers('(yes, y)', [4], answer), getMax([4])] 
	}, 
	function b1_g6_e_11e(answer) {
		return [num_correct('3', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b1_g6_e_12(answer) {
		return [rtl_1ans('7', [4], answer), getMax([4])] 
	}, 
	function b1_g6_e_13a(answer) {
		return [single_exact_answer('75', [2], answer), getMax([2])] 
	}, 
	function b1_g6_e_13b(answer) {
		return [single_exact_answer('46', [2], answer), getMax([2])] 
	}, 
	function b1_g6_e_13c(answer) {
		return [single_exact_answer('88', [2], answer), getMax([2])] 
	}, 
	function b1_g6_e_14a(answer) {
		return [multiple_exact_answers('(diver b, b)', [1], answer), getMax([1])] 
	}, 
	function b1_g6_e_14b(answer) {
		return [single_exact_answer('28', [1], answer), getMax([1])] 
	}, 
	function b1_g6_e_15(answer) {
		return [rtl_1ans('64', [4,9], answer), getMax([4,9])] 
	}
]

let b1_g6_f = [
	function b1_g6_f_16(answer) {
		return [rtl_1ans('150', [3,7,10], answer), getMax([3,7,10])] 
	}, 
	function b1_g6_f_17(answer) {
		return [rtl_1ans('56', [5,10], answer), getMax([5,10])] 
	}, 
	function b1_g6_f_18(answer) {
		return [single_exact_answer('6', [8], answer), getMax([8])] 
	}, 
	function b1_g6_f_19(answer) {
		return [multiple_exact_answers('(yes,y)', [5], answer), getMax([5])] 
	}, 
	function b1_g6_f_20(answer) {
		return [multiple_exact_answers('(yes,y)', [4], answer), getMax([4])] 
	}
]

let b2_g6_c = [
	function b2_g6_c_1(answer) {
		return [ratio_exact('17:24', [2], answer), getMax([2])] 
	}, 
	function b2_g6_c_2a(answer) {
		return [rtl_1ans('6', [11], answer), getMax([11])] 
	}, 
	function b2_g6_c_2b(answer) {
		return [single_exact_answer('7', [5], answer), getMax([5])] 
	}, 
	function b2_g6_c_3a(answer) {
		return [single_exact_answer('1', [1], answer), getMax([1])] 
	}, 
	function b2_g6_c_3b(answer) {
		return [single_exact_answer('3', [1], answer), getMax([1])] 
	}, 
	function b2_g6_c_3c(answer) {
		return [single_exact_answer('2', [1], answer), getMax([1])] 
	}, 
	function b2_g6_c_4(answer) {
		return [num_correct('2', [3,6], answer), getMax([3,6])] 
	}, 
	function b2_g6_c_5a(answer) {
		return [rtl_1ans('140', [3,6,10], answer), getMax([3,6,10])] 
	}, 
	function b2_g6_c_5b(answer) {
		return [rtl_1ans('1120', [7,13,19,26], answer), getMax([7,13,19,26])] 
	}, 
	function b2_g6_c_6(answer) {
		return [rtl_1ans('3', [6], answer), getMax([6])] 
	}
]

let b2_g6_d = [
	function b2_g6_d_7(answer) {
		return [num_correct('3', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g6_d_8a(answer) {
		return [multiple_exact_answers('(false, f)', [3], answer), getMax([3])] 
	}, 
	function b2_g6_d_8b(answer) {
		return [multiple_exact_answers('(false, f)', [3], answer), getMax([3])] 
	}, 
	function b2_g6_d_9a(answer) {
		return [single_exact_answer('6', [1], answer), getMax([1])] 
	}, 
	function b2_g6_d_9b(answer) {
		return [single_exact_answer('18', [1], answer), getMax([1])] 
	}, 
	function b2_g6_d_9c(answer) {
		return [single_exact_answer('36', [1], answer), getMax([1])] 
	}, 
	function b2_g6_d_9d(answer) {
		return [single_exact_answer('15', [1], answer), getMax([1])] 
	}, 
	function b2_g6_d_10a(answer) {
		return [single_exact_answer('-5', [1], answer), getMax([1])] 
	}, 
	function b2_g6_d_10b(answer) {
		return [single_exact_answer('7', [1], answer), getMax([1])] 
	}, 
	function b2_g6_d_10c(answer) {
		return [num_correct('4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}
]

let b2_g6_e = [
	function b2_g6_e_11a(answer) {
		return [multiple_exact_answers('($50,50)', [1], answer), getMax([1])] 
	}, 
	function b2_g6_e_11b(answer) {
		return [multiple_exact_answers('($75,75)', [1], answer), getMax([1])] 
	}, 
	function b2_g6_e_11c(answer) {
		return [multiple_exact_answers('($125,125)', [1], answer), getMax([1])] 
	}, 
	function b2_g6_e_11d(answer) {
		return [multiple_exact_answers('(yes,y)', [4], answer), getMax([4])] 
	}, 
	function b2_g6_e_11e(answer) {
		return [num_correct('3', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b2_g6_e_12(answer) {
		return [rtl_1ans('4', [4], answer), getMax([4])] 
	}, 
	function b2_g6_e_13a(answer) {
		return [single_exact_answer('97', [2], answer), getMax([2])] 
	}, 
	function b2_g6_e_13b(answer) {
		return [single_exact_answer('55', [2], answer), getMax([2])] 
	}, 
	function b2_g6_e_13c(answer) {
		return [single_exact_answer('98', [2], answer), getMax([2])] 
	}, 
	function b2_g6_e_14a(answer) {
		return [multiple_exact_answers('(diver b,b)', [1], answer), getMax([1])] 
	}, 
	function b2_g6_e_14b(answer) {
		return [single_exact_answer('20', [1], answer), getMax([1])] 
	}, 
	function b2_g6_e_15(answer) {
		return [rtl_1ans('27', [3,7], answer), getMax([3,7])] 
	}
]

let b2_g6_f = [
	function b2_g6_f_16(answer) {
		return [rtl_1ans('160', [7,15,23], answer), getMax([7,15,23])] 
	}, 
	function b2_g6_f_17(answer) {
		return [rtl_1ans('72', [4,8], answer), getMax([4,8])] 
	}, 
	function b2_g6_f_18(answer) {
		return [single_exact_answer('6', [8], answer), getMax([8])] 
	}, 
	function b2_g6_f_19(answer) {
		return [multiple_exact_answers('(yes,y)', [5], answer), getMax([5])] 
	}, 
	function b2_g6_f_20(answer) {
		return [multiple_exact_answers('(yes,y)', [4], answer), getMax([4])] 
	}
]

let b3_g6_c = [
	function b3_g6_c_1(answer) {
		return [ratio_exact('16:18', [2], answer), getMax([2])] 
	}, 
	function b3_g6_c_2a(answer) {
		return [rtl_1ans('6', [11], answer), getMax([11])] 
	}, 
	function b3_g6_c_2b(answer) {
		return [single_exact_answer('7', [5], answer), getMax([5])] 
	}, 
	function b3_g6_c_3a(answer) {
		return [single_exact_answer('3', [1], answer), getMax([1])] 
	}, 
	function b3_g6_c_3b(answer) {
		return [single_exact_answer('2', [1], answer), getMax([1])] 
	}, 
	function b3_g6_c_3c(answer) {
		return [single_exact_answer('1', [1], answer), getMax([1])] 
	}, 
	function b3_g6_c_4(answer) {
		return [num_correct('2', [3,6], answer), getMax([3,6])] 
	}, 
	function b3_g6_c_5a(answer) {
		return [rtl_1ans('60', [4,9], answer), getMax([4,9])] 
	}, 
	function b3_g6_c_5b(answer) {
		return [rtl_1ans('480', [7,14,21], answer), getMax([7,14,21])] 
	}, 
	function b3_g6_c_6(answer) {
		return [rtl_1ans('4', [6], answer), getMax([6])] 
	}
]

let b3_g6_d = [
	function b3_g6_d_7(answer) {
		return [num_correct('3', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g6_d_8a(answer) {
		return [multiple_exact_answers('(false,f)', [3], answer), getMax([3])] 
	}, 
	function b3_g6_d_8b(answer) {
		return [multiple_exact_answers('(true,t)', [3], answer), getMax([3])] 
	}, 
	function b3_g6_d_9a(answer) {
		return [single_exact_answer('8', [1], answer), getMax([1])] 
	}, 
	function b3_g6_d_9b(answer) {
		return [single_exact_answer('18', [1], answer), getMax([1])] 
	}, 
	function b3_g6_d_9c(answer) {
		return [single_exact_answer('36', [1], answer), getMax([1])] 
	}, 
	function b3_g6_d_9d(answer) {
		return [single_exact_answer('20', [1], answer), getMax([1])] 
	}, 
	function b3_g6_d_10a(answer) {
		return [single_exact_answer('-3', [1], answer), getMax([1])] 
	}, 
	function b3_g6_d_10b(answer) {
		return [single_exact_answer('8', [1], answer), getMax([1])] 
	}, 
	function b3_g6_d_10c(answer) {
		return [num_correct('4', [1,2,3,4], answer), getMax([1,2,3,4])] 
	}
]

let b3_g6_e = [
	function b3_g6_e_11a(answer) {
		return [multiple_exact_answers('($80,80)', [1], answer), getMax([1])] 
	}, 
	function b3_g6_e_11b(answer) {
		return [multiple_exact_answers('($120,120)', [1], answer), getMax([1])] 
	}, 
	function b3_g6_e_11c(answer) {
		return [multiple_exact_answers('($200,200)', [1], answer), getMax([1])] 
	}, 
	function b3_g6_e_11d(answer) {
		return [multiple_exact_answers('(yes,y)', [4], answer), getMax([4])] 
	}, 
	function b3_g6_e_11e(answer) {
		return [num_correct('3', [1,2,3], answer), getMax([1,2,3])] 
	}, 
	function b3_g6_e_12(answer) {
		return [rtl_1ans('8', [4], answer), getMax([4])] 
	}, 
	function b3_g6_e_13a(answer) {
		return [single_exact_answer('94', [2], answer), getMax([2])] 
	}, 
	function b3_g6_e_13b(answer) {
		return [single_exact_answer('66', [2], answer), getMax([2])] 
	}, 
	function b3_g6_e_13c(answer) {
		return [single_exact_answer('98', [2], answer), getMax([2])] 
	}, 
	function b3_g6_e_14a(answer) {
		return [multiple_exact_answers('(diver a,a)', [1], answer), getMax([1])] 
	}, 
	function b3_g6_e_14b(answer) {
		return [single_exact_answer('24', [1], answer), getMax([1])] 
	}, 
	function b3_g6_e_15(answer) {
		return [rtl_1ans('16', [2,4], answer), getMax([2,4])] 
	}
]

let b3_g6_f = [
	function b3_g6_f_16(answer) {
		return [rtl_1ans('40', [10,20], answer), getMax([10,20])] 
	}, 
	function b3_g6_f_17(answer) {
		return [rtl_1ans('54', [4,8], answer), getMax([4,8])] 
	}, 
	function b3_g6_f_18(answer) {
		return [single_exact_answer('2', [9], answer), getMax([9])] 
	}, 
	function b3_g6_f_19(answer) {
		return [multiple_exact_answers('(yes,y)', [5], answer), getMax([5])] 
	}, 
	function b3_g6_f_20(answer) {
		return [multiple_exact_answers('(yes,y)', [4], answer), getMax([4])] 
	}
]