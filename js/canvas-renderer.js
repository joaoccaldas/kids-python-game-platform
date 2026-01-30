// Canvas renderer for Python turtle graphics simulation
class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.reset();
    }
    
    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset turtle state
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.angle = 0; // facing right initially
        this.isPenDown = true;
        this.color = '#000000';
        this.lineWidth = 2;
    }
    
    // Move the turtle forward by a certain distance
    forward(distance) {
        const startX = this.x;
        const startY = this.y;
        
        // Calculate new position
        this.x += Math.cos(this.radians()) * distance;
        this.y -= Math.sin(this.radians()) * distance; // Subtract because y increases downward
        
        // Draw line if pen is down
        if (this.isPenDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(this.x, this.y);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.stroke();
        }
    }
    
    // Turn the turtle right by specified angle
    right(angle) {
        this.angle += angle;
    }
    
    // Turn the turtle left by specified angle
    left(angle) {
        this.angle -= angle;
    }
    
    // Move to specific coordinates without drawing
    goTo(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // Pen up - stop drawing
    penUp() {
        this.isPenDown = false;
    }
    
    // Pen down - start drawing
    penDown() {
        this.isPenDown = true;
    }
    
    // Set pen color
    setColor(color) {
        this.color = color;
    }
    
    // Set line width
    setLineWidth(width) {
        this.lineWidth = width;
    }
    
    // Get current angle in radians
    radians() {
        return this.angle * Math.PI / 180;
    }
    
    // Draw a circle
    circle(radius) {
        if (this.isPenDown) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.stroke();
        }
    }
    
    // Set turtle position relative to center
    setPos(x, y) {
        this.x = this.canvas.width / 2 + x;
        this.y = this.canvas.height / 2 - y; // Subtract y because canvas y increases downward
    }
}

// Export for use in main application
window.CanvasRenderer = CanvasRenderer;