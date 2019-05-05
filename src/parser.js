const {TokenType, tokenError} = require('./scanner');
const {Binary, Literal, Grouping, Unary} = require('../src/expression');
const {Expression, Print} = require('./expression');

class Parser {

    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.runtimeError = new Error("parsing error");
    }

    expression() {
        return this.matchEither();
    }

    equality() {
        let expr = this.comparison();

        while (this.match([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
            let operator = this.previous();
            let right = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    match(types) {
        let ret = false;
        types.forEach(type => {
            if (this.check(type)) {
                this.advance();
                ret = true;
                return;
            }
        });

        return ret;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type == TokenType.EOF;
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    comparison() {
        let expr = this.addition();

        while (this.match([TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL])) {
            let operator = this.previous();
            let right = this.addition();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    matchBoth(){
        let expr = this.equality();

        if (this.match([TokenType.LOGICAL_AND])) {
            let operator = this.previous();
            let right = this.equality();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    matchEither(){
        let expr = this.matchBoth();

        if (this.match([TokenType.LOGICAL_OR])) {
            let operator = this.previous();
            let right = this.equality();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    addition() {
        let expr = this.multiplication();

        while (this.match([TokenType.MINUS, TokenType.PLUS])) {
            let operator = this.previous();
            let right = this.multiplication();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    multiplication() {
        let expr = this.unary();

        while (this.match([TokenType.SLASH, TokenType.STAR])) {
            let operator = this.previous();
            let right = this.unary();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }

    unary() {
        if (this.match([TokenType.BANG, TokenType.MINUS])) {
            let operator = this.previous();
            let right = this.unary();
            return new Unary(operator, right);
        }

        return this.primary();
    }

    primary() {
        if (this.match([TokenType.FALSE])) return new Literal(false);
        if (this.match([TokenType.TRUE])) return new Literal(true);
        if (this.match([TokenType.NIL])) return new Literal(null);

        if (this.match([TokenType.NUMBER, TokenType.STRING])) {
            return new Literal(this.previous().literal);
        }

        if (this.match([TokenType.LEFT_PAREN])) {
            let expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new Grouping(expr);
        }
        //exhausted all options for primary
        return new Literal(this.consume(TokenType.IDENTIFIER, "Expecting an identifier"));
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    error(token, message) {
        tokenError(token, message);
        return this.runtimeError;
    }

    statement() {
        if (this.match([TokenType.PRINT])) return this.printStatement();

        return this.expressionStatement();
    }

    printStatement() {
        let value = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Print(value);
    }

    expressionStatement() {
        let expr = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
        return new Expression(expr);
    }

    parse() {
        let statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }

        return statements;
    }
}

module.exports = {
    Parser
};