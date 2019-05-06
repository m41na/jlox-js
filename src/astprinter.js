class AstPrinter {

    printExpr(expr) {
        return expr.accept(this);
    }

    printStmt(stmts){
        stmts.forEach(stmt => stmt.accept(this));
    }

    visitExpr(expr) {
        let typeOf = expr.constructor.name;
        if (typeOf == "Assign") {
            return this.visitAssignExpr(expr);
        }
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
        if(typeOf == "Variable"){
            return this.visitVariableExpr(expr);
        }
        return null;
    }

    visitAssignExpr(expr) {
        return this.parenthesize(expr.name, [value]);
    }

    visitBinaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, [expr.left, expr.right]);
    }

    visitGroupingExpr(expr) {
        return this.parenthesize("group", [expr.expression]);
    }

    visitLiteralExpr(expr) {
        if (expr.value == null) return "nil";
        return expr.value.toString();
    }

    visitUnaryExpr(expr) {
        return this.parenthesize(expr.operator.lexeme, [expr.right]);
    }

    visitVariableExpr(expr) {
        return expr.name.lexeme;
    }

    parenthesize(name, exprs) {
        let builder = "";

        builder = builder.concat("(").concat(name);
        exprs.forEach(expr => {
            builder = builder.concat(" ");
            builder = builder.concat(expr.accept(this));
        });
        builder = builder.concat(")");

        return builder;
    }

    visitStmt(stmt) {
        let typeOf = stmt.constructor.name;
        if(typeOf == "Expression"){
            return this.visitExpressionStmt(stmt);
        }
        if(typeOf == "Print"){
            return this.visitPrintStmt(stmt);
        }
        if (typeOf == "Var") {
            return this.visitVarStmt(stmt);
        }
        return null;
    }

    visitExpressionStmt(stmt) {
        if (stmt.expression != null) {
            console.log(this.printExpr(stmt.expression));
        }
        return null;
    }

    visitPrintStmt(stmt) {
        if (stmt.expression != null) {
            console.log(this.printExpr(stmt.expression));
        }
        return null;
    }

    visitVarStmt(stmt) {
        if(stmt.initializer){
            console.log(stmt.initializer.value);
        }
        return null;
    }
}

module.exports = {
    AstPrinter
};