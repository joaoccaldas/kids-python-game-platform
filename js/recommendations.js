// Recommendations system
class Recommendations {
    constructor() {
        this.kiwixDB = [
            { id: 1, title: "Python Basics Guide", category: "beginner", url: "https://kiwix.example.com/python-basics", relevance: 0.9 },
            { id: 2, title: "Turtle Graphics Tutorial", category: "graphics", url: "https://kiwix.example.com/turtle-graphics", relevance: 0.85 },
            { id: 3, title: "Loops and Conditions", category: "logic", url: "https://kiwix.example.com/loops-conditions", relevance: 0.8 },
            { id: 4, title: "Functions in Python", category: "intermediate", url: "https://kiwix.example.com/functions", relevance: 0.75 },
            { id: 5, title: "Object-Oriented Programming", category: "advanced", url: "https://kiwix.example.com/oop", relevance: 0.7 },
            { id: 6, title: "Game Development with Pygame", category: "games", url: "https://kiwix.example.com/pygame", relevance: 0.9 },
            { id: 7, title: "Space Applications", category: "space", url: "https://kiwix.example.com/space-apps", relevance: 0.85 },
            { id: 8, title: "Hardware Control", category: "hardware", url: "https://kiwix.example.com/hardware-control", relevance: 0.8 }
        ];
        
        this.mcpDB = [
            { id: 1, title: "Python Fundamentals", category: "beginner", url: "https://mcp.example.com/python-fundamentals", difficulty: "easy", estimatedTime: "30 min" },
            { id: 2, title: "Variables and Data Types", category: "beginner", url: "https://mcp.example.com/variables-data-types", difficulty: "easy", estimatedTime: "20 min" },
            { id: 3, title: "Control Flow", category: "beginner", url: "https://mcp.example.com/control-flow", difficulty: "medium", estimatedTime: "40 min" },
            { id: 4, title: "Functions and Modules", category: "intermediate", url: "https://mcp.example.com/functions-modules", difficulty: "medium", estimatedTime: "45 min" },
            { id: 5, title: "Data Structures", category: "intermediate", url: "https://mcp.example.com/data-structures", difficulty: "hard", estimatedTime: "60 min" },
            { id: 6, title: "File Handling", category: "intermediate", url: "https://mcp.example.com/file-handling", difficulty: "hard", estimatedTime: "50 min" },
            { id: 7, title: "Error Handling", category: "advanced", url: "https://mcp.example.com/error-handling", difficulty: "hard", estimatedTime: "40 min" },
            { id: 8, title: "Object-Oriented Programming", category: "advanced", url: "https://mcp.example.com/oop", difficulty: "expert", estimatedTime: "75 min" }
        ];
        
        this.init();
    }
    
    init() {
        this.updateRecommendations();
    }
    
    getRecommendations(currentCourse, currentLevel, userProgress) {
        // Determine user's current skill level based on progress
        const completionRate = userProgress ? 
            Object.keys(userProgress.levels).filter(id => userProgress.levels[id].completed).length / 
            (currentCourse.levels ? currentCourse.levels.length : 10) : 0;
            
        let skillLevel = 'beginner';
        if (completionRate >= 0.7) skillLevel = 'intermediate';
        if (completionRate >= 0.9) skillLevel = 'advanced';
        
        // Get relevant materials from both databases
        let kiwixMatches = this.kiwixDB.filter(item => 
            item.category === currentCourse.id || 
            (skillLevel === 'beginner' && item.category === 'beginner') ||
            (currentLevel.difficulty.toLowerCase().includes(skillLevel))
        );
        
        let mcpMatches = this.mcpDB.filter(item => 
            item.category === currentCourse.id || 
            (skillLevel === 'beginner' && item.category === 'beginner') ||
            (item.difficulty === 'easy' && skillLevel === 'beginner') ||
            (item.difficulty === 'medium' && skillLevel === 'intermediate') ||
            (item.difficulty === 'hard' && skillLevel === 'advanced')
        );
        
        // Sort by relevance
        kiwixMatches.sort((a, b) => b.relevance - a.relevance);
        mcpMatches.sort((a, b) => {
            if (a.difficulty === 'easy' && b.difficulty !== 'easy') return -1;
            if (b.difficulty === 'easy' && a.difficulty !== 'easy') return 1;
            return 0;
        });
        
        // Combine and limit results
        const allRecommendations = [
            ...kiwixMatches.slice(0, 3),
            ...mcpMatches.slice(0, 3)
        ].slice(0, 5);
        
        return allRecommendations;
    }
    
    updateRecommendations() {
        // Get current course and level from the main app
        if (window.courseTracks && window.levelSystem && window.authSystem) {
            const courseId = document.getElementById('course-select').value;
            const currentCourse = window.courseTracks.getTrack(courseId);
            const currentLevel = window.levelSystem.getCurrentLevel();
            const userProgress = window.authSystem.getUserProgress(courseId);
            
            const recommendations = this.getRecommendations(currentCourse, currentLevel, userProgress);
            
            this.displayRecommendations(recommendations);
        }
    }
    
    displayRecommendations(recommendations) {
        const listElement = document.getElementById('recommended-list');
        
        if (recommendations.length === 0) {
            listElement.innerHTML = '<li>No recommendations available yet</li>';
            return;
        }
        
        listElement.innerHTML = '';
        
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${rec.title}</strong><br>
                <small>Category: ${rec.category} | ${rec.estimatedTime || ''}</small><br>
                <a href="${rec.url}" target="_blank" style="color: #3498db; text-decoration: none;">View Resource →</a>
            `;
            listElement.appendChild(li);
        });
    }
    
    // Method to be called when level changes
    onLevelChange(courseId, levelId) {
        if (window.courseTracks && window.authSystem) {
            const currentCourse = window.courseTracks.getTrack(courseId);
            const userProgress = window.authSystem.getUserProgress(courseId);
            
            // Find the level object
            const levels = window.courseTracks.getLevelsForCourse(courseId);
            const currentLevel = levels.find(lvl => lvl.id === levelId);
            
            if (currentLevel) {
                const recommendations = this.getRecommendations(currentCourse, currentLevel, userProgress);
                this.displayRecommendations(recommendations);
            }
        }
    }
}

// Initialize recommendations system
window.Recommendations = Recommendations;