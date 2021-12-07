============================
===ACADIENCE MATH SCORING===
============================

Original data is stored in the CSV file. This data was taken from the Teacher Key pdfs.
Fields include:
* Benchmark #
* Grade
* Form
* Answer(s) 
    - multiple answers should be placed in parentheses, separated by commas. 
    - Ex: (2, 11/11). Both are correct, but one is simplified and worth an extra point.
* Scoring method - a digit, 1-4
    1: Right to left, single answer (addition, subtraction, multiplication.)
    2: Fraction, single answer (Ex: 3 3/4. Single space between whole & fraction, forward slashes only)
    3: Left to right, single answer (division, can include a remainder. Ex. 30r4. No spaces.)
    4: Fraction, multiple answers. 
* Scores 
    - should be a list, smalles to largest, in square brackets. 
    - Ex. [2,5,8] means if all 3 digits are correct, the score will be 8.
    - if the problem has multiple answers, there should be the same number of score lists, in parentheses, separated by commas. 
    - Make sure the number of items in each score list correspond to the number of digits in the answer (for bonus point answers, use 0 for the score value of anything but 100% correct)
    - Ex. For answers (2, 11/11), scores could be: ([5], [1,2,3,4])
    - Ex. For answers (2 1/2, 2 8/16), scores could be: ([0,0,5], [1,2,3,4])

When the CSV is up-to-date and ready, run this file to dynamically create all the JS and HTML files from your CSV data:
    * open \python 
    * double click "build.bat" to run

Now all the files have been created, and can be uploaded anywhere. Files you'll need to run it properly:
    * home.HTML
    * benchmark1.HTML
    * benchmark2.HTML
    * benchmark3.HTML
    * score.js
    * /style/main.css
    * /style/reset.css

I recommend testing any you've changed. Steps:
    * Open the HTML file for the benchmark you changed
    * type in the answers, one by one
    * click "Score it!"
    * verify total score is correct, and compare possible score to total score possible on the teacher key.

Common Errors:
    * build.bat does not finish step 1
        - this usually means you've only provided a single set of scores for a multiple-answer problem
        - could also be a typo somewhere (extra comma, no end brace, etc)
    * benchmark.html gives score NaN
        - this usually means you didn't provide the correct number of values in your score list. 
        - Make sure there are the same number of score options in each list as digits in the answer.
            - . counts as a digit
                Ex. 123.45 = 6 digits, needs a score list with 6 values. [1,2,3,4,5,6]
            - , does not count as a digit
                Ex. 1,234,567 = 7 digits, needs a score list with 7 values. [1,2,3,4,5,6,7]
            - / does not count as a digit
                 Ex. 2 23/35 = 5 digits, needs a score list with 5 values. [1,2,3,4,5]

----------------
---Future use---
----------------
The Javascript files created will score each problem individually, and can be used with any number of website designs.
A system that administers the exam could be created, and this JS used to score it immediately.
A system that administers the exam, then sends the results to a queue for later scoring could be designed.






