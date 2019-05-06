const {
    runtimeError
} = require('./scanner');
const {
    TokenType
} = require('../src/scanner');
const Environment = require('./environment');

class RuntimeError extends Error {

    constructor(token, message) {
        super();
        this.token = token;
        this.message = message;
    }
}

class Interpreter {

    constructor(ctx) {
        this.environment = new Environment();
        if (ctx) this.environment.init(ctx);
    }

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
        return (isNaN(object)) ? object : object.toString();
    }

    visitExpr(expr) {
        let typeOf = expr.constructor.name;
        if (typeOf == "Assign") {
            return this.visitAssignExpr(expr);
        }
        if (typeOf == "Binary") {
            return this.visitBinaryExpr(expr);
        }
        if (typeOf == "Literal") {
            return this.visitLiteralExpr(expr);
        }
        if (typeOf == "Grouping") {
            return this.visitGroupingExpr(expr);
        }
        if (typeOf == "Unary") {
            return this.visitUnaryExpr(expr);
        }
        if (typeOf == "Variable") {
            return this.visitVariableExpr(expr);
        }
        return null;
    }

    visitAssignExpr(expr) {
        let value = this.evaluate(expr.value);

        this.environment.assign(expr.name, value);
        return value;
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
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
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
            case TokenType.LOGICAL_OR:
                return this.logicalOr(left, right);
            case TokenType.LOGICAL_AND:
                return this.logicalAnd(left, right);
            case TokenType.TILDE_EQUALS:
                return this.isLike(left, right);
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

    visitVariableExpr(expr) {
        return this.environment.get(expr.name);
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

    isLike(a, b) {
        if (a == null && b == null) return true;
        return a.match(new RegExp(b, 'g'));
    }

    logicalOr(a, b) {
        return a || b;
    }

    logicalAnd(a, b) {
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
        if (typeOf == "Expression") {
            return this.visitExpressionStmt(stmt);
        }
        if (typeOf == "Print") {
            return this.visitPrintStmt(stmt);
        }
        if (typeOf == "Var") {
            return this.visitVarStmt(stmt);
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

    visitVarStmt(stmt) {
        let value = null;
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);
        return null;
    }
}

module.exports = {
    Interpreter
};