// CodeQuest canvas renderer: world scenes, turtle traces, particles, and success animations
class CanvasRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.operations = [];
    this.particles = [];
    this.level = null;
    this.frame = 0;
    this.turtle = this.defaultTurtle();
    this.animationId = null;
    this.startLoop();
  }

  defaultTurtle() {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      angle: 0,
      penDown: true,
      color: '#111827',
      width: 4
    };
  }

  setLevel(level) {
    this.level = level;
    this.reset();
  }

  reset() {
    this.operations = [];
    this.particles = [];
    this.turtle = this.defaultTurtle();
    this.renderBase();
  }

  startLoop() {
    const tick = () => {
      this.frame += 1;
      this.renderBase();
      this.drawOperations();
      this.drawTurtle();
      this.updateParticles();
      this.animationId = requestAnimationFrame(tick);
    };
    tick();
  }

  renderBase() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scene = this.level?.scene || 'forest';

    const palettes = {
      forest: ['#7dd3fc', '#d9f99d', '#22c55e'],
      crystal: ['#312e81', '#7c3aed', '#a7f3d0'],
      portal: ['#111827', '#4338ca', '#ec4899'],
      star: ['#020617', '#1d4ed8', '#facc15'],
      castle: ['#c7d2fe', '#e0e7ff', '#64748b'],
      jungle: ['#064e3b', '#16a34a', '#84cc16'],
      robot: ['#0f172a', '#334155', '#06b6d4'],
      gate: ['#581c87', '#7c3aed', '#fbbf24'],
      arena: ['#1f2937', '#dc2626', '#f97316'],
      creator: ['#0f172a', '#2563eb', '#22d3ee']
    };
    const [top, mid, ground] = palettes[scene] || palettes.forest;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, top);
    sky.addColorStop(0.58, mid);
    sky.addColorStop(1, ground);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    this.drawStars(scene);
    this.drawParallaxHills(scene);
    this.drawQuestObject(scene);
  }

  drawStars(scene) {
    const ctx = this.ctx;
    const nightScenes = ['portal', 'star', 'robot', 'arena', 'creator'];
    if (!nightScenes.includes(scene)) return;
    ctx.save();
    for (let i = 0; i < 70; i++) {
      const x = (i * 97 + 23) % this.canvas.width;
      const y = (i * 53 + 19) % 230;
      const pulse = 0.55 + Math.sin((this.frame + i * 11) / 25) * 0.35;
      ctx.fillStyle = `rgba(255,255,255,${pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, i % 5 === 0 ? 2 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawParallaxHills(scene) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const colors = {
      forest: ['#15803d', '#166534'],
      crystal: ['#5b21b6', '#2dd4bf'],
      portal: ['#312e81', '#701a75'],
      star: ['#1e3a8a', '#713f12'],
      castle: ['#94a3b8', '#475569'],
      jungle: ['#166534', '#365314'],
      robot: ['#475569', '#0891b2'],
      gate: ['#6b21a8', '#a16207'],
      arena: ['#7f1d1d', '#431407'],
      creator: ['#1e40af', '#0e7490']
    }[scene] || ['#15803d', '#166534'];

    ctx.save();
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    for (let x = 0; x <= w; x += 40) {
      ctx.lineTo(x, h * 0.70 + Math.sin(x / 60 + this.frame / 90) * 18);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.moveTo(0, h * 0.82);
    for (let x = 0; x <= w; x += 30) {
      ctx.lineTo(x, h * 0.80 + Math.cos(x / 55 + this.frame / 110) * 14);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawQuestObject(scene) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.55)';
    ctx.shadowBlur = 18;
    ctx.textAlign = 'center';
    ctx.font = '64px serif';

    const icons = {
      forest: '🚪',
      crystal: '🌉',
      portal: '🌀',
      star: '⭐',
      castle: '🏰',
      jungle: '🌿',
      robot: '🤖',
      gate: '🗝️',
      arena: '🎬',
      creator: '🚀'
    };
    const bob = Math.sin(this.frame / 28) * 5;
    ctx.fillText(icons[scene] || '🚪', w * 0.78, h * 0.43 + bob);
    ctx.restore();
  }

  forward(distance) {
    const start = { x: this.turtle.x, y: this.turtle.y };
    this.turtle.x += Math.cos(this.radians()) * distance;
    this.turtle.y -= Math.sin(this.radians()) * distance;
    if (this.turtle.penDown) {
      this.operations.push({
        type: 'line',
        x1: start.x,
        y1: start.y,
        x2: this.turtle.x,
        y2: this.turtle.y,
        color: this.turtle.color,
        width: this.turtle.width
      });
    }
  }

  right(angle) { this.turtle.angle += angle; }
  left(angle) { this.turtle.angle -= angle; }
  penUp() { this.turtle.penDown = false; }
  penDown() { this.turtle.penDown = true; }
  setColor(color) { this.turtle.color = this.normalizeColor(color); }
  setLineWidth(width) { this.turtle.width = Math.max(1, Number(width) || 2); }

  goTo(x, y) {
    this.turtle.x = Number(x);
    this.turtle.y = Number(y);
  }

  setPos(x, y) {
    this.turtle.x = this.canvas.width / 2 + Number(x);
    this.turtle.y = this.canvas.height / 2 - Number(y);
  }

  circle(radius) {
    this.operations.push({
      type: 'circle',
      x: this.turtle.x,
      y: this.turtle.y,
      r: Math.abs(Number(radius) || 30),
      color: this.turtle.color,
      width: this.turtle.width
    });
  }

  radians() { return this.turtle.angle * Math.PI / 180; }

  normalizeColor(color) {
    const map = {
      red: '#ef4444', orange: '#f97316', yellow: '#facc15', green: '#22c55e',
      blue: '#3b82f6', purple: '#a855f7', pink: '#ec4899', black: '#111827',
      white: '#ffffff', lime: '#84cc16', darkgreen: '#166534'
    };
    return map[String(color).toLowerCase()] || color || '#111827';
  }

  drawOperations() {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.operations.forEach(op => {
      ctx.strokeStyle = op.color;
      ctx.lineWidth = op.width;
      ctx.shadowColor = op.color;
      ctx.shadowBlur = 8;
      if (op.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(op.x1, op.y1);
        ctx.lineTo(op.x2, op.y2);
        ctx.stroke();
      } else if (op.type === 'circle') {
        ctx.beginPath();
        ctx.arc(op.x, op.y, op.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  drawTurtle() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.turtle.x, this.turtle.y);
    ctx.rotate(this.radians());
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8;
    ctx.fillText(this.level?.avatar || '🐢', 0, 0);
    ctx.restore();
  }

  celebrate(level) {
    const colors = ['#facc15', '#22c55e', '#38bdf8', '#fb7185', '#a78bfa', '#f97316'];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: this.canvas.width * 0.78,
        y: this.canvas.height * 0.40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 50 + Math.random() * 50,
        color: colors[i % colors.length],
        size: 3 + Math.random() * 5
      });
    }
  }

  updateParticles() {
    const ctx = this.ctx;
    ctx.save();
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.life -= 1;
      ctx.globalAlpha = Math.max(0, p.life / 80);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
}

window.CanvasRenderer = CanvasRenderer;
