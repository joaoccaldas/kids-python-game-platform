// Extra gameplay polish layered on top of the core CodeQuest app.
// Keeps the main app small while improving the first retention moment.
(function polishCodeQuest() {
  const install = () => {
    if (!window.KidsPythonPlatform && !window.app?.constructor) return;
    const Platform = window.KidsPythonPlatform || window.app.constructor;
    if (!Platform || Platform.prototype.__codequestPolishInstalled) return;
    Platform.prototype.__codequestPolishInstalled = true;

    Platform.prototype.simulateTurtleCode = function simulateTurtleCode(code) {
      const colors = this.extractColors(code);
      const lines = code.replace(/\t/g, '    ').split('\n');
      const indentation = rawLine => (rawLine.match(/^\s*/) || [''])[0].length;

      const executeLine = (rawLine, loopIndex = 0) => {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) return;

        if (/\.color\s*\(/i.test(line) || /\.pencolor\s*\(/i.test(line)) {
          this.canvasRenderer.setColor(colors[loopIndex % Math.max(colors.length, 1)] || '#38bdf8');
        }

        const widthMatch = line.match(/\.width\s*\(\s*([0-9.]+)/i);
        if (widthMatch) this.canvasRenderer.setLineWidth(Number(widthMatch[1]));

        const forward = line.match(/\.forward\s*\(\s*([^)]*)\)/i);
        const right = line.match(/\.right\s*\(\s*([0-9.]+)/i);
        const left = line.match(/\.left\s*\(\s*([0-9.]+)/i);
        const circle = line.match(/\.circle\s*\(\s*([0-9.]+)/i);
        const penup = /\.penup\s*\(/i.test(line);
        const pendown = /\.pendown\s*\(/i.test(line);
        const gotoMatch = line.match(/\.(?:goto|setpos)\s*\(\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)/i);

        if (penup) this.canvasRenderer.penUp();
        if (pendown) this.canvasRenderer.penDown();
        if (forward) this.canvasRenderer.forward(this.resolveDistance(forward[1], loopIndex));
        if (circle) this.canvasRenderer.circle(Number(circle[1]));
        if (right) this.canvasRenderer.right(Number(right[1]));
        if (left) this.canvasRenderer.left(Number(left[1]));
        if (gotoMatch) this.canvasRenderer.setPos(Number(gotoMatch[1]), Number(gotoMatch[2]));
      };

      for (let index = 0; index < lines.length; index += 1) {
        const rawLine = lines[index];
        const trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const loopMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(\s*([0-9]+)\s*\)\s*:/i);
        if (!loopMatch) {
          executeLine(rawLine, 0);
          continue;
        }

        const repeats = Math.max(1, Math.min(Number(loopMatch[2]) || 1, 120));
        const baseIndent = indentation(rawLine);
        const block = [];
        let cursor = index + 1;

        while (cursor < lines.length) {
          const blockLine = lines[cursor];
          const blockTrimmed = blockLine.trim();
          if (!blockTrimmed) {
            cursor += 1;
            continue;
          }
          if (indentation(blockLine) <= baseIndent) break;
          block.push(blockLine);
          cursor += 1;
        }

        for (let repeatIndex = 0; repeatIndex < repeats; repeatIndex += 1) {
          block.forEach(blockLine => executeLine(blockLine, repeatIndex));
        }
        index = cursor - 1;
      }
    };

    Platform.prototype.lineLength = function lineLength(op) {
      const dx = (op.x2 || 0) - (op.x1 || 0);
      const dy = (op.y2 || 0) - (op.y1 || 0);
      return Math.sqrt(dx * dx + dy * dy);
    };

    Platform.prototype.validateSquareGateOperations = function validateSquareGateOperations() {
      const operations = this.canvasRenderer.getOperations ? this.canvasRenderer.getOperations() : [];
      const lines = operations.filter(op => op.type === 'line' && this.lineLength(op) >= 30);
      const squareTurns = operations.filter(op => op.type === 'turn' && Math.abs(Math.abs(op.angle) - 90) <= 1);

      if (lines.length < 4) {
        return { valid: false, message: 'The gate needs four visible sides. Put forward() inside the loop.' };
      }
      if (squareTurns.length < 4) {
        return { valid: false, message: 'The gate needs four right-angle turns. Add right(90) or left(90) inside the loop.' };
      }
      return { valid: true, message: 'The Square Gate opened because your turtle drew four sides and four right-angle turns.' };
    };

    const originalValidateQuest = Platform.prototype.validateQuest;
    Platform.prototype.validateQuest = function validateQuest(code, level) {
      const base = originalValidateQuest.call(this, code, level);
      if (!base.valid || level.id !== 1) return base;
      return this.validateSquareGateOperations();
    };

    const originalRenderWorldMap = Platform.prototype.renderWorldMap;
    Platform.prototype.renderWorldMap = function renderWorldMap() {
      originalRenderWorldMap.call(this);
      document.querySelectorAll('.map-node').forEach((node, index) => {
        node.dataset.levelId = String(index + 1);
      });
    };

    Platform.prototype.animateMapNode = function animateMapNode(levelId) {
      const node = document.querySelector(`.map-node[data-level-id="${levelId}"]`);
      if (!node) return;
      node.classList.remove('level-pulse');
      void node.offsetWidth;
      node.classList.add('level-pulse');
    };

    const originalHandleRunSuccess = Platform.prototype.handleRunSuccess;
    Platform.prototype.handleRunSuccess = function handleRunSuccess(code, level) {
      originalHandleRunSuccess.call(this, code, level);
      if (this.levelSystem.isLevelCompleted(level.id)) {
        this.animateMapNode(level.id);
      }
    };

    const originalOpenModal = Platform.prototype.openModal;
    Platform.prototype.openModal = function openModal(level) {
      originalOpenModal.call(this, level);
      if (level.id === 1) {
        this.setText('modal-copy', 'The Square Gate opens, the turtle crosses the path, and the next realm lights up.');
      }
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
