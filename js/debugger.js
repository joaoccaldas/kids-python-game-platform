// Friendly debugger for CodeQuest Python spells
class Debugger {
  constructor(outputElementId) {
    this.outputElement = document.getElementById(outputElementId);
    this.moodElement = document.getElementById('output-mood');
    this.errorPatterns = [
      { pattern: /SyntaxError/gi, message: 'Your spell has a tiny crack. Check for a missing colon, parenthesis, or quote.' },
      { pattern: /IndentationError/gi, message: 'Python reads spaces like footsteps. Make sure the lines inside loops are indented.' },
      { pattern: /NameError/gi, message: 'That name has not been summoned yet. Check spelling or create the variable first.' },
      { pattern: /TypeError/gi, message: 'Two spell ingredients do not fit together. Check numbers, text, and function inputs.' },
      { pattern: /AttributeError/gi, message: 'That spell move does not exist on this object. Check the function name.' },
      { pattern: /ValueError/gi, message: 'That value does not work here. Try a different number or word.' },
      { pattern: /ZeroDivisionError/gi, message: 'Division by zero opens a black hole. Pick another number.' }
    ];
  }

  parseError(errorText) {
    let friendlyMessage = `🧯 Nova found a bug-dragon:\n${errorText}\n\n`;
    const match = this.errorPatterns.find(errorPattern => errorPattern.pattern.test(errorText));
    friendlyMessage += `💡 ${match ? match.message : 'Check for typos, missing punctuation, or a line that needs indentation.'}`;
    return friendlyMessage;
  }

  displayError(errorText) {
    this.outputElement.textContent = this.parseError(errorText);
    this.outputElement.className = 'error-text';
    if (this.moodElement) this.moodElement.textContent = 'Needs repair';
  }

  displaySuccess(message) {
    this.outputElement.textContent = message;
    this.outputElement.className = 'success-text';
    if (this.moodElement) this.moodElement.textContent = 'Quest magic!';
  }

  displayInfo(message) {
    this.outputElement.textContent = message;
    this.outputElement.className = 'info-text';
    if (this.moodElement) this.moodElement.textContent = 'Thinking';
  }

  displayHint(message) {
    this.outputElement.textContent = `💡 Hint from Nova:\n${message}`;
    this.outputElement.className = 'info-text';
    if (this.moodElement) this.moodElement.textContent = 'Hint ready';
  }
}

window.Debugger = Debugger;
