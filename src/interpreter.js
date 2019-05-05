const {runtimeError} = require('./scanner');
const {TokenType} = require('../src/scanner');

class RuntimeError extends Error {

    constructor(token, message){
        super();
        this.token = token;
        this.message = message;
    }
}

class Interpreter {

    interpret(statements) {
        try {
            statements.forEach(statement => {
                this.execute(statement);
            });
        } catch (error) {
            runtimeError(error);
        }
    }

    execute(stmt) {
        stmt.accept(this);
    }

    stringify(object) {
        return (isNaN(object))? object : object.toString();
    }

    visitExpr(expr) {
        let typeOf = expr.constructor.name;
        if(typeOf == "Binary"){
            return this.visitBinaryExpr(expr);
        }
        if(typeOf == "Literal"){
            return this.visitLiteralExpr(expr);
        }
        if(typeOf == "Grouping"){
            return this.visitGroupingExpr(expr);
        }
        if(typeOf == "Unary"){
            return this.visitUnaryExpr(expr);
        }
        return null;
    }

    visitBinaryExpr(expr) {
        let left = this.evaluate(expr.left);
        let right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left >= right;
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.PLUS:
                if (!isNaN(left) && !isNaN(right)) {
                    return left + right;
                }

                if (isNaN(left) && isNaN(right)) {
                    return left + right;
                }
                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;
            case TokenType.LOGICAL_OR: return this.logicalOr(left, right);
            case TokenType.LOGICAL_AND: return this.logicalAnd(left, right);
            case TokenType.TILDE_EQUALS: return this.isLike(left, right);
        }

        // Unreachable.
        return null;
    }

    visitLiteralExpr(expr) {
        return expr.value;
    }

    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }

    visitUnaryExpr(expr) {
        let right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case TokenType.BANG:
                return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return -(right);
        }

        // Unreachable.
        return null;
    }

    isEqual(a, b) {
        // nil is only equal to nil.
        if (a == null && b == null) return true;
        if (a == null) return false;

        return a == b;
    }

    isTruthy(object) {
        if (!object) return false;
        return new Boolean(object);
    }

    isLike(a, b){
        if (a == null && b == null) return true;
        return a.match(new RegExp(b, 'g'));
    }

    logicalOr(a,b){
        return a || b;
    }

    logicalAnd(a,b){
        return a && b;
    }

    evaluate(expr) {
        return expr.accept(this);
    }

    checkNumberOperand(operator, operand) {
        if (!isNaN(operand)) return;
        throw new RuntimeError(operator, "Operand must be a number.");
    }

    checkNumberOperands(operator, left, right) {
        if (!isNaN(left) && !isNaN(right)) return;
        throw new RuntimeError(operator, "Operands must be numbers.");
    }

    visitStmt(stmt) {
        let typeOf = stmt.constructor.name;
        if(typeOf == "Expression"){
            return this.visitExpressionStmt(stmt);
        }
        if(typeOf == "Print"){
            return this.visitPrintStmt(stmt);
        }
        return null;
    }

    visitExpressionStmt(stmt) {
        return this.evaluate(stmt.expression);
    }

    visitPrintStmt(stmt) {
        let value = this.evaluate(stmt.expression);
        console.log(this.stringify(value));
        return null;
    }
}

module.exports = {
    Interpreter
};