# mask-engine
JavaScript (TypeScript) regexp engine library

## How to compile this repo
 - git clone https://github.com/tsv2013/mask-engine.git
 - cd mask-engine
 - npm i
 - npm test
 - npm run build


## Sample usage


Character

Explanation

0

User must enter a digit (0 to 9).

9

User can enter a digit (0 to 9).

#

User can enter a digit, space, plus or minus sign. If skipped, a blank space is entered.

L

User must enter a letter.

l

User can enter a letter.

X

User must enter a letter or a digit.

x

User can enter a letter or a digit.

C

User must enter either a letter or a space.

c

User can enter letters or spaces.

?

User can enter one symbol.

+

User can enter at least one symbol.

*

User can enter from zero to any count of symbols.

{N}

\

Characters immediately following will be displayed literally.

""

Characters enclosed in double quotation marks will be displayed literally.
User must enter exactly N symbols

. , : ; - /

Decimal and thousands placeholders, date and time separators.

>

Coverts all characters that follow to uppercase.

<

Converts all characters that follow to lowercase.


### Basic functions
```JS
  var ee = new Regexp("0{2}.9?");
  var res1 = ee.evaluate("99.7");
```
