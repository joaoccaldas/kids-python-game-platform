// Main application logic
class KidsPythonPlatform {
    constructor() {
        this.levelSystem = new LevelSystem();
        this.canvasRenderer = new CanvasRenderer('game-canvas');
        this.debugger = new Debugger('output-content');
        
        this.currentLevel = 1;
        this.codeEditor = document.getElementById('code-editor');
        this.runButton = document.getElementById('run-btn');
        this.resetButton = document.getElementById('reset-btn');
        this.hintButton = document.getElementById('hint-btn');
        this.outputContent = document.getElementById('output-content');
        this.gameCanvas = document.getElementById('game-canvas');
        this.ctx = this.gameCanvas.getContext('2d');
        this.currentCode = '';
        
        this.init();
    }
    
    init() {
        // Load current level
        this.loadLevel(this.levelSystem.getCurrentLevel().id);
        
        // Set up event listeners
        this.runButton.addEventListener('click', () => this.runCode());
        this.resetButton.addEventListener('click', () => this.resetCode());
        this.hintButton.addEventListener('click', () => this.showHint());
        
        document.getElementById('prev-level').addEventListener('click', () => this.prevLevel());
        document.getElementById('next-level').addEventListener('click', () => this.nextLevel());
        
        // Load saved progress
        this.loadProgress();
    }
    
    loadLevel(levelId) {
        const level = this.levelSystem.levels.find(lvl => lvl.id === levelId);
        if (level) {
            this.codeEditor.value = level.code;
            document.getElementById('level-title').textContent = level.title;
            document.getElementById('level-description').textContent = level.description;
            document.getElementById('current-level').textContent = `${level.id}/${this.levelSystem.levels.length}`;
            this.currentLevel = level.id;
            
            // Update progress bar
            const progressPercent = this.levelSystem.getCompletionPercentage();
            document.getElementById('progress-fill').style.width = `${progressPercent}%`;
        }
    }
    
    runCode() {
        // Clear previous output
        this.outputContent.textContent = '';
        this.canvasRenderer.reset(); // Use the canvas renderer to reset the canvas
        
        // Get the code from editor
        const code = this.codeEditor.value;
        
        try {
            // Set up Skulpt output handling
            var builtinRead = function (filename) {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[filename] === undefined)
                    throw "File not found: '" + filename + "'";
                return Sk.builtinFiles.files[filename];
            };
            
            // Set up output and error handling
            Sk.pre = "output-content";
            Sk.configure({
                output: (text) => {
                    this.outputContent.textContent += text;
                },
                read: builtinRead,
                inputfun: () => {
                    return window.prompt("Enter input:");
                },
                inputfunTakesPrompt: true
            });
            
            // Run the Python code
            var prog = Sk.misceval.asyncToPromise(() => 
                Sk.importMainWithBody("<stdin>", false, code, true)
            );
            
            // Handle successful execution
            prog.then(() => {
                console.log("Python program executed successfully");
                // Mark level as completed if not already marked
                if (!this.levelSystem.isLevelCompleted(this.currentLevel)) {
                    this.levelSystem.completeCurrentLevel();
                    this.updateProgressBar();
                    
                    // Show completion message
                    setTimeout(() => {
                        if (confirm("Great job! You completed this level! Move to the next one?")) {
                            this.nextLevel();
                        }
                    }, 1000);
                }
            }).catch((err) => {
                this.debugger.displayError(err.toString());
            });
            
        } catch (error) {
            this.debugger.displayError("Execution error: " + error.message);
        }
    }
    
    resetCode() {
        if (confirm("Are you sure you want to reset the code?")) {
            this.loadLevel(this.currentLevel);
        }
    }
    
    showHint() {
        const level = this.levelSystem.levels.find(lvl => lvl.id === this.currentLevel);
        if (level) {
            alert(`Hint: ${level.hint}`);
        }
    }
    
    prevLevel() {
        const prevLevel = this.levelSystem.getPrevLevel();
        if (prevLevel) {
            this.loadLevel(prevLevel.id);
        }
    }
    
    nextLevel() {
        const nextLevel = this.levelSystem.getNextLevel();
        if (nextLevel && this.levelSystem.isLevelUnlocked(nextLevel.id)) {
            this.loadLevel(nextLevel.id);
        } else if (!nextLevel) {
            alert("Congratulations! You've completed all levels!");
        } else {
            alert("Next level is not unlocked yet. Complete the current level first!");
        }
    }
    
    updateProgressBar() {
        const progressPercent = this.levelSystem.getCompletionPercentage();
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;
    }
    
    loadProgress() {
        // Progress is handled by the LevelSystem
        this.levelSystem.loadProgress();
        this.loadLevel(this.levelSystem.currentLevel);
    }
    
    saveProgress() {
        this.levelSystem.saveProgress();
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KidsPythonPlatform();
});