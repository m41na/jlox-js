const {Scanner, Token, TokenType} = require('../../src/scanner');
const {Binary, Literal, Unary, Grouping} = require('../../src/expression');
const {AstPrinter} = require('../../src/astprinter');
const {Parser} = require('../../src/parser');
const { Interpreter } = require('../../src/interpreter');

const main = () => {
    let expression = new Binary(
            new Unary(
                new Token(TokenType.MINUS, "-", null, 1),
                new Literal(123)),
            new Token(TokenType.STAR, "*", null, 1),
            new Grouping(
                new Literal(45.67)));

    let printer = new AstPrinter();
    console.log(printer.printExpr(expression));

    let scanner = new Scanner("print 1 + (2 * 4) - (6 / 2);");
    let parser = new Parser(scanner.scanTokens());

    let interpreter = new Interpreter();
    interpreter.interpret(parser.parse());
};

main();