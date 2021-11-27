// import {computation_benchmark1_forma} from './score_4.js'
const score_4 = require('./score_4')


//Computation benchmark 1 form a
let comp1a = new Array(
    new Array('847', '7020', {whole: '2', top: '2', bottom:'5'}, '72', {whole:'143', rem:'1'}),
    new Array('123', {top:'7', bottom: '8'}, '6886', '209', {whole:'8',top:'1',bottom:'4'}),
    new Array({whole:'80', rem:'2'}, {whole:'7'}, '7128', {top:'3', bottom: '4'}, '3156'),
    new Array({whole: '7', top:'2', bottom:'5'},{top:'2',bottom:'3'},{top:'7',bottom:'12'},'5803',{whole:'156',rem:'3'}),
    new Array({whole:'132',rem:'1'},'1495','1746','9206','408')
)
let comp1a_scores=[26,22,27,28,39]
let score = 0
let total = 0
let problem_num = 0
console.log("=====Computation Benchmark 1 Form A=======")
for(let l=0;l<comp1a.length;l++){
    for(let i=0;i<comp1a[l].length;i++){
        // console.log("line " + l + " problem " + i + " with answer " + lines[l][i])
        s= score_4.computation_benchmark1_forma[problem_num](comp1a[l][i])
        score += s
        problem_num++
        console.log(problem_num + ". " + s)
    }
    console.log("Line "+(l+1)+": "+score+"/"+comp1a_scores[l])
    total += score
    score=0
}

console.log("Total: " + total + "/142")



//Computation benchmark 1 form b
let comp1b = new Array(
    new Array('398', '7132', {whole: '9', top: '3', bottom:'4'}, '56', {whole:'96', rem:'3'}),
    new Array('262', {top:'3', bottom: '8'}, '4359', '198', {whole:'5',top:'3',bottom:'4'}),
    new Array({whole:'31', rem:'4'}, {whole:'7'}, '2688', {top:'3', bottom: '5'}, '7974'),
    new Array({whole: '2', top:'1', bottom:'3'},{top:'2',bottom:'3'},{top:'5',bottom:'6'},'3934',{whole:'72',rem:'1'}),
    new Array({whole:'206',rem:'3'},'2755','4089','5006','861')
)
let comp1b_scores=[22,21,27,21,38]
score = 0
total = 0
problem_num = 0
console.log("=====Computation Benchmark 1 Form B=======")
for(l=0;l<comp1b.length;l++){
    for(i=0;i<comp1b[l].length;i++){
        s= score_4.computation_benchmark1_formb[problem_num](comp1b[l][i])
        score += s
        problem_num++
        console.log(problem_num + ". " + s)
    }
    console.log("Line "+(l+1)+": "+score+"/"+comp1b_scores[l])
    total += score
    score=0
}

console.log("Total: " + total + "/129")



//Computation benchmark 2 form a
let comp2a = new Array(
    new Array('498', '7120', {whole: '6', top: '1', bottom:'3'}, '72', {whole:'44', rem:'2'}),
    new Array('103', {top:'7', bottom: '8'}, '685', '1056', {whole:'1',top:'1',bottom:'8'}),
    new Array({whole:'119', rem:'4'}, {whole:'5'}, '5644', {top:'1', bottom: '5'}, '4680'),
    new Array({whole: '1', top:'1', bottom:'4'},{top:'1',bottom:'4'},{top:'1',bottom:'6'},'4338',{whole:'78',rem:'5'}),
    new Array({whole:'40',rem:'1'},'1938','4879','6622','299')
)
let comp2a_scores=[22,20,31,21,36]
score = 0
total = 0
problem_num = 0
console.log("=====Computation Benchmark 2 Form A=======")
for(l=0;l<comp2a.length;l++){
    for(i=0;i<comp2a[l].length;i++){
        // console.log("line " + l + " problem " + i + " with answer " + lines[l][i])
        s= score_4.computation_benchmark2_forma[problem_num](comp2a[l][i])
        score += s
        problem_num++
        console.log(problem_num + ". " + s)
    }
    console.log("Line "+(l+1)+": "+score+"/"+comp2a_scores[l])
    total += score
    score=0
}

console.log("Total: " + total + "/130")



// //Computation benchmark 1 form a
// let comp1a = new Array(
//     new Array('847', '7020', {whole: '2', top: '2', bottom:'5'}, '72', {whole:'143', rem:'1'}),
//     new Array('123', {top:'7', bottom: '8'}, '6886', '209', {whole:'8',top:'1',bottom:'4'}),
//     new Array({whole:'80', rem:'2'}, {whole:'7'}, '7128', {top:'3', bottom: '4'}, '3156'),
//     new Array({whole: '7', top:'2', bottom:'5'},{top:'2',bottom:'3'},{top:'7',bottom:'12'},'5803',{whole:'156',rem:'3'}),
//     new Array({whole:'132',rem:'1'},'1495','1746','9206','408')
// )
// let comp1a_scores=[26,22,27,28,39]
// let score = 0
// let total = 0
// let problem_num = 0
// console.log("=====Computation Benchmark 1 Form A=======")
// for(let l=0;l<comp1a.length;l++){
//     for(let i=0;i<comp1a[l].length;i++){
//         // console.log("line " + l + " problem " + i + " with answer " + lines[l][i])
//         s= score_4.computation_benchmark1_forma[problem_num](comp1a[l][i])
//         score += s
//         problem_num++
//         console.log(problem_num + ". " + s)
//     }
//     console.log("Line "+(l+1)+": "+score+"/"+comp1a_scores[l])
//     total += score
//     score=0
// }

// console.log("Total: " + total + "/142")



// //Computation benchmark 1 form a
// let comp1a = new Array(
//     new Array('847', '7020', {whole: '2', top: '2', bottom:'5'}, '72', {whole:'143', rem:'1'}),
//     new Array('123', {top:'7', bottom: '8'}, '6886', '209', {whole:'8',top:'1',bottom:'4'}),
//     new Array({whole:'80', rem:'2'}, {whole:'7'}, '7128', {top:'3', bottom: '4'}, '3156'),
//     new Array({whole: '7', top:'2', bottom:'5'},{top:'2',bottom:'3'},{top:'7',bottom:'12'},'5803',{whole:'156',rem:'3'}),
//     new Array({whole:'132',rem:'1'},'1495','1746','9206','408')
// )
// let comp1a_scores=[26,22,27,28,39]
// let score = 0
// let total = 0
// let problem_num = 0
// console.log("=====Computation Benchmark 1 Form A=======")
// for(let l=0;l<comp1a.length;l++){
//     for(let i=0;i<comp1a[l].length;i++){
//         // console.log("line " + l + " problem " + i + " with answer " + lines[l][i])
//         s= score_4.computation_benchmark1_forma[problem_num](comp1a[l][i])
//         score += s
//         problem_num++
//         console.log(problem_num + ". " + s)
//     }
//     console.log("Line "+(l+1)+": "+score+"/"+comp1a_scores[l])
//     total += score
//     score=0
// }

// console.log("Total: " + total + "/142")



// //Computation benchmark 1 form a
// let comp1a = new Array(
//     new Array('847', '7020', {whole: '2', top: '2', bottom:'5'}, '72', {whole:'143', rem:'1'}),
//     new Array('123', {top:'7', bottom: '8'}, '6886', '209', {whole:'8',top:'1',bottom:'4'}),
//     new Array({whole:'80', rem:'2'}, {whole:'7'}, '7128', {top:'3', bottom: '4'}, '3156'),
//     new Array({whole: '7', top:'2', bottom:'5'},{top:'2',bottom:'3'},{top:'7',bottom:'12'},'5803',{whole:'156',rem:'3'}),
//     new Array({whole:'132',rem:'1'},'1495','1746','9206','408')
// )
// let comp1a_scores=[26,22,27,28,39]
// let score = 0
// let total = 0
// let problem_num = 0
// console.log("=====Computation Benchmark 1 Form A=======")
// for(let l=0;l<comp1a.length;l++){
//     for(let i=0;i<comp1a[l].length;i++){
//         // console.log("line " + l + " problem " + i + " with answer " + lines[l][i])
//         s= score_4.computation_benchmark1_forma[problem_num](comp1a[l][i])
//         score += s
//         problem_num++
//         console.log(problem_num + ". " + s)
//     }
//     console.log("Line "+(l+1)+": "+score+"/"+comp1a_scores[l])
//     total += score
//     score=0
// }

// console.log("Total: " + total + "/142")



//Testing Partly Correct Scoring

