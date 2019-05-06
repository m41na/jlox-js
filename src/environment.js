class RuntimeError extends Error {

    constructor(token, message) {
        super();
        this.token = token;
        this.message = message;
    }
}

class Environment {

    constructor(enclosing) {
        this.values = {};
        this.enclosing = enclosing;
    }

    init(ctx){
        this.value = ctx;
    }

    get(name) {
        if (this.values[name.lexeme]) {
            return this.values[name.lexeme];
        }
        if (this.enclosing) return this.enclosing.get(name);
        throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
    }

    define(name, value) {
        this.values[name] = value;
    }

    assign(name, value) {
        if (this.values[name.lexeme]) {
            this.values[name.lexeme] = value;
            return;
        }

        if (enclosing != null) {         
            enclosing.assign(name, value); 
            return;                        
          } 

        throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
    }
}

module.exports = Environment;