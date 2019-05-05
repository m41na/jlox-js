/**
 * Grammer rules
 * 
    expression     → matchEither ;
    matchEither    → matchBoth ;
    matchBoth      → equality ;
    equality       → comparison ( ( "!=" | "==" ) comparison )* ;
    comparison     → addition ( ( ">" | ">=" | "<" | "<=" ) addition )* ;
    addition       → multiplication ( ( "-" | "+" ) multiplication )* ;
    multiplication → unary ( ( "/" | "*" ) unary )* ;
    unary          → ( "!" | "-" ) unary
                | primary ;
    primary        → NUMBER | STRING | "false" | "true" | "nil"
                | "(" expression ")" ;
 */

const { Scanner } = require('./src/scanner');
const { Parser } = require('./src/parser');
const { AstPrinter } = require('./src/astprinter');
const { Interpreter } = require('./src/interpreter');

const run = (source) => {
    let scanner = new Scanner(source);
    let tokens = scanner.scanTokens();

    let parser = new Parser(tokens);
    let statements = parser.parse();

    let printer = new AstPrinter();
    printer.printStmt(statements);

    let interpreter = new Interpreter();
    interpreter.interpret(statements);
};

run("print 10 || 2;");