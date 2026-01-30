// Debugger for Python code errors
class Debugger {
    constructor(outputElementId) {
        this.outputElement = document.getElementById(outputElementId);
        this.errorPatterns = [
            { pattern: /SyntaxError/gi, message: "Check your syntax - did you forget a colon, parenthesis, or indent properly?" },
            { pattern: /IndentationError/gi, message: "Check your indentation - Python cares about spaces at the beginning of lines!" },
            { pattern: /NameError/gi, message: "You're trying to use a variable or function that hasn't been defined yet." },
            { pattern: /TypeError/gi, message: "You're trying to perform an operation on incompatible types (like adding a number to text)." },
            { pattern: /AttributeError/gi, message: "You're trying to access a property or method that doesn't exist on this object." },
            { pattern: /ValueError/gi, message: "The value you provided isn't valid for this operation." },
            { pattern: /ZeroDivisionError/gi, message: "You can't divide by zero - math doesn't allow it!" }
        ];
    }
    
    parseError(errorText) {
        let friendlyMessage = "Something went wrong with your code:\n" + errorText + "\n\n";
        
        // Look for known error patterns
        for (const errorPattern of this.errorPatterns) {
            if (errorPattern.pattern.test(errorText)) {
                friendlyMessage += "💡 Hint: " + errorPattern.message;
                break;
            }
        }
        
        if (friendlyMessage === "Something went wrong with your code:\n" + errorText + "\n\n") {
            friendlyMessage += "💡 General Hint: Check for typos, missing punctuation, or incorrect function names.";
        }
        
        return friendlyMessage;
    }
    
    displayError(errorText) {
        this.outputElement.textContent = this.parseError(errorText);
        this.outputElement.style.color = "#e74c3c";
    }
    
    displaySuccess(message) {
        this.outputElement.textContent = message;
        this.outputElement.style.color = "#27ae60";
    }
    
    displayInfo(message) {
        this.outputElement.textContent = message;
        this.outputElement.style.color = "#3498db";
    }
}

// Export for use in main application
window.Debugger = Debugger;