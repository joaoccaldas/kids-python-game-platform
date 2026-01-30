// Course tracks system
class CourseTracks {
    constructor() {
        this.tracks = {
            games: {
                id: 'games',
                title: '🎮 Games Track',
                description: 'Learn Python by creating fun games!',
                color: '#3498db',
                levels: []
            },
            space: {
                id: 'space',
                title: '🚀 Space Apps',
                description: 'Build applications for space exploration!',
                color: '#9b59b6',
                levels: []
            },
            hardware: {
                id: 'hardware',
                title: '🔧 Hardware Control',
                description: 'Control hardware devices with Python!',
                color: '#e67e22',
                levels: []
            },
            web: {
                id: 'web',
                title: '🌐 Web Development',
                description: 'Create websites and web applications!',
                color: '#2ecc71',
                levels: []
            }
        };
        
        // Initialize levels for each track
        this.initializeTracks();
        this.setupEventListeners();
    }
    
    initializeTracks() {
        // Games track - based on original levels
        this.tracks.games.levels = [
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
                completed: false,
                xp: 10
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
                completed: false,
                xp: 15
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
                completed: false,
                xp: 20
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
                completed: false,
                xp: 25
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
                completed: false,
                xp: 30
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
                completed: false,
                xp: 35
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
                completed: false,
                xp: 40
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
                completed: false,
                xp: 45
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
                completed: false,
                xp: 50
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
                completed: false,
                xp: 60
            }
        ];
        
        // Space apps track
        this.tracks.space.levels = [
            {
                id: 1,
                title: "Rocket Trajectory",
                description: "Calculate rocket trajectory using physics formulas.",
                difficulty: "Beginner",
                objectives: ["Use variables for speed", "Calculate distance"],
                code: `import turtle
t = turtle.Turtle()
t.speed(0)

# Rocket trajectory simulation
altitude = 0
velocity = 10

for step in range(50):
    altitude += velocity
    velocity -= 0.5  # Gravity effect
    
    t.goto(step * 10, altitude)
    
    if altitude <= 0:
        print(f"Rocket landed after {step} steps")
        break`,
                hint: "Track position and velocity separately.",
                completed: false,
                xp: 10
            },
            {
                id: 2,
                title: "Orbit Simulation",
                description: "Simulate planetary orbits around a star.",
                difficulty: "Easy",
                objectives: ["Use circular motion", "Apply trigonometry"],
                code: `import turtle
import math

t = turtle.Turtle()
t.speed(0)

star_x, star_y = 0, 0

# Planet orbit
for angle in range(0, 360, 5):
    rad = math.radians(angle)
    planet_x = star_x + 100 * math.cos(rad)
    planet_y = star_y + 100 * math.sin(rad)
    
    t.goto(planet_x, planet_y)`,
                hint: "Use cosine and sine functions for circular motion.",
                completed: false,
                xp: 15
            },
            // Additional space levels would go here...
        ];
        
        // Hardware control track
        this.tracks.hardware.levels = [
            {
                id: 1,
                title: "LED Blinker",
                description: "Control an LED using GPIO simulation.",
                difficulty: "Beginner",
                objectives: ["Use digital outputs", "Create timing loops"],
                code: `import time

# Simulated GPIO control
def digitalWrite(pin, value):
    print(f"Setting pin {pin} to {'HIGH' if value else 'LOW'}")

def delay(ms):
    time.sleep(ms/1000.0)

# Blink an LED
for i in range(10):
    digitalWrite(13, True)  # Turn on LED
    delay(500)              # Wait 500ms
    digitalWrite(13, False) # Turn off LED
    delay(500)              # Wait 500ms`,
                hint: "Use loops for repetitive actions.",
                completed: false,
                xp: 10
            },
            // Additional hardware levels would go here...
        ];
        
        // Web development track
        this.tracks.web.levels = [
            {
                id: 1,
                title: "Simple Server",
                description: "Create a basic HTTP server.",
                difficulty: "Beginner",
                objectives: ["Import http module", "Handle requests"],
                code: `# This is a conceptual example for web dev track
# In a real environment, you'd use Flask or similar

def simple_server():
    print("Starting simple server...")
    print("Server listening on port 8000")
    print("Visit http://localhost:8000")

simple_server()`,
                hint: "Web servers listen for requests and send responses.",
                completed: false,
                xp: 10
            },
            // Additional web levels would go here...
        ];
    }
    
    setupEventListeners() {
        document.getElementById('course-select').addEventListener('change', (e) => {
            this.switchCourse(e.target.value);
        });
    }
    
    switchCourse(courseId) {
        // Update level system with new track
        if (window.levelSystem) {
            window.levelSystem.setTrack(courseId);
        }
        // Update UI to reflect new course
        this.updateCourseDisplay(courseId);
    }
    
    getTrack(courseId) {
        return this.tracks[courseId];
    }
    
    getAllTracks() {
        return this.tracks;
    }
    
    updateCourseDisplay(courseId) {
        const track = this.getTrack(courseId);
        if (track) {
            document.querySelector('.course-selector select').style.backgroundColor = track.color;
        }
    }
    
    getLevelsForCourse(courseId) {
        const track = this.getTrack(courseId);
        return track ? track.levels : [];
    }
}

// Initialize course tracks system
window.CourseTracks = CourseTracks;