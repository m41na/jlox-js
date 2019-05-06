let hadError = false;
let hadRuntimeError = false;

const TokenType = {
    // Single-character tokens.                      
    LEFT_PAREN: "LEFT_PAREN",
    RIGHT_PAREN: "RIGHT_PAREN",
    LEFT_BRACE: "LEFT_BRACE",
    RIGHT_BRACE: "RIGHT_BRACE",
    LEFT_BRACE: "LEFT_BRACKET",
    RIGHT_BRACE: "RIGHT_BRACKET",
    COMMA: "COMMA",
    DOT: "DOT",
    MINUS: "MINUS",
    PLUS: "PLUS",
    COLON: "COLON",
    SEMICOLON: "SEMICOLON",
    SLASH: "SLASH",
    STAR: "STAR",
    TILDE: "TILDE",

    // One or two character tokens.                  
    BANG: "BANG",
    BANG_EQUAL: "BANG_EQUAL",
    EQUAL: "EQUAL",
    EQUAL_EQUAL: "EQUAL_EQUAL",
    GREATER: "GREATER",
    GREATER_EQUAL: "GREATER_EQUAL",
    LESS: "LESS",
    LESS_EQUAL: "LESS_EQUAL",
    TILDE_EQUALS: "TILDE_EQUALS",
    VERTI_BAR: "VERTI_BAR",
    LOGICAL_OR: "LOGICAL_OR",
    AMPERSAND: "AMPERSAND",
    LOGICAL_AND: "LOGICAL_AND",

    // Literals.                                     
    IDENTIFIER: "IDENTIFIER",
    STRING: "STRING",
    NUMBER: "NUMBER",

    // Keywords.                                     
    ASSERT: "ASSERT",
    MAP: "MAP",
    REDUCE: "REDUCE",
    FILTER: "FILTER",
    EACH: "EACH",    
    APPLY: "APPLY",
    TRUE: "TRUE",
    FALSE: "FALSE",
    PRINT: "PRINT",
    VAR: "VAR",

    EOF: "EOF"
};

const keywords = {
    assert: "ASSERT",
    map: "MAP",
    reduce: "REDUCE",
    filter: "FILTER",
    each: "EACH",
    apply: "APPLY",
    true: "TRUE",
    false: "FALSE",
    print: "PRINT",
    var: "VAR"
};

class Token {

    constructor(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString() {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}

class Scanner {

    constructor(source) {
        this.source = source;
        this.tokens = [];
        this.current = 0;
        this.line = 1;
        this.start = 0;
    }

    scanTokens() {
        while (!this.isAtEnd()) {
            // We are at the beginning of the next lexeme.
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }

    scanToken() {
        let c = this.advance();
        switch (c) {
            case '(':
                this.addToken(TokenType.LEFT_PAREN);
                break;
            case ')':
                this.addToken(TokenType.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(TokenType.LEFT_BRACE);
                break;
            case '}':
                this.addToken(TokenType.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(TokenType.COMMA);
                break;
            case '.':
                this.addToken(TokenType.DOT);
                break;
            case '-':
                this.addToken(TokenType.MINUS);
                break;
            case '+':
                this.addToken(TokenType.PLUS);
                break;
            case ':':
                this.addToken(TokenType.COLON);
                break;
            case ';':
                this.addToken(TokenType.SEMICOLON);
                break;
            case '*':
                this.addToken(TokenType.STAR);
                break;
            case '!':
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
                break;
            case '~':
                this.addToken(this.match('=') ? TokenType.TILDE_EQUALS : TokenType.TILDE);
                break;
            case '|':
                this.addToken(this.match('|') ? TokenType.LOGICAL_OR : TokenType.VERTI_BAR);
                break;
            case '&':
                this.addToken(this.match('&') ? TokenType.LOGICAL_AND : TokenType.AMPERSAND);
                break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line.
                    while (this.peek() != '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace.
                break;

            case '\n':
                this.line++;
                break;
            case '"':
                this.string();
                break;

            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    lineError(this.line, "Unexpected character.");
                }
                break;
        }
    }

    isAtEnd() {
        return this.current >= this.source.length;
    }

    advance() {
        this.current++;
        return this.source.charAt(this.current - 1);
    }

    addToken(type, literal) {
        let text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    match(expected) {
        if (this.isAtEnd()) {
            return false;
        }
        if (this.source.charAt(this.current) != expected) {
            return false;
        }

        this.current++;
        return true;
    }

    peek() {
        if (this.isAtEnd()) {
            return '\0';
        }
        return this.source.charAt(this.current);
    }

    string() {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') {
                line++;
            }
            this.advance();
        }

        // Unterminated string.
        if (this.isAtEnd()) {
            lineError(this.line, "Unterminated string.");
            return;
        }

        // The closing ".
        this.advance();

        // Trim the surrounding quotes.
        let value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    isDigit(c) {
        return c >= '0' && c <= '9';
    }

    number() {
        while (this.isDigit(this.peek())) {
            this.advance();
        }

        // Look for a fractional part.
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            // Consume the "."
            this.advance();

            while (this.isDigit(this.peek())) {
                this.advance();
            }
        }

        this.addToken(TokenType.NUMBER,
                parseFloat(this.source.substring(this.start, this.current)));
    }

    peekNext() {
        if (this.current + 1 >= this.source.length()) {
            return '\0';
        }
        return this.source.charAt(this.current + 1);
    }

    identifier() {
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }

        // See if the identifier is a reserved word.
        let text = this.source.substring(this.start, this.current);

        let type = keywords[text];
        if (type == null) {
            type = TokenType.IDENTIFIER;
        }
        this.addToken(type);
    }

    isAlpha(c) {
        return (c >= 'a' && c <= 'z')
                || (c >= 'A' && c <= 'Z')
                || c == '_';
    }

    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
}

const lineError = (line, message) => {
    report(line, "", message);
};

const tokenError = (token, message) => {
    if (token.type == TokenType.EOF) {
        report(token.line, " at end", message);
    } else {
        report(token.line, " at '" + token.lexeme + "'", message);
    }
};

const report = (line, where, message) => {
    console.log(`[line ${line}] Error ${where} : ${message}`);
    hadError = true;
};

const runtimeError = (error) => {
    console.log(`${error.message} \n[line ${error.token? error.token.line : 1} ]`);
    hadRuntimeError = true;
};

module.exports = {
    Scanner,
    Token,
    TokenType,
    tokenError,
    runtimeError
};