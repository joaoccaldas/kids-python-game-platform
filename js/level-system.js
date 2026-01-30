// Level progression system
class LevelSystem {
    constructor() {
        this.levels = [
            {
                id: 1,
                title: "Drawing a Square",
                description: "Draw a square using turtle graphics. Use forward() and right() functions.",
                difficulty: "Beginner",
                objectives: ["Draw 4 equal sides", "Make 4 right angles"],
                code: `import turtle
t = turtle.Turtle()

for i in range(4):
    t.forward(100)
    t.right(90)`,
                hint: "Use a for loop with range(4) to draw 4 sides of the square.",
                completed: false
            },
            {
                id: 2,
                title: "Colorful Shapes",
                description: "Draw a colorful shape by changing colors.",
                difficulty: "Beginner",
                objectives: ["Use multiple colors", "Draw a shape"],
                code: `import turtle
t = turtle.Turtle()
colors = ['red', 'blue', 'green', 'yellow']

for i in range(4):
    t.color(colors[i])
    t.forward(100)
    t.right(90)`,
                hint: "Try using the color() function with different colors.",
                completed: false
            },
            {
                id: 3,
                title: "Circle Patterns",
                description: "Create a pattern with circles.",
                difficulty: "Easy",
                objectives: ["Draw multiple circles", "Create a pattern"],
                code: `import turtle
t = turtle.Turtle()

for i in range(36):
    t.circle(50)
    t.left(10)`,
                hint: "Use the circle() function in a loop with rotation.",
                completed: false
            },
            {
                id: 4,
                title: "Star Drawing",
                description: "Draw a star shape.",
                difficulty: "Easy",
                objectives: ["Draw a 5-pointed star", "Use correct angles"],
                code: `import turtle
t = turtle.Turtle()

for i in range(5):
    t.forward(100)
    t.right(144)`,
                hint: "A star has 5 points, and the turning angle is 144 degrees.",
                completed: false
            },
            {
                id: 5,
                title: "Spiral Pattern",
                description: "Create a spiral pattern.",
                difficulty: "Medium",
                objectives: ["Create a spiral", "Increase size gradually"],
                code: `import turtle
t = turtle.Turtle()

for i in range(50):
    t.forward(i * 5)
    t.right(90)`,
                hint: "Increase the distance moved in each iteration.",
                completed: false
            },
            {
                id: 6,
                title: "Rainbow Spiral",
                description: "Create a colorful spiral.",
                difficulty: "Medium",
                objectives: ["Use multiple colors", "Create spiral effect"],
                code: `import turtle
t = turtle.Turtle()
colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']

for i in range(50):
    t.pencolor(colors[i % 6])
    t.width(i / 5 + 1)
    t.forward(i * 2)
    t.right(90)`,
                hint: "Change color and pen size in each iteration.",
                completed: false
            },
            {
                id: 7,
                title: "Animated Square",
                description: "Animate a moving square.",
                difficulty: "Hard",
                objectives: ["Create animation", "Rotate shape continuously"],
                code: `import time
import turtle
t = turtle.Turtle()
t.speed(0)

for _ in range(36):
    for i in range(4):
        t.forward(100)
        t.right(90)
    t.right(10)
time.sleep(2)`,
                hint: "Rotate the square in each iteration to create animation.",
                completed: false
            },
            {
                id: 8,
                title: "Interactive Turtle",
                description: "Make turtle respond to keys (conceptual).",
                difficulty: "Hard",
                objectives: ["Understand input concepts", "Plan interactive features"],
                code: `import turtle
t = turtle.Turtle()
t.shape("turtle")

def move_up():
    t.setheading(90)
    t.forward(50)

def move_down():
    t.setheading(270)
    t.forward(50)

def move_left():
    t.setheading(180)
    t.forward(50)

def move_right():
    t.setheading(0)
    t.forward(50)

# Note: Key bindings work in actual implementation
print("Use arrow keys to move the turtle")`,
                hint: "The turtle can be controlled with keyboard inputs.",
                completed: false
            },
            {
                id: 9,
                title: "Complex Patterns",
                description: "Combine different shapes to make patterns.",
                difficulty: "Expert",
                objectives: ["Create complex patterns", "Use functions"],
                code: `import turtle
t = turtle.Turtle()

def draw_flower():
    for _ in range(6):
        t.circle(30)
        t.left(60)

draw_flower()
t.penup()
t.goto(0, -100)
t.pendown()
t.goto(0, -150)`,
                hint: "Create functions to reuse code for repeated patterns.",
                completed: false
            },
            {
                id: 10,
                title: "Final Challenge",
                description: "Create your own masterpiece!",
                difficulty: "Expert",
                objectives: ["Combine all skills", "Be creative"],
                code: `import turtle
t = turtle.Turtle()
t.speed(0)

# Create your own amazing artwork here!
# Try combining everything you've learned

def my_art():
    for i in range(36):
        t.circle(i * 2)
        t.left(10)

my_art()`,
                hint: "Combine all the techniques you've learned to create something unique!",
                completed: false
            }
        ];
        
        this.currentLevel = 1;
        this.unlockedLevels = [1]; // Initially only level 1 is unlocked
        this.completedLevels = [];
        
        this.loadProgress();
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
        
        localStorage.setItem('levelSystemProgress', JSON.stringify(progressData));
    }
    
    loadProgress() {
        const savedData = localStorage.getItem('levelSystemProgress');
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

// Export for use in main application
window.LevelSystem = LevelSystem;