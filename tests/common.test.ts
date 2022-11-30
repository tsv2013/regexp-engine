import { RegularExpression, TokenizerStates } from "../sources";

test("scan token", () => {
  var ee = new RegularExpression("\d*\.?\d*");
  var tc = ee.scanToken("2*2", 0);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken("2*2", 1);
  expect(tc.tokenString).toBe("*");
  expect(tc.workingState).toBe(TokenizerStates.ParsingBracket);
  expect(tc.pos).toBe(2);
  tc = ee.scanToken("2*2", 2);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(3);

  tc = ee.scanToken("2 * 2", 0);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken("2 * 2", 1);
  expect(tc.tokenString).toBe("*");
  expect(tc.workingState).toBe(TokenizerStates.ParsingBracket);
  expect(tc.pos).toBe(3);
  tc = ee.scanToken("2 * 2", 3);
  expect(tc.tokenString).toBe("2");
  expect(tc.workingState).toBe(TokenizerStates.ParsingNumber);
  expect(tc.pos).toBe(5);

  tc = ee.scanToken("", 0);
  expect(tc.tokenString).toBe("");
  expect(tc.workingState).toBe(TokenizerStates.Error);
  expect(tc.pos).toBe(0);
  tc = ee.scanToken(" ", 0);
  expect(tc.tokenString).toBe("");
  expect(tc.workingState).toBe(TokenizerStates.Error);
  expect(tc.pos).toBe(1);
  tc = ee.scanToken("   ", 0);
  expect(tc.tokenString).toBe("");
  expect(tc.workingState).toBe(TokenizerStates.Error);
  expect(tc.pos).toBe(3);
});

test("tokenize", () => {
  var ee = new RegularExpression("\d*\.?\d*");
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
  var ee = new RegularExpression("\d*\.?\d*");
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
  var ee = new RegularExpression("\d*\.?\d*");
  expect(
    ee.buildNFAfromRPN([
      { value: 6, type: "n" },
      { value: 3, type: "n" },
      { type: "/" }
    ])
  ).toBe(2);
});

test("Basic masks", () => {
  var re = new RegularExpression("(000) 000-0000");
  re = new RegularExpression("(999) 000-0000");
  re = new RegularExpression("(000) XXX-XXXX");
  re = new RegularExpression("#999");
  re = new RegularExpression("00000-9999");
  re = new RegularExpression("ISBN 0-CCCCCCCCC-0");
  re = new RegularExpression(">L<l*");
  re = new RegularExpression("");
});