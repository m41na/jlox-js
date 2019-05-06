class Expr {

    accept(visitor){
        return visitor.visitExpr(this);
    }
}

class Assign extends Expr {

    constructor(name, value){
        super();
        this.name = name;
        this.value = value;
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

class Variable extends Expr {

    constructor(token){
        super();
        this.name = token;
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

class Var extends Stmt {

    constructor(token, expression){
        super();
        this.name = token;
        this.initializer = expression;
    }
}

module.exports = {
    Expr,
    Assign,
    Binary,
    Grouping,
    Unary,
    Variable,
    Literal,
    Stmt,
    Expression,
    Print,
    Var
};