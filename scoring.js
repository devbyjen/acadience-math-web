// Helper function. Returns number of matching digits in two strings, comparing exact place value.
// 300 = 300 ? return 3.
// 003 = 300 ? return 1.
//1234 = 4321? return 0.
function get_num_correct_digits(correct_answer, answer) {
    let num = 0;
    for(let i=0; i<correct_answer.length;i++){
        if(answer.length>=i && correct_answer[i] === answer[i]){
            num++
        }
    }
    // console.log(`# correct: ${num}. Comparing: ${correct_answer} & ${answer}`)
    return num;
}

function format_remainder(answer) {
    obj = {}
    answer = answer.trim()
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
    let num = get_num_correct_digits(correct_answer, answer)
    if(num == 0)
        return 0
    return scores[num-1]
}

// Scoring for fractions
// answer formatting: object with possible keys: whole, top, bottom.
// values inside answer object must be strings
function rtl_fraction(correct_answer, scores, answer) {
    // correct_answer and answer are both required to be objects with .whole, .top, .bottom
    let num = 0
    if(typeof correct_answer == 'string'){
        correct_answer = format_fraction(correct_answer)
    }
    if(typeof answer == 'string') {
        answer = format_fraction(answer)
    }

    if('whole' in correct_answer && 'whole' in answer){
        // console.log("whole: " + correct_answer.whole + " " + answer.whole)
        num += get_num_correct_digits(correct_answer.whole, answer.whole)
    }
    if('top' in correct_answer && 'top' in answer){
        // console.log("top: " + correct_answer.top + " " + answer.top)
        num += get_num_correct_digits(correct_answer.top, answer.top)
    }
    if('bottom' in correct_answer && 'bottom' in answer){
        // console.log("bottom: " + correct_answer.bottom + " " + answer.bottom)
        num += get_num_correct_digits(correct_answer.bottom, answer.bottom)
    }
    // console.log(num)
    if(num == 0){
        return 0
    }
    return scores[num-1]
}

// Scoring for fractions
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
    
    if('whole' in correct_answer && 'whole' in answer){
        num += get_num_correct_digits(correct_answer.whole, answer.whole)
    }
    if('rem' in correct_answer && 'rem' in answer){
        num += get_num_correct_digits(correct_answer.rem, answer.rem)
    }
    if(num == 0)
        return 0
    return scores[num-1]
}

function load_json() {
    let jsonFilePath = './data/key.json'

}