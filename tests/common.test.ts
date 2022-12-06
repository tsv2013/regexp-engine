import { MaskEngine, TokenizerStates } from "../sources";

test("scan token", () => {
  var ee = new MaskEngine("(000) 000-0000");
  var tc = ee.scanToken(ee.mask, 0);
  expect(tc.tokenString).toBe("(");
  expect(tc.workingState).toBe(TokenizerStates.ParsingBracket);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken(ee.mask, tc.pos);
  expect(tc.tokenString).toBe("0");
  expect(tc.workingState).toBe(TokenizerStates.ParsingSymbol);
  expect(tc.pos).toBe(2);
  tc = ee.scanToken(ee.mask, tc.pos);
  expect(tc.tokenString).toBe("0");
  expect(tc.workingState).toBe(TokenizerStates.ParsingSymbol);
  expect(tc.pos).toBe(3);
  tc = ee.scanToken(ee.mask, tc.pos);
  expect(tc.tokenString).toBe("0");
  expect(tc.workingState).toBe(TokenizerStates.ParsingSymbol);
  expect(tc.pos).toBe(4);
  tc = ee.scanToken(ee.mask, tc.pos);
  expect(tc.tokenString).toBe(")");
  expect(tc.workingState).toBe(TokenizerStates.ParsingBracket);
  expect(tc.pos).toBe(5);
  tc = ee.scanToken(ee.mask, tc.pos);
  expect(tc.tokenString).toBe(" ");
  expect(tc.workingState).toBe(TokenizerStates.ParsingOther);
  expect(tc.pos).toBe(6);
  tc = ee.scanToken(ee.mask, tc.pos);
  expect(tc.tokenString).toBe("0");
  expect(tc.workingState).toBe(TokenizerStates.ParsingSymbol);
  expect(tc.pos).toBe(7);
});

test("tokenize", () => {
  var ee = new MaskEngine("\d*\.?\d*");
  var tokens = ee.tokenize("2*2");
  expect(tokens.length).toBe(3);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("*");
  expect(tokens[2].type).toBe("n");

  tokens = ee.tokenize("2 * 2");
  expect(tokens.length).toBe(3);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("*");
  expect(tokens[2].type).toBe("n");
});

test("tokenize ') '", () => {
  var ee = new MaskEngine("\d*\.?\d*");
  var tokens = ee.tokenize("5 % (3-1) ");
  expect(tokens.length).toBe(7);
  expect(tokens[0].type).toBe("n");
  expect(tokens[1].type).toBe("%");
  expect(tokens[2].type).toBe("(");
  expect(tokens[3].type).toBe("n");
  expect(tokens[4].type).toBe("-");
  expect(tokens[5].type).toBe("n");
  expect(tokens[6].type).toBe(")");
});

test("calculateRPN", () => {
  var ee = new MaskEngine("\d*\.?\d*");
  expect(
    ee.buildNFAfromRPN([
      { value: 6, type: "n" },
      { value: 3, type: "n" },
      { type: "/" }
    ])
  ).toBe(2);
});

test("Basic masks", () => {
  var re = new MaskEngine("(000) 000-0000");
  re = new MaskEngine("(999) 000-0000");
  re = new MaskEngine("(000) XXX-XXXX");
  re = new MaskEngine("#999");
  re = new MaskEngine("00000-9999");
  re = new MaskEngine("ISBN 0-CCCCCCCCC-0");
  re = new MaskEngine(">L<l*");
  re = new MaskEngine("");
});