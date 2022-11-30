# regexp-engine
JavaScript (TypeScript) regexp engine library

## How to compile this repo
 - git clone https://github.com/tsv2013/regexp-engine.git
 - cd regexp-engine
 - npm i
 - npm test
 - npm run build


## Sample usage

### Basic functions
```JS
  var ee = new Regexp("d*.d*");
  var res1 = ee.evaluate("99.7");
```
