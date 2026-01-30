// Enhanced main application logic
class KidsPythonPlatformEnhanced {
    constructor() {
        this.courseTracks = new CourseTracks();
        this.recommendations = new Recommendations();
        this.levelSystem = new LevelSystem();
        this.canvasRenderer = new CanvasRenderer('game-canvas');
        this.debugger = new Debugger('output-content');
        
        this.currentCourse = 'games'; // Default course
        this.currentLevel = 1;
        this.codeEditor = document.getElementById('code-editor');
        this.runButton = document.getElementById('run-btn');
        this.resetButton = document.getElementById('reset-btn');
        this.hintButton = document.getElementById('hint-btn');
        this.saveButton = document.getElementById('save-btn');
        this.outputContent = document.getElementById('output-content');
        this.gameCanvas = document.getElementById('game-canvas');
        this.ctx = this.gameCanvas.getContext('2d');
        this.currentCode = '';
        
        this.init();
    }
    
    init() {
        // Set up course selection
        this.setupCourseSelection();
        
        // Load current level
        this.loadLevel(this.levelSystem.getCurrentLevel().id);
        
        // Set up event listeners
        this.runButton.addEventListener('click', () => this.runCode());
        this.resetButton.addEventListener('click', () => this.resetCode());
        this.hintButton.addEventListener('click', () => this.showHint());
        this.saveButton.addEventListener('click', () => this.saveCode());
        
        document.getElementById('prev-level').addEventListener('click', () => this.prevLevel());
        document.getElementById('next-level').addEventListener('click', () => this.nextLevel());
        
        // Load saved progress
        this.loadProgress();
        
        // Update recommendations periodically
        setInterval(() => {
            this.recommendations.updateRecommendations();
        }, 30000); // Update every 30 seconds
    }
    
    setupCourseSelection() {
        const courseSelect = document.getElementById('course-select');
        courseSelect.value = this.currentCourse;
        
        courseSelect.addEventListener('change', (e) => {
            this.currentCourse = e.target.value;
            this.levelSystem.setTrack(this.currentCourse);
            this.loadLevel(1); // Reset to first level of new course
            this.updateDashboard();
        });
    }
    
    loadLevel(levelId) {
        const level = this.levelSystem.levels.find(lvl => lvl.id === levelId);
        if (level) {
            this.codeEditor.value = level.code;
            document.getElementById('level-title').textContent = level.title;
            document.getElementById('level-description').textContent = level.description;
            document.getElementById('current-level-display').textContent = `Level ${level.id}`;
            
            // Update progress indicators
            this.updateProgressIndicators();
            
            // Update recommendations
            this.recommendations.onLevelChange(this.currentCourse, levelId);
        }
    }
    
    updateProgressIndicators() {
        // Update individual level progress
        document.getElementById('current-level-display').textContent = `Level ${this.currentLevel}`;
        
        // Update overall progress
        const stats = this.levelSystem.getStats();
        document.getElementById('levels-completed').textContent = 
            `${stats.completedLevels}/${stats.totalLevels}`;
        document.getElementById('completion-percent').textContent = 
            `${Math.round(stats.completionPercentage)}%`;
        
        const progressPercent = this.levelSystem.getCompletionPercentage();
        document.getElementById('overall-progress-fill').style.width = `${progressPercent}%`;
        
        // Update XP
        if (window.authSystem) {
            const userProgress = window.authSystem.getUserProgress(this.currentCourse);
            const totalXP = userProgress ? userProgress.totalXP : 0;
            document.getElementById('total-xp').textContent = totalXP;
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
                    
                    // Award XP for completing level
                    const level = this.levelSystem.levels.find(lvl => lvl.id === this.currentLevel);
                    if (level && level.xp) {
                        if (window.authSystem) {
                            window.authSystem.updateUserProgress(this.currentCourse, this.currentLevel, true, level.xp);
                        }
                    }
                    
                    this.updateProgressIndicators();
                    
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
    
    saveCode() {
        // Save current code to level
        const levelIndex = this.levelSystem.levels.findIndex(lvl => lvl.id === this.currentLevel);
        if (levelIndex !== -1) {
            this.levelSystem.levels[levelIndex].code = this.codeEditor.value;
            alert("Code saved successfully!");
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
            alert("Congratulations! You've completed all levels in this track!");
        } else {
            alert("Next level is not unlocked yet. Complete the current level first!");
        }
    }
    
    updateProgressBar() {
        const progressPercent = this.levelSystem.getCompletionPercentage();
        document.getElementById('overall-progress-fill').style.width = `${progressPercent}%`;
        this.updateProgressIndicators();
    }
    
    loadProgress() {
        // Progress is handled by the LevelSystem
        this.levelSystem.loadProgress();
        
        // Set up initial course
        if (window.authSystem) {
            const userProgress = window.authSystem.getUserProgress(this.currentCourse);
            if (userProgress && userProgress.levels) {
                // Restore user's progress for the selected course
                this.levelSystem.restoreProgressFromUser(userProgress.levels);
            }
        }
        
        this.loadLevel(this.levelSystem.currentLevel);
        this.updateProgressIndicators();
    }
    
    saveProgress() {
        this.levelSystem.saveProgress();
    }
    
    updateDashboard() {
        this.updateProgressIndicators();
        this.recommendations.updateRecommendations();
    }
}

// Extended LevelSystem to support multiple courses
class LevelSystem {
    constructor() {
        this.tracks = window.courseTracks ? window.courseTracks.getAllTracks() : {};
        this.currentTrack = 'games';
        this.levels = [...this.tracks[this.currentTrack].levels]; // Default to games track
        
        this.currentLevel = 1;
        this.unlockedLevels = [1]; // Initially only level 1 is unlocked
        this.completedLevels = [];
        
        this.loadProgress();
    }
    
    setTrack(trackId) {
        this.currentTrack = trackId;
        this.levels = [...this.tracks[trackId].levels];
        
        // Reload progress for the new track
        if (window.authSystem) {
            const userProgress = window.authSystem.getUserProgress(trackId);
            if (userProgress && userProgress.levels) {
                this.restoreProgressFromUser(userProgress.levels);
            } else {
                // Reset to default for new track
                this.currentLevel = 1;
                this.unlockedLevels = [1];
                this.completedLevels = [];
            }
        }
        
        return true;
    }
    
    restoreProgressFromUser(userLevels) {
        this.completedLevels = [];
        this.unlockedLevels = [1]; // Always unlock level 1
        
        // Process user's level progress
        for (const [levelId, levelData] of Object.entries(userLevels)) {
            const id = parseInt(levelId);
            if (levelData.completed) {
                this.completedLevels.push(id);
                
                // Unlock next level if this one was completed
                if (id < this.levels.length) {
                    const nextLevelId = id + 1;
                    if (!this.unlockedLevels.includes(nextLevelId)) {
                        this.unlockedLevels.push(nextLevelId);
                    }
                }
            }
        }
        
        // Set current level to the furthest unlocked level
        this.currentLevel = Math.max(...this.unlockedLevels);
    }
    
    getCurrentLevel() {
        return this.levels.find(level => level.id === this.currentLevel);
    }
    
    getNextLevel() {
        if (this.currentLevel < this.levels.length) {
            return this.levels.find(level => level.id === this.currentLevel + 1);
        }
        return null;
    }
    
    getPrevLevel() {
        if (this.currentLevel > 1) {
            return this.levels.find(level => level.id === this.currentLevel - 1);
        }
        return null;
    }
    
    goToLevel(levelId) {
        if (this.isLevelUnlocked(levelId)) {
            this.currentLevel = levelId;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    isLevelUnlocked(levelId) {
        return this.unlockedLevels.includes(levelId);
    }
    
    isLevelCompleted(levelId) {
        return this.completedLevels.includes(levelId);
    }
    
    completeCurrentLevel() {
        if (!this.isLevelCompleted(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
            
            // Unlock next level if it exists
            if (this.currentLevel < this.levels.length) {
                const nextLevelId = this.currentLevel + 1;
                if (!this.isLevelUnlocked(nextLevelId)) {
                    this.unlockedLevels.push(nextLevelId);
                }
            }
            
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    getCompletionPercentage() {
        return (this.completedLevels.length / this.levels.length) * 100;
    }
    
    getStats() {
        return {
            totalLevels: this.levels.length,
            completedLevels: this.completedLevels.length,
            unlockedLevels: this.unlockedLevels.length,
            completionPercentage: this.getCompletionPercentage(),
            currentLevel: this.currentLevel
        };
    }
    
    saveProgress() {
        const progressData = {
            currentLevel: this.currentLevel,
            unlockedLevels: this.unlockedLevels,
            completedLevels: this.completedLevels
        };
        
        // Save progress for current track
        localStorage.setItem(`levelSystemProgress_${this.currentTrack}`, JSON.stringify(progressData));
    }
    
    loadProgress() {
        const savedData = localStorage.getItem(`levelSystemProgress_${this.currentTrack}`);
        if (savedData) {
            try {
                const progress = JSON.parse(savedData);
                this.currentLevel = progress.currentLevel || 1;
                this.unlockedLevels = progress.unlockedLevels || [1];
                this.completedLevels = progress.completedLevels || [];
            } catch (e) {
                console.error('Error loading progress:', e);
                // Reset to default if there's an error
                this.currentLevel = 1;
                this.unlockedLevels = [1];
                this.completedLevels = [];
            }
        } else {
            // Default starting state
            this.currentLevel = 1;
            this.unlockedLevels = [1];
            this.completedLevels = [];
        }
    }
    
    resetProgress() {
        this.currentLevel = 1;
        this.unlockedLevels = [1];
        this.completedLevels = [];
        this.saveProgress();
    }
}

// Initialize the enhanced app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.authSystem) {
        // Only initialize after auth system is ready
        setTimeout(() => {
            window.app = new KidsPythonPlatformEnhanced();
        }, 100);
    } else {
        // Fallback initialization
        window.app = new KidsPythonPlatformEnhanced();
    }
});