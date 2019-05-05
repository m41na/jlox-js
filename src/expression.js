class Expr {

    accept(visitor){
        return visitor.visitExpr(this);
    }
}

class Binary extends Expr {

    constructor(left, operator, right){
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class Grouping extends Expr {

    constructor(expression){
        super();
        this.expression = expression;
    }
}

class Literal extends Expr {

    constructor(value){
        super();
        this.value = value;
    }
}

class Unary extends Expr {

    constructor(operator, right){
        super();
        this.operator = operator;
        this.right = right;
    }
}

class Stmt {

    accept(visitor){
        return visitor.visitStmt(this);
    }
}

class Expression extends Stmt {

    constructor(expression){
        super();
        this.expression = expression;
    }
}

class Print extends Stmt {

    constructor(expression){
        super();
        this.expression = expression;
    }
}

module.exports = {
    Expr,
    Binary,
    Grouping,
    Unary,
    Literal,
    Stmt,
    Expression,
    Print
};