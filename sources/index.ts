export class Token {
  type: string;
  value?: any;
}

export enum TokenizerStates {
  Started = 1,
  Finished = 2,
  Error = 3,
  ParsingSymbol = 4,
  ParsingGroup = 5,
  ParsingQuantifier = 6,
  ParsingNumber = 7,
  ParsingAlternative = 7,
  ParsingBracket = 8,
  ParsingOther = 1000
}

export enum KnownSymbolClasses {
  Symbol = 1,
  Escape = 2,
  Bracket = 3,
  Quantifier = 4,
  QuantifierBracket = 5,
  GroupBracket = 6,
  Alternative = 7,
  Anchor = 8,
  Delimiter = 9,
  Digit = 10,
  Other = 1000,
}

const symbolClasses = {
  [KnownSymbolClasses.Symbol]: "09#LlXxCc",
  [KnownSymbolClasses.Quantifier]: "*+?",
  [KnownSymbolClasses.QuantifierBracket]: "{}",
  [KnownSymbolClasses.Bracket]: "()",
  [KnownSymbolClasses.GroupBracket]: "[]",
  [KnownSymbolClasses.Alternative]: "|",
  [KnownSymbolClasses.Escape]: "\\",
  [KnownSymbolClasses.Anchor]: "^$",
  [KnownSymbolClasses.Delimiter]: "\r\r\n",
  [KnownSymbolClasses.Digit]: "0123456789",
  [KnownSymbolClasses.Other]: "",
}

var tokenStateMachine: {[state: number]: {[symbolClass: number]: TokenizerStates}} = {};
tokenStateMachine[TokenizerStates.Started] = {
  [KnownSymbolClasses.Delimiter]: TokenizerStates.Started,
  [KnownSymbolClasses.Symbol]: TokenizerStates.ParsingSymbol,
  [KnownSymbolClasses.Digit]: TokenizerStates.Error,
  [KnownSymbolClasses.Quantifier]: TokenizerStates.ParsingQuantifier,
  [KnownSymbolClasses.QuantifierBracket]: TokenizerStates.ParsingNumber,
  [KnownSymbolClasses.Bracket]: TokenizerStates.ParsingBracket
};
tokenStateMachine[TokenizerStates.ParsingNumber] = {
  [KnownSymbolClasses.QuantifierBracket]: TokenizerStates.Finished,
  [KnownSymbolClasses.Digit]: TokenizerStates.ParsingNumber,
};
tokenStateMachine[TokenizerStates.ParsingBracket] = {
  [KnownSymbolClasses.Bracket]: TokenizerStates.Finished,
  [KnownSymbolClasses.QuantifierBracket]: TokenizerStates.Finished,
  [KnownSymbolClasses.Symbol]: TokenizerStates.Finished,
};
tokenStateMachine[TokenizerStates.ParsingSymbol] = {
  [KnownSymbolClasses.Bracket]: TokenizerStates.Finished,
  [KnownSymbolClasses.QuantifierBracket]: TokenizerStates.Finished,
  [KnownSymbolClasses.Symbol]: TokenizerStates.Finished,
};

export class MaskEngine {
  static operations = {
    "+": {
      priority: 0,
      function: (a, b) => a! + b!
    },
    "-": {
      priority: 0,
      function: (a, b) => a! - b!
    },
    "*": {
      priority: 1,
      function: (a, b) => a! * b!
    },
    "/": {
      priority: 1,
      function: (a, b) => a! / b!
    },
    "%": {
      priority: 1,
      function: (a, b) => a! % b!
    },
    or: {
      priority: 0,
      function: (a, b) => a || b
    },
    and: {
      priority: 1,
      function: (a, b) => a && b
    },
    "!": {
      priority: 2,
      function: a => !a
    },
    true: {
      priority: 100,
      function: () => true
    },
    false: {
      priority: 100,
      function: () => false
    },
    $$getContextValue: {
      priority: 100,
      function: (contextPropertyName: string, context: any) => {
        var propertyName = contextPropertyName!.substring(
          1,
          contextPropertyName.length - 1
        );
        return context[propertyName];
      }
    }
  };

  private readonly nfa = undefined;

  private isOfMoreOrEqualPriority(currentOp: string, otherOp: string): boolean {
    return (
      MaskEngine.operations[currentOp].priority <=
      MaskEngine.operations[otherOp].priority
    );
  }

  constructor(public readonly mask: string) {
    // this.nfa = this.buildNFAfromRPN(this.convertToRPN(this.tokenize(mask)));
  }

  classifySymbol(symbol: string): KnownSymbolClasses {
    for (let component in KnownSymbolClasses) { 
      if(symbolClasses[component].indexOf(symbol) != -1) {
        return component as any;
      }
    }
    return KnownSymbolClasses.Other;
  }

  scanToken(str: string, start: number) {
    var state: TokenizerStates = TokenizerStates.Started;
    var workingState = TokenizerStates.Error;
    var tokenString = "";
    var i = start;
    while (i < str.length) {
      var symbolClass = this.classifySymbol(str[i]);
      state = tokenStateMachine[state][symbolClass];
      if(state === TokenizerStates.Finished || state === TokenizerStates.Error) {
        break;
      }
      else if (state === TokenizerStates.Started) {
        i++;
      } else {
        workingState = state;
        tokenString += str[i++];
      }
    }
    if (tokenString === "") {
      workingState = TokenizerStates.Error;
    }
    return {
      workingState,
      tokenString,
      pos: i
    };
  }

  tokenize(expression: string): Array<Token> {
    var tokens: Array<Token> = [];
    for (var i = 0; i < expression.length; ) {
      var tokenCandidate = this.scanToken(expression, i);
      if (tokenCandidate.workingState !== TokenizerStates.Error) {
        if (tokenCandidate.workingState === TokenizerStates.ParsingNumber) {
          tokens.push({
            type: "n",
            value: parseInt(tokenCandidate.tokenString)
          });
        } else {
          tokens.push({
            type: tokenCandidate.tokenString
          });
        }
      }
      i = tokenCandidate.pos;
    }
    return tokens;
  }

  convertToRPN(tokens: Array<Token>): Array<Token> {
    var stack: Array<Token> = [];
    var rpn: Array<Token> = [];
    var currToken;

    var j = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "n") {
        rpn[j++] = tokens[i];
        continue;
      }
      if (tokens[i].type === "(") {
        stack.push(tokens[i]);
        continue;
      }
      if (tokens[i].type === ")") {
        do {
          currToken = stack.pop();
          rpn[j++] = currToken;
        } while (rpn[j - 1].type !== "(");
        j--;
        continue;
      }
      if (
        Object.keys(MaskEngine.operations).indexOf(tokens[i].type) !==
        -1
      ) {
        if (stack.length > 0) {
          do {
            currToken = stack.pop();
            rpn[j++] = currToken;
          } while (
            stack.length > 0 &&
            symbolClasses[KnownSymbolClasses.Bracket].indexOf(rpn[j - 1].type) === -1 &&
            this.isOfMoreOrEqualPriority(tokens[i].type, rpn[j - 1].type)
          );
          if (
            symbolClasses[KnownSymbolClasses.Bracket].indexOf(rpn[j - 1].type) !== -1 ||
            !this.isOfMoreOrEqualPriority(tokens[i].type, rpn[j - 1].type)
          ) {
            stack.push(currToken);
            j--;
          }
        }
        stack.push(tokens[i]);
        continue;
      }
    }
    while (stack.length > 0) {
      currToken = stack.pop();
      rpn[j++] = currToken;
    }
    return rpn;
  }

  buildNFAfromRPN(rpn: Array<Token>): number {
    var operands: Array<Token> = [];

    if (rpn.length === 0) {
      return undefined;
    }

    for (var i = 0; i < rpn.length; i++) {
      if (rpn[i].type === "n") {
        operands.push(rpn[i]);
      } else {
        var func = MaskEngine.operations[rpn[i].type].function;
        var args = operands
          .splice(operands.length - func.length)
          .map(op => op.value);
        operands.push({
          type: "n",
          value: func(...args)
        });
      }
    }
    var resultToken = operands.shift();
    return resultToken.value;
  }

  match(str: string) {
    return this.nfa.test(str);
  }
}
