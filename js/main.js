// CodeQuest: Python Realms main application
class KidsPythonPlatform {
  constructor() {
    this.levelSystem = new LevelSystem();
    this.canvasRenderer = new CanvasRenderer('game-canvas');
    this.debugger = new Debugger('output-content');

    this.codeEditor = document.getElementById('code-editor');
    this.runButton = document.getElementById('run-btn');
    this.resetButton = document.getElementById('reset-btn');
    this.hintButton = document.getElementById('hint-btn');
    this.saveCodeButton = document.getElementById('save-code-btn');
    this.prevButton = document.getElementById('prev-level');
    this.nextButton = document.getElementById('next-level');
    this.resetProgressButton = document.getElementById('reset-progress');
    this.toast = document.getElementById('toast');
    this.modal = document.getElementById('success-modal');
    this.modalNext = document.getElementById('modal-next');
    this.modalClose = document.getElementById('modal-close');

    this.init();
  }

  init() {
    this.runButton.addEventListener('click', () => this.runCode());
    this.resetButton.addEventListener('click', () => this.resetCode());
    this.hintButton.addEventListener('click', () => this.showHint());
    this.saveCodeButton.addEventListener('click', () => this.saveCurrentCode(true));
    this.prevButton.addEventListener('click', () => this.prevLevel());
    this.nextButton.addEventListener('click', () => this.nextLevel());
    this.resetProgressButton.addEventListener('click', () => this.resetProgress());
    this.modalNext.addEventListener('click', () => { this.closeModal(); this.nextLevel(); });
    this.modalClose.addEventListener('click', () => this.closeModal());

    this.renderWorldMap();
    this.loadLevel(this.levelSystem.getCurrentLevel().id);
    this.updateHUD();
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  loadLevel(levelId) {
    const level = this.levelSystem.getLevel(levelId);
    if (!level || !this.levelSystem.isLevelUnlocked(levelId)) {
      this.showToast('Complete the current quest to unlock that realm.');
      return;
    }

    this.levelSystem.goToLevel(levelId);
    this.codeEditor.value = this.levelSystem.getSavedCode(levelId) || level.code;
    this.canvasRenderer.setLevel(level);

    this.setText('mission-headline', level.headline);
    this.setText('mission-copy', level.story);
    this.setText('world-name', level.world);
    this.setText('level-title', level.title);
    this.setText('level-description', level.story);
    this.setText('stage-title', level.world);
    this.setText('quest-avatar', level.avatar);
    this.setText('difficulty-chip', level.difficulty);
    this.setText('concept-chip', level.concept);
    this.setText('reward-xp', `+${level.rewards.xp} XP`);
    this.setText('reward-coins', `+${level.rewards.coins} coins`);
    this.setText('reward-unlock', `Unlock: ${level.rewards.unlock}`);
    this.setText('current-level-label', `Level ${level.id} / ${this.levelSystem.levels.length}`);
    this.setText('mission-status', this.levelSystem.isLevelCompleted(level.id) ? 'Completed' : 'Ready');

    const list = document.getElementById('objectives-list');
    list.innerHTML = '';
    level.objectives.forEach(objective => {
      const li = document.createElement('li');
      li.textContent = objective;
      list.appendChild(li);
    });

    this.debugger.displayInfo('Run your spell to wake up the realm.');
    this.updateHUD();
    this.renderWorldMap();
  }

  runCode() {
    const level = this.levelSystem.getCurrentLevel();
    const code = this.codeEditor.value;
    this.saveCurrentCode(false);
    this.canvasRenderer.reset();
    this.simulateTurtleCode(code);
    this.debugger.displayInfo('Casting spell...');
    this.setText('mission-status', 'Casting');

    try {
      const builtinRead = filename => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[filename] === undefined) {
          throw new Error(`File not found: '${filename}'`);
        }
        return Sk.builtinFiles.files[filename];
      };

      Sk.pre = 'output-content';
      Sk.configure({
        output: text => {
          const output = document.getElementById('output-content');
          output.textContent += text;
        },
        read: builtinRead,
        inputfun: promptText => window.prompt(promptText || 'Enter input:'),
        inputfunTakesPrompt: true
      });

      document.getElementById('output-content').textContent = '';
      Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true))
        .then(() => this.handleRunSuccess(code, level))
        .catch(error => {
          this.setText('mission-status', 'Repair needed');
          this.debugger.displayError(String(error));
        });
    } catch (error) {
      this.setText('mission-status', 'Repair needed');
      this.debugger.displayError(String(error.message || error));
    }
  }

  simulateTurtleCode(code) {
    const colors = this.extractColors(code);
    let colorIndex = 0;
    const lines = code.split('\n');

    lines.forEach(rawLine => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) return;

      if (/\.color\s*\(/i.test(line) || /\.pencolor\s*\(/i.test(line)) {
        this.canvasRenderer.setColor(colors[colorIndex % Math.max(colors.length, 1)] || '#38bdf8');
        colorIndex += 1;
      }

      const widthMatch = line.match(/\.width\s*\(\s*([0-9.]+)/i);
      if (widthMatch) this.canvasRenderer.setLineWidth(Number(widthMatch[1]));

      const repeat = this.extractRepeatFromNearbyCode(code, line);
      const forward = line.match(/\.forward\s*\(\s*([^)]*)\)/i);
      const right = line.match(/\.right\s*\(\s*([0-9.]+)/i);
      const left = line.match(/\.left\s*\(\s*([0-9.]+)/i);
      const circle = line.match(/\.circle\s*\(\s*([0-9.]+)/i);
      const penup = /\.penup\s*\(/i.test(line);
      const pendown = /\.pendown\s*\(/i.test(line);

      const steps = Math.min(repeat, 80);
      for (let i = 0; i < steps; i++) {
        if (penup) this.canvasRenderer.penUp();
        if (pendown) this.canvasRenderer.penDown();
        if (forward) this.canvasRenderer.forward(this.resolveDistance(forward[1], i));
        if (circle) this.canvasRenderer.circle(Number(circle[1]));
        if (right) this.canvasRenderer.right(Number(right[1]));
        if (left) this.canvasRenderer.left(Number(left[1]));
      }
    });
  }

  extractRepeatFromNearbyCode(code, line) {
    if (!/\.forward|\.right|\.left|\.circle|\.color|\.pencolor|\.width|\.penup|\.pendown/i.test(line)) return 1;
    const ranges = [...code.matchAll(/range\s*\(\s*([0-9]+)/gi)].map(m => Number(m[1])).filter(Boolean);
    if (ranges.length === 0) return 1;
    return Math.max(1, Math.min(ranges[0], 80));
  }

  resolveDistance(expression, i) {
    const clean = String(expression).replace(/\s+/g, '');
    if (/^\d+(\.\d+)?$/.test(clean)) return Number(clean);
    const multiplier = clean.match(/i\*([0-9.]+)/i) || clean.match(/([0-9.]+)\*i/i);
    if (multiplier) return Math.max(2, i * Number(multiplier[1]));
    if (/^i$/i.test(clean)) return Math.max(2, i * 4);
    return 60;
  }

  extractColors(code) {
    const colors = [];
    const matches = code.matchAll(/["'](red|orange|yellow|green|blue|purple|pink|lime|darkgreen|black|white)["']/gi);
    for (const match of matches) colors.push(match[1].toLowerCase());
    return colors;
  }

  handleRunSuccess(code, level) {
    const validation = this.validateQuest(code, level);
    if (!validation.valid) {
      this.setText('mission-status', 'Almost');
      this.debugger.displayInfo(`🧪 Spell ran, but the quest is not complete yet.\n\n${validation.message}`);
      return;
    }

    const completion = this.levelSystem.completeCurrentLevel();
    this.canvasRenderer.celebrate(level);
    this.setText('mission-status', 'Complete');
    this.debugger.displaySuccess(`✨ Quest complete!\n${validation.message}\n\n${completion.alreadyCompleted ? 'You already collected this reward, but your spell still works.' : `Reward: +${level.rewards.xp} XP, +${level.rewards.coins} coins, ${level.rewards.unlock}`}`);

    this.updateHUD();
    this.renderWorldMap();

    if (!completion.alreadyCompleted) this.openModal(level);
    else this.showToast('Spell still works. Nice practice run.');
  }

  validateQuest(code, level) {
    const checks = {
      range4: /range\s*\(\s*4\s*\)/i.test(code),
      range5: /range\s*\(\s*5\s*\)/i.test(code),
      rangeMany: /range\s*\(\s*(3[0-9]|[4-9][0-9]|100)\s*\)/i.test(code),
      right90: /right\s*\(\s*90\s*\)/i.test(code),
      right144: /right\s*\(\s*144\s*\)/i.test(code),
      forward: /forward\s*\(/i.test(code),
      colorsList: /colors\s*=\s*\[/i.test(code) || /\[[^\]]*(red|blue|green|yellow|purple|orange)/i.test(code),
      colorCall: /\.color\s*\(/i.test(code) || /\.pencolor\s*\(/i.test(code),
      loop: /for\s+\w+\s+in\s+range\s*\(/i.test(code),
      growingForward: /forward\s*\([^)]*(\*|\+).*\)/i.test(code) || /forward\s*\([^)]*i[^)]*\)/i.test(code),
      turning: /\.right\s*\(/i.test(code) || /\.left\s*\(/i.test(code),
      defFunction: /def\s+\w+\s*\(/i.test(code),
      functionCall: this.hasFunctionCall(code),
      modulo: /%\s*\d+/i.test(code),
      variable: /\w+\s*=\s*[^=]/i.test(code),
      print: /print\s*\(/i.test(code),
      ifStatement: /if\s+.+:/i.test(code),
      elseStatement: /else\s*:/i.test(code),
      nestedLoop: /for\s+\w+\s+in\s+range[\s\S]*for\s+\w+\s+in\s+range/i.test(code),
      creativeLength: code.trim().split('\n').filter(Boolean).length >= 8
    };

    const missing = level.success.checks.filter(check => !checks[check]);
    if (missing.length > 0) {
      return { valid: false, message: `Nova's scanner still needs: ${missing.map(item => this.prettyCheck(item)).join(', ')}.` };
    }

    return { valid: true, message: 'The realm changed because your Python matched the mission.' };
  }

  hasFunctionCall(code) {
    const match = code.match(/def\s+(\w+)\s*\(/i);
    if (!match) return false;
    const name = match[1];
    const calls = code.match(new RegExp(`${name}\\s*\\(`, 'g')) || [];
    return calls.length >= 2;
  }

  prettyCheck(check) {
    const names = {
      range4: 'repeat 4 times', range5: 'repeat 5 times', rangeMany: 'many repeats', right90: 'turn 90 degrees',
      right144: 'turn 144 degrees', forward: 'move forward', colorsList: 'a colors list', colorCall: 'a color spell',
      loop: 'a for loop', growingForward: 'growing movement', turning: 'turning', defFunction: 'a function definition',
      functionCall: 'calling your function', modulo: 'color cycling with %', variable: 'a variable', print: 'a print message',
      ifStatement: 'an if statement', elseStatement: 'an else statement', nestedLoop: 'a loop inside a loop', creativeLength: 'a bigger creative spell'
    };
    return names[check] || check;
  }

  resetCode() {
    const level = this.levelSystem.getCurrentLevel();
    this.codeEditor.value = level.code;
    this.levelSystem.saveCode(level.id, level.code);
    this.canvasRenderer.reset();
    this.showToast('Spell reset to the quest starter.');
  }

  showHint() {
    this.debugger.displayHint(this.levelSystem.getCurrentLevel().hint);
  }

  saveCurrentCode(showToast = true) {
    const level = this.levelSystem.getCurrentLevel();
    this.levelSystem.saveCode(level.id, this.codeEditor.value);
    if (showToast) this.showToast('Spell saved in this browser.');
  }

  prevLevel() {
    const prev = this.levelSystem.getPrevLevel();
    if (prev) this.loadLevel(prev.id);
  }

  nextLevel() {
    const next = this.levelSystem.getNextLevel();
    if (next && this.levelSystem.isLevelUnlocked(next.id)) this.loadLevel(next.id);
    else if (!next) this.showToast('You completed every realm. Build your own next quest.');
    else this.showToast('Next quest is locked. Complete this one first.');
  }

  resetProgress() {
    if (!confirm('Reset XP, coins, unlocked quests, badges, and saved spells?')) return;
    this.levelSystem.resetProgress();
    this.renderWorldMap();
    this.loadLevel(1);
    this.updateHUD();
    this.showToast('Progress reset. Fresh adventure started.');
  }

  updateHUD() {
    const p = this.levelSystem.progress;
    this.setText('xp-total', p.xp);
    this.setText('coin-total', p.coins);
    this.setText('streak-total', p.streak);
    const pct = this.levelSystem.getCompletionPercentage();
    this.setText('completion-label', `${pct}% complete`);
    document.getElementById('progress-fill').style.width = `${pct}%`;

    const inventory = document.getElementById('inventory-list');
    inventory.innerHTML = '';
    if (p.inventory.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-inventory';
      empty.textContent = 'No badges yet. Complete your first quest.';
      inventory.appendChild(empty);
    } else {
      p.inventory.forEach(item => {
        const badge = document.createElement('div');
        badge.className = 'inventory-badge';
        badge.textContent = item;
        inventory.appendChild(badge);
      });
    }
  }

  renderWorldMap() {
    const map = document.getElementById('world-map');
    if (!map) return;
    map.innerHTML = '';
    this.levelSystem.levels.forEach(level => {
      const node = document.createElement('button');
      const completed = this.levelSystem.isLevelCompleted(level.id);
      const unlocked = this.levelSystem.isLevelUnlocked(level.id);
      const current = this.levelSystem.currentLevel === level.id;
      node.className = `map-node ${completed ? 'completed' : ''} ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}`;
      node.disabled = !unlocked;
      node.innerHTML = `<span>${completed ? level.rewards.badge : unlocked ? level.avatar : '🔒'}</span><strong>${level.id}</strong><small>${level.concept}</small>`;
      node.title = unlocked ? level.title : 'Locked';
      node.addEventListener('click', () => this.loadLevel(level.id));
      map.appendChild(node);
    });
  }

  openModal(level) {
    this.setText('modal-badge', level.rewards.badge);
    this.setText('modal-title', `${level.title} complete!`);
    this.setText('modal-copy', `You unlocked ${level.rewards.unlock}.`);
    this.setText('modal-xp', `+${level.rewards.xp} XP`);
    this.setText('modal-coins', `+${level.rewards.coins} coins`);
    this.modal.classList.add('show');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  closeModal() {
    this.modal.classList.remove('show');
    this.modal.setAttribute('aria-hidden', 'true');
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.remove('show'), 2400);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new KidsPythonPlatform();
});
