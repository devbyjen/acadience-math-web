
// import {computation_benchmark1_forma} from './score_4.js'
// import {rtl_1ans,rtl_fraction,ltr_div} from './scoring';

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





let computation_benchmark1_forma = [
    function comp_1a_1(answer) {
        return rtl_1ans('847', [1,2,3], answer)
    },

    function comp_1a_2(answer) {
        return rtl_1ans('7020', [1,2,3,4], answer)
    },

    function comp_1a_3(answer) {
        return rtl_fraction({whole: '2', top: '2', bottom: '5'}, [1,2,3], answer)
    },

    function comp_1a_4(answer) {
        return rtl_1ans('72', [1,2], answer)
    },

    function comp_1a_5(answer) {
        return ltr_div({whole: '143', rem: '1'}, [3,6,10,14], answer)
    },

    function comp_1a_6(answer) {
        return rtl_1ans('123', [1,2,3], answer)
    },

    function comp_1a_7(answer) {
        return rtl_fraction({top: '7', bottom: '8'}, [1,2,3], answer)
    },

    function comp_1a_8(answer) {
        let ca= '6886'
        let s = [1,2,3,4]
        return rtl_1ans('6886', [1,2,3,4], answer)
    },

    function comp_1a_9(answer) {
        return rtl_1ans('209', [2,5,8], answer)
    },

    function comp_1a_10(answer) {
        //Two acceptable answers, different scoring.
        return Math.max(
            rtl_fraction({whole: '8', top: '1', bottom: '4'}, [0,0,5], answer),
            rtl_fraction({whole: '8', top: '3', bottom: '12'}, [1,2,3,4], answer)
        )
    },

    function comp_1a_11(answer) {
        return ltr_div({whole: '80', rem: '2'}, [3,6,9], answer)
    },

    function comp_1a_12(answer) {
        return ltr_div({whole: '7'}, [1], answer)
    },

    function comp_1a_13(answer) {
        return rtl_1ans('7128', [2,5,8,11], answer)
    },

    function comp_1a_14(answer) {
        return rtl_fraction({top: '3', bottom: '4'}, [1,2], answer)
    },

    function comp_1a_15(answer) {
        return rtl_1ans('3156', [1,2,3,4], answer)
    },

    function comp_1a_16(answer) {
        //Two acceptable answers, different scoring.
        return Math.max(
            rtl_fraction({whole: '7', top: '2', bottom: '5'}, [0,0,5], answer),
            rtl_fraction({whole: '7', top: '4', bottom: '10'}, [1,2,3,4], answer)
        )
    },

    function comp_1a_17(answer) {
        return rtl_fraction({top: '2', bottom: '3'}, [1,2], answer)
    },

    function comp_1a_18(answer) {
        return rtl_fraction({top: '7', bottom: '12'}, [1,2,3], answer)
    },

    function comp_1a_19(answer) {
        return rtl_1ans('5803', [1,2,3,4], answer)
    },

    function comp_1a_20(answer) {
        return ltr_div({whole: '156', rem: '3'}, [3,6,10,14], answer)
    },

    function comp_1a_21(answer) {
        return ltr_div({whole: '132', rem: '1'}, [3,6,9,12], answer)
    },

    function comp_1a_22(answer) {
        return rtl_1ans('1495', [2,5,8,11], answer)
    },

    function comp_1a_23(answer) {
        return rtl_1ans('1746', [1,2,3,4], answer)
    },

    function comp_1a_24(answer) {
        return rtl_1ans('9206', [1,2,3,4], answer)
    },

    function comp_1a_25(answer) {
        return rtl_1ans('408', [2,5,8], answer)
    }
]

let computation_benchmark1_formb = [
    function comp_1b_1(answer) {
        return rtl_1ans('398', [1,2,3], answer)
    },

    function comp_1b_2(answer) {
        return rtl_1ans('7132', [1,2,3,4], answer)
    },

    function comp_1b_3(answer) {
        return rtl_fraction({whole: '9', top: '3', bottom: '4'}, [1,2,3], answer)
    },

    function comp_1b_4(answer) {
        return rtl_1ans('56', [1,2], answer)
    },

    function comp_1b_5(answer) {
        return ltr_div({whole: '96', rem: '3'}, [3,6,10], answer)
    },

    function comp_1b_6(answer) {
        return rtl_1ans('262', [1,2,3], answer)
    },

    function comp_1b_7(answer) {
        return rtl_fraction({top: '3', bottom: '8'}, [1,2], answer)
    },

    function comp_1b_8(answer) {
        return rtl_1ans('4359', [1,2,3,4], answer)
    },

    function comp_1b_9(answer) {
        return rtl_1ans('198', [2,5,8], answer)
    },

    function comp_1b_10(answer) {
        //Two acceptable answers, different scoring.
        return Math.max(
            rtl_fraction({whole: '5', top: '3', bottom: '4'}, [0,0,4], answer),
            rtl_fraction({whole: '5', top: '6', bottom: '8'}, [1,2,3], answer)
        )
    },

    function comp_1b_11(answer) {
        return ltr_div({whole: '31', rem: '4'}, [3,6,9], answer)
    },

    function comp_1b_12(answer) {
        return ltr_div({whole: '7'}, [1], answer)
    },

    function comp_1b_13(answer) {
        return rtl_1ans('2688', [2,5,8,11], answer)
    },

    function comp_1b_14(answer) {
        return rtl_fraction({top: '3', bottom: '5'}, [1,2], answer)
    },

    function comp_1b_15(answer) {
        return rtl_1ans('7974', [1,2,3,4], answer)
    },

    function comp_1b_16(answer) {
        //Two acceptable answers, different scoring.
        return rtl_fraction({whole: '2', top: '1', bottom: '3'}, [1,2,3], answer)
    },

    function comp_1b_17(answer) {
        return rtl_fraction({top: '2', bottom: '3'}, [1,2], answer)
    },

    function comp_1b_18(answer) {
        return rtl_fraction({top: '5', bottom: '6'}, [1,2], answer)
    },

    function comp_1b_19(answer) {
        return rtl_1ans('3934', [1,2,3,4], answer)
    },

    function comp_1b_20(answer) {
        return ltr_div({whole: '72', rem: '1'}, [3,6,10], answer)
    },

    function comp_1b_21(answer) {
        return ltr_div({whole: '206', rem: '3'}, [2,5,8,11], answer)
    },

    function comp_1b_22(answer) {
        return rtl_1ans('2755', [2,5,8,11], answer)
    },

    function comp_1b_23(answer) {
        return rtl_1ans('4089', [1,2,3,4], answer)
    },

    function comp_1b_24(answer) {
        return rtl_1ans('5006', [1,2,3,4], answer)
    },

    function comp_1b_25(answer) {
        return rtl_1ans('861', [2,5,8], answer)
    }
]

let computation_benchmark2_forma = [
    function comp_2a_1(answer) {
    return rtl_1ans('498', [1,2,3], answer)
    },

    function comp_2a_2(answer) {
        return rtl_1ans('7120', [1,2,3,4], answer)
    },

    function comp_2a_3(answer) {
        return rtl_fraction('6 1/3', [1,2,3], answer)
    },

    function comp_2a_4(answer) {
        return rtl_1ans('72', [1,2], answer)
    },

    function comp_2a_5(answer) {
        return ltr_div('44r2', [3,6,10], answer)
    },

    function comp_2a_6(answer) {
        return rtl_1ans('103', [1,2,3], answer)
    },

    function comp_2a_7(answer) {
        return rtl_fraction('7/8', [1,2,3], answer)
    },

    function comp_2a_8(answer) {
        return rtl_1ans('685', [1,2,3], answer)
    },

    function comp_2a_9(answer) {
        return rtl_1ans('1056', [2,4,6,9], answer)
    },

    function comp_2a_10(answer) {
        return rtl_fraction('1 1/8', [1,2,3], answer)
    },

    function comp_2a_11(answer) {
        return ltr_div('119r4', [3,6,9,13], answer)
    },

    function comp_2a_12(answer) {
        return ltr_div('5', [1], answer)
    },

    function comp_2a_13(answer) {
        return rtl_1ans('5644', [2,5,8,11], answer)
    },

    function comp_2a_14(answer) {
        return rtl_fraction('1/5', [1,2], answer)
    },

    function comp_2a_15(answer) {
        return rtl_1ans('4680', [1,2,3,4], answer)
    },

    function comp_2a_16(answer) {
        return rtl_fraction('1 1/4', [1,2,3], answer)
    },

    function comp_2a_17(answer) {
        return rtl_fraction('1/4', [1,2], answer)
    },

    function comp_2a_18(answer) {
        return rtl_fraction('1/6', [1,2], answer)
    },

    function comp_2a_19(answer) {
        return rtl_1ans('4338', [1,2,3,4], answer)
    },

    function comp_2a_20(answer) {
        return ltr_div('78r5', [3,6,10], answer)
    },

    function comp_2a_21(answer) {
        return ltr_div('40r1', [3,6,9], answer)
    },

    function comp_2a_22(answer) {
        return rtl_1ans('1938', [2,5,8,11], answer)
    },

    function comp_2a_23(answer) {
        return rtl_1ans('4879', [1,2,3,4], answer)
    },

    function comp_2a_24(answer) {
        return rtl_1ans('6622', [1,2,3,4], answer)
    },

    function comp_2a_25(answer) {
        return rtl_1ans('299', [2,5,8], answer)
    }
]

let computation_benchmark2_formb = [
    function comp_2b_1(answer) {
    return rtl_1ans('965', [1,2,3], answer)
    },

    function comp_2b_2(answer) {
        return rtl_1ans('7411', [1,2,3,4], answer)
    },

    function comp_2b_3(answer) {
        return rtl_fraction({whole: '1', top: '1', bottom: '3'}, [1,2,3], answer)
    },

    function comp_2b_4(answer) {
        return rtl_1ans('54', [1,2], answer)
    },

    function comp_2b_5(answer) {
        return ltr_div({whole: '137', rem: '2'}, [3,6,10,14], answer)
    },

    function comp_2b_6(answer) {
        return rtl_1ans('61', [1,2], answer)
    },

    function comp_2b_7(answer) {
        return Math.max(
            rtl_fraction({top: '3', bottom: '4'}, [0,3], answer),
            rtl_fraction({top: '6', bottom: '8'}, [1,2], answer)
        )
    },

    function comp_2b_8(answer) {
        return rtl_1ans('6789', [1,2,3,4], answer)
    },

    function comp_2b_9(answer) {
        return rtl_1ans('858', [2,5,8], answer)
    },

    function comp_2b_10(answer) {
        //Two acceptable answers, different scoring.
        return Math.max(
            rtl_fraction({whole: '5', top: '1', bottom: '4'}, [0,0,4], answer),
            rtl_fraction({whole: '5', top: '2', bottom: '8'}, [1,2,3], answer)
        )
    },

    function comp_2b_11(answer) {
        return ltr_div({whole: '31', rem: '3'}, [3,6,9], answer)
    },

    function comp_2b_12(answer) {
        return ltr_div({whole: '4'}, [1], answer)
    },

    function comp_2b_13(answer) {
        return rtl_1ans('1088', [2,4,7,10], answer)
    },

    function comp_2b_14(answer) {
        return Math.max(
            rtl_fraction({top: '1', bottom: '2'}, [0,4], answer),
            rtl_fraction({top: '5', bottom: '10'}, [1,2,3], answer)
        )
    },

    function comp_2b_15(answer) {
        return rtl_1ans('4312', [1,2,3,4], answer)
    },

    function comp_2b_16(answer) {
        //Two acceptable answers, different scoring
        return rtl_fraction('9 3/4', [1,2,3], answer)
    },

    function comp_2b_17(answer) {
        return rtl_fraction({top: '1', bottom: '3'}, [1,2], answer)
    },

    function comp_2b_18(answer) {
        return rtl_fraction({top: '1', bottom: '6'}, [1,2], answer)
    },

    function comp_2b_19(answer) {
        return rtl_1ans('5238', [1,2,3,4], answer)
    },

    function comp_2b_20(answer) {
        return ltr_div({whole: '71', rem: '4'}, [3,6,9], answer)
    },

    function comp_2b_21(answer) {
        return ltr_div({whole: '117', rem: '1'}, [3,6,9,13], answer)
    },

    function comp_2b_22(answer) {
        return rtl_1ans('2581', [2,5,8,11], answer)
    },

    function comp_2b_23(answer) {
        return rtl_1ans('8658', [1,2,3,4], answer)
    },

    function comp_2b_24(answer) {
        return rtl_1ans('5241', [1,2,3,4], answer)
    },

    function comp_2b_25(answer) {
        return rtl_1ans('627', [2,5,8], answer)
    }
]


let cap_benchmark2 = [
    function cap_2_1(answer) {
        return regex_match_answer('965', [1,2,3], answer)
    },

    function cap_2_2(answer) {
        return rtl_1ans('7411', [1,2,3,4], answer)
    },

    function cap_2_3(answer) {
        return rtl_fraction({whole: '1', top: '1', bottom: '3'}, [1,2,3], answer)
    },

    function cap_2_4(answer) {
        return rtl_1ans('54', [1,2], answer)
    },

    function cap_2_5(answer) {
        return ltr_div({whole: '137', rem: '2'}, [3,6,10,14], answer)
    },

    function cap_2_6(answer) {
        return rtl_1ans('61', [1,2], answer)
    },

    function cap_2_7(answer) {
        return Math.max(
            rtl_fraction({top: '3', bottom: '4'}, [0,0,3], answer),
            rtl_fraction({top: '6', bottom: '8'}, [1,2], answer)
        )
    },

    function cap_2_8(answer) {
        return rtl_1ans('6789', [1,2,3,4], answer)
    },

    function cap_2_9(answer) {
        return rtl_1ans('858', [2,5,8], answer)
    },

    function cap_2_10(answer) {
        //Two acceptable answers, different scoring.
        return Math.max(
            rtl_fraction({whole: '5', top: '1', bottom: '4'}, [0,0,4], answer),
            rtl_fraction({whole: '5', top: '2', bottom: '8'}, [1,2,3], answer)
        )
    },

    function cap_2_11(answer) {
        return ltr_div({whole: '31', rem: '3'}, [3,6,9], answer)
    },

    function cap_2_12(answer) {
        return ltr_div({whole: '4'}, [1], answer)
    },

    function cap_2_13(answer) {
        return rtl_1ans('1088', [2,4,7,10], answer)
    },

    function cap_2_14(answer) {
        return Math.max(
            rtl_fraction({top: '1', bottom: '2'}, [0,4], answer),
            rtl_fraction({top: '5', bottom: '10'}, [1,2,3], answer)
        )
    },

    function cap_2_15(answer) {
        return rtl_1ans('4312', [1,2,3,4], answer)
    },

    function cap_2_16(answer) {
        //Two acceptable answers, different scoring
        rtl_fraction({whole: '9', top: '3', bottom: '4'}, [1,2,3], answer)
    },

    function cap_2_17(answer) {
        return rtl_fraction({top: '1', bottom: '3'}, [1,2], answer)
    },

    function cap_2_18(answer) {
        return rtl_fraction({top: '1', bottom: '6'}, [1,2], answer)
    },

    function cap_2_19(answer) {
        return rtl_1ans('5238', [1,2,3,4], answer)
    },

    function cap_2_20(answer) {
        return ltr_div({whole: '71', rem: '4'}, [3,6,9], answer)
    },

    function cap_2_21(answer) {
        return ltr_div({whole: '117', rem: '1'}, [3,6,9,13], answer)
    },

    function cap_2_22(answer) {
        return rtl_1ans('2581', [2,5,8,11], answer)
    },

    function cap_2_23(answer) {
        return rtl_1ans('8658', [1,2,3,4], answer)
    },

    function cap_2_24(answer) {
        return rtl_1ans('5241', [1,2,3,4], answer)
    },

    function cap_2_25(answer) {
        return rtl_1ans('627', [2,5,8], answer)
    }
]

//unfinished
let computation_benchmark3_forma = [
//     function comp_1a_1(answer) {
//     return rtl_1ans('847', [1,2,3], answer)
//     },

//     function comp_1a_2(answer) {
//         return rtl_1ans('7020', [1,2,3,4], answer)
//     },

//     function comp_1a_3(answer) {
//         return rtl_fraction({whole: '2', top: '2', bottom: '5'}, [1,2,3], answer)
//     },

//     function comp_1a_4(answer) {
//         return rtl_1ans('72', [1,2], answer)
//     },

//     function comp_1a_5(answer) {
//         return ltr_div({whole: '143', rem: '1'}, [3,6,10,14], answer)
//     },

//     function comp_1a_6(answer) {
//         return rtl_1ans('123', [1,2], answer)
//     },

//     function comp_1a_7(answer) {
//         return rtl_fraction({top: '7', bottom: '8'}, [1,2,3], answer)
//     },

//     function comp_1a_8(answer) {
//         return rtl_1ans('6886', [1,2,3,4], answer)
//     },

//     function comp_1a_9(answer) {
//         return rtl_1ans('209', [2,5,8], answer)
//     },

//     function comp_1a_10(answer) {
//         //Two acceptable answers, different scoring.
//         return Math.max(
//             rtl_fraction({whole: '8', top: '1', bottom: '4'}, [0,0,5], answer),
//             rtl_fraction({whole: '8', top: '3', bottom: '12'}, [1,2,3,4], answer)
//         )
//     },

//     function comp_1a_11(answer) {
//         return ltr_div({whole: '80', rem: '2'}, [3,6,9], answer)
//     },

//     function comp_1a_12(answer) {
//         return ltr_div({whole: '7'}, [1], answer)
//     },

//     function comp_1a_13(answer) {
//         return rtl_1ans('7128', [2,5,8,11], answer)
//     },

//     function comp_1a_14(answer) {
//         return rtl_fraction({top: '3', bottom: '4'}, [1,2], answer)
//     },

//     function comp_1a_15(answer) {
//         return rtl_1ans('3156', [1,2,3,4], answer)
//     },

//     function comp_1a_16(answer) {
//         //Two acceptable answers, different scoring.
//         return Math.max(
//             rtl_fraction({whole: '7', top: '2', bottom: '5'}, [0,0,5], answer),
//             rtl_fraction({whole: '7', top: '4', bottom: '10'}, [1,2,3,4], answer)
//         )
//     },

//     function comp_1a_17(answer) {
//         return rtl_fraction({top: '2', bottom: '3'}, [1,2], answer)
//     },

//     function comp_1a_18(answer) {
//         return rtl_fraction({top: '7', bottom: '12'}, [1,2], answer)
//     },

//     function comp_1a_19(answer) {
//         return rtl_1ans('5803', [1,2,3,4], answer)
//     },

//     function comp_1a_20(answer) {
//         return ltr_div({whole: '156', rem: '3'}, [3,6,10,14], answer)
//     },

//     function comp_1a_21(answer) {
//         return ltr_div({whole: '132', rem: '1'}, [3,6,9,12], answer)
//     },

//     function comp_1a_22(answer) {
//         return rtl_1ans('1495', [2,5,8,11], answer)
//     },

//     function comp_1a_23(answer) {
//         return rtl_1ans('1746', [1,2,3,4], answer)
//     },

//     function comp_1a_24(answer) {
//         return rtl_1ans('9206', [1,2,3,4], answer)
//     },

//     function comp_1a_25(answer) {
//         return rtl_1ans('408', [2,5,8], answer)
//     }
]

//unfinished
let computation_benchmark3_formb = [
//     function comp_1a_1(answer) {
//     return rtl_1ans('847', [1,2,3], answer)
//     },

//     function comp_1a_2(answer) {
//         return rtl_1ans('7020', [1,2,3,4], answer)
//     },

//     function comp_1a_3(answer) {
//         return rtl_fraction({whole: '2', top: '2', bottom: '5'}, [1,2,3], answer)
//     },

//     function comp_1a_4(answer) {
//         return rtl_1ans('72', [1,2], answer)
//     },

//     function comp_1a_5(answer) {
//         return ltr_div({whole: '143', rem: '1'}, [3,6,10,14], answer)
//     },

//     function comp_1a_6(answer) {
//         return rtl_1ans('123', [1,2], answer)
//     },

//     function comp_1a_7(answer) {
//         return rtl_fraction({top: '7', bottom: '8'}, [1,2,3], answer)
//     },

//     function comp_1a_8(answer) {
//         return rtl_1ans('6886', [1,2,3,4], answer)
//     },

//     function comp_1a_9(answer) {
//         return rtl_1ans('209', [2,5,8], answer)
//     },

//     function comp_1a_10(answer) {
//         //Two acceptable answers, different scoring.
//         return Math.max(
//             rtl_fraction({whole: '8', top: '1', bottom: '4'}, [0,0,5], answer),
//             rtl_fraction({whole: '8', top: '3', bottom: '12'}, [1,2,3,4], answer)
//         )
//     },

//     function comp_1a_11(answer) {
//         return ltr_div({whole: '80', rem: '2'}, [3,6,9], answer)
//     },

//     function comp_1a_12(answer) {
//         return ltr_div({whole: '7'}, [1], answer)
//     },

//     function comp_1a_13(answer) {
//         return rtl_1ans('7128', [2,5,8,11], answer)
//     },

//     function comp_1a_14(answer) {
//         return rtl_fraction({top: '3', bottom: '4'}, [1,2], answer)
//     },

//     function comp_1a_15(answer) {
//         return rtl_1ans('3156', [1,2,3,4], answer)
//     },

//     function comp_1a_16(answer) {
//         //Two acceptable answers, different scoring.
//         return Math.max(
//             rtl_fraction({whole: '7', top: '2', bottom: '5'}, [0,0,5], answer),
//             rtl_fraction({whole: '7', top: '4', bottom: '10'}, [1,2,3,4], answer)
//         )
//     },

//     function comp_1a_17(answer) {
//         return rtl_fraction({top: '2', bottom: '3'}, [1,2], answer)
//     },

//     function comp_1a_18(answer) {
//         return rtl_fraction({top: '7', bottom: '12'}, [1,2], answer)
//     },

//     function comp_1a_19(answer) {
//         return rtl_1ans('5803', [1,2,3,4], answer)
//     },

//     function comp_1a_20(answer) {
//         return ltr_div({whole: '156', rem: '3'}, [3,6,10,14], answer)
//     },

//     function comp_1a_21(answer) {
//         return ltr_div({whole: '132', rem: '1'}, [3,6,9,12], answer)
//     },

//     function comp_1a_22(answer) {
//         return rtl_1ans('1495', [2,5,8,11], answer)
//     },

//     function comp_1a_23(answer) {
//         return rtl_1ans('1746', [1,2,3,4], answer)
//     },

//     function comp_1a_24(answer) {
//         return rtl_1ans('9206', [1,2,3,4], answer)
//     },

//     function comp_1a_25(answer) {
//         return rtl_1ans('408', [2,5,8], answer)
//     }
]




module.exports = {
    computation_benchmark1_forma,
    computation_benchmark1_formb,
    computation_benchmark2_forma,
    computation_benchmark2_formb
}

function score_b2_comp_forma() {
    let total = 0

    const problems = document.querySelectorAll('#computation_benchmark2_forma>.problem')
    for(let i=0;i<problems.length;i++){
        let answer = problems[i].children[0]
        let solution = problems[i].children[1]
        score = computation_benchmark2_forma[i](answer.value)
        solution.innerHTML = `Score: ${score}`
        console.log(`Answer: ${answer.value}`)
        total += score
    }

    const totalScore = document.querySelector('#b2fa_total');
    totalScore.innerHTML = `Total Score: ${total}/130`
}

function score_b2_comp_formb() {
    let total = 0

    const problems = document.querySelectorAll('#computation_benchmark2_formb>.problem')
    for(let i=0;i<problems.length;i++){
        let answer = problems[i].children[0]
        let solution = problems[i].children[1]
        score = computation_benchmark2_formb[i](answer.value)
        solution.innerHTML = `Score: ${score}`
        console.log(`Answer: ${answer.value}`)
        total += score
    }

    const totalScore = document.querySelector('#b2fb_total');
    totalScore.innerHTML = `Total Score: ${total}/135`
}

function score_b2_cap() {
    let total = 0

    const problems = document.querySelectorAll('#cap_benchmark2>.problem')
    for(let i=0;i<problems.length;i++){
        let answer = problems[i].children[0]
        let solution = problems[i].children[1]
        score = cap_benchmark2[i](answer.value)
        solution.innerHTML = `Score: ${score}`
        console.log(`Answer: ${answer.value}`)
        total += score
    }

    const totalScore = document.querySelector('#b2cap_total');
    totalScore.innerHTML = `Total Score: ${total}/130`
}