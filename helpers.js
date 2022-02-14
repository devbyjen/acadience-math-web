// Helper function. Returns number of matching digits in two strings, comparing exact place value.
// 300 = 300 ? return 3.
// 003 = 300 ? return 1.
//1234 = 4321? return 0.
function get_num_correct_digits(correct_answer, answer, flip=false) {
    
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


// SCORING FUNCTIONS
// All have scores as a param - required to be an array of possible, nonzero scores. 
// Number of digits correct = array position returned.

// Scoring for single-answer computation problems, scored right to left
function rtl_1ans(correct_answer, scores, answer) {
    answer = answer.replace(/,/, '')
    let num = get_num_correct_digits(correct_answer, answer, true)
    if(num == 0)
        return 0
    return scores[num-1]
}

// Scoring for fractions
// answer formatting: object with possible keys: whole, top, bottom.
// values inside answer object must be strings
// Scoring for fractions
// answer formatting: object with possible keys: whole, top, bottom.
// values inside answer object must be strings
function rtl_fraction(correct_answer, scores, answer, isBonus=false) {
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
}

// Scoring for division problems
// answer formatting: object with possible keys: whole, rem.
// values inside answer object must be strings
function ltr_div(correct_answer, scores, answer) {
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
}

function getMax(scores) {
    let max = 0
    for(let i=0;i<scores.length;i++){
        if(parseInt(scores[i])>parseInt(max)){
            max=scores[i]
        }
    }
    return max
}


function scoreIt(testName, benchmark, grade, form) {
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
       solution.innerHTML = `score: ${score}/${possible}`
       if(score < possible){
           solution.innerHTML = '<span class="wrong">' + solution.innerHTML + '</span>'
       }
       console.log(`${i+1}. ${score}/${possible}`)
       total += parseInt(score)
       max += parseInt(possible)
       console.log(`so far: ${total}/${max}`)
   }
   const totalScore = document.querySelector(`#${testName}_total`);
   totalScore.innerHTML = `Score:  <span>${total} /${max}</span>`
}

function reset(section) {
   console.log("resetting section " + section)
   let problems = document.querySelectorAll(`#${section} .problem`)
   let total = document.querySelector(`#${section} .total`)
   total.innerHTML = "Score:"

   for(let i=0;i<problems.length;i++){
       console.log()
       problems[i].children[0].value = ""
       problems[i].children[1].innerHTML = ""
   }

}