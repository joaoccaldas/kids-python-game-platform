// CodeQuest progression and quest data
class LevelSystem {
  constructor() {
    this.storageKey = 'codequest-python-realms-progress-v1';
    this.levels = this.createLevels();
    this.defaultProgress = {
      currentLevel: 1,
      xp: 0,
      coins: 0,
      streak: 0,
      unlockedLevels: [1],
      completedLevels: [],
      inventory: [],
      savedCode: {},
      lastCompletedAt: null
    };
    this.progress = { ...this.defaultProgress };
    this.loadProgress();
  }

  createLevels() {
    return [
      {
        id: 1,
        world: 'Turtle Valley',
        avatar: '🐢',
        title: 'Open the Square Gate',
        headline: 'The village gate is sealed.',
        story: 'A square gate blocks the turtle village. Use a loop to build four glowing sides and open the path.',
        concept: 'Loops',
        difficulty: 'Beginner',
        objectives: ['Use a for loop', 'Repeat 4 times', 'Turn 90 degrees'],
        code: `import turtle

t = turtle.Turtle()

for i in range(4):
    t.forward(100)
    t.right(90)

print("Gate spell complete!")`,
        hint: 'A square has 4 sides. Use range(4), then turn right(90) after each side.',
        success: { checks: ['range4', 'right90', 'forward'] },
        rewards: { xp: 20, coins: 12, unlock: 'Turtle Shell Badge', badge: '🐢' },
        scene: 'forest'
      },
      {
        id: 2,
        world: 'Color Caves',
        avatar: '🌈',
        title: 'Build the Rainbow Bridge',
        headline: 'The river is too wide.',
        story: 'The bridge only appears when Python paints it with several colors. Use a list and cycle through it.',
        concept: 'Lists + Colors',
        difficulty: 'Beginner',
        objectives: ['Create a colors list', 'Use at least 4 colors', 'Use a loop to draw'],
        code: `import turtle

t = turtle.Turtle()
colors = ["red", "orange", "yellow", "green", "blue", "purple"]

for i in range(6):
    t.color(colors[i])
    t.forward(70)
    t.right(60)

print("Rainbow bridge built!")`,
        hint: 'Use a list like colors = ["red", "blue", "green"]. Then pick colors inside a loop.',
        success: { checks: ['colorsList', 'colorCall', 'loop'] },
        rewards: { xp: 30, coins: 18, unlock: 'Rainbow Trail', badge: '🌈' },
        scene: 'crystal'
      },
      {
        id: 3,
        world: 'Spiral Portal',
        avatar: '🌀',
        title: 'Activate the Spiral Portal',
        headline: 'The next realm is asleep.',
        story: 'A portal wakes only when each step grows bigger than the last. Use a variable inside a loop.',
        concept: 'Variables',
        difficulty: 'Easy',
        objectives: ['Use a loop with many repeats', 'Make movement grow', 'Create a spiral pattern'],
        code: `import turtle

t = turtle.Turtle()

for i in range(40):
    t.forward(i * 4)
    t.right(91)

print("Portal activated!")`,
        hint: 'Use i inside the loop. When forward uses i * 4, the line grows each time.',
        success: { checks: ['rangeMany', 'growingForward', 'turning'] },
        rewards: { xp: 40, coins: 24, unlock: 'Portal Spark', badge: '🌀' },
        scene: 'portal'
      },
      {
        id: 4,
        world: 'Star Forge',
        avatar: '⭐',
        title: 'Forge a Star Key',
        headline: 'A star-shaped key is missing.',
        story: 'The ancient door needs a five-point star key. Use the secret 144-degree turn.',
        concept: 'Angles',
        difficulty: 'Easy',
        objectives: ['Repeat 5 times', 'Use right(144)', 'Draw a star'],
        code: `import turtle

t = turtle.Turtle()

for i in range(5):
    t.forward(130)
    t.right(144)

print("Star key forged!")`,
        hint: 'A five-point star uses 5 repeats and a 144 degree turn.',
        success: { checks: ['range5', 'right144', 'forward'] },
        rewards: { xp: 45, coins: 26, unlock: 'Star Key', badge: '⭐' },
        scene: 'star'
      },
      {
        id: 5,
        world: 'Function Castle',
        avatar: '🏰',
        title: 'Summon a Reusable Spell',
        headline: 'The castle hates copy-paste magic.',
        story: 'Create a function spell and call it more than once. Reusable magic is stronger magic.',
        concept: 'Functions',
        difficulty: 'Medium',
        objectives: ['Define a function', 'Call the function', 'Use a loop inside or around it'],
        code: `import turtle

t = turtle.Turtle()

def draw_tower():
    for i in range(4):
        t.forward(70)
        t.right(90)

for tower in range(3):
    draw_tower()
    t.penup()
    t.forward(100)
    t.pendown()

print("Castle towers summoned!")`,
        hint: 'Functions start with def. After defining it, call the function by writing its name with parentheses.',
        success: { checks: ['defFunction', 'functionCall', 'loop'] },
        rewards: { xp: 55, coins: 34, unlock: 'Function Crown', badge: '👑' },
        scene: 'castle'
      },
      {
        id: 6,
        world: 'Pattern Jungle',
        avatar: '🌿',
        title: 'Grow the Pattern Vines',
        headline: 'The jungle path is hidden.',
        story: 'Nested repetition grows magical vines. Use loops and colors to reveal the jungle route.',
        concept: 'Patterns',
        difficulty: 'Medium',
        objectives: ['Use repeated drawing', 'Use color or width', 'Create a pattern'],
        code: `import turtle

t = turtle.Turtle()
colors = ["green", "lime", "darkgreen"]

for i in range(30):
    t.color(colors[i % 3])
    t.width(1 + i / 10)
    t.forward(i * 3)
    t.right(80)

print("The vines reveal the path!")`,
        hint: 'Use modulo like colors[i % 3] to cycle through the color list.',
        success: { checks: ['colorsList', 'modulo', 'growingForward'] },
        rewards: { xp: 65, coins: 38, unlock: 'Jungle Vine Badge', badge: '🌿' },
        scene: 'jungle'
      },
      {
        id: 7,
        world: 'Robot Workshop',
        avatar: '🤖',
        title: 'Repair the Debug Bot',
        headline: 'The robot speaks in errors.',
        story: 'Debugging is part of the adventure. Print a message and use variables to power the bot.',
        concept: 'Debugging',
        difficulty: 'Medium',
        objectives: ['Create a variable', 'Print a message', 'Run without errors'],
        code: `energy = 100
bot_name = "NovaBot"

print(bot_name)
print("Energy level:", energy)
print("Debug bot repaired!")`,
        hint: 'Variables store information. print() lets the robot speak.',
        success: { checks: ['variable', 'print'] },
        rewards: { xp: 70, coins: 42, unlock: 'Debug Bot Friend', badge: '🤖' },
        scene: 'robot'
      },
      {
        id: 8,
        world: 'Choice Gate',
        avatar: '🚪',
        title: 'Open the Choice Gate',
        headline: 'The gate asks a question.',
        story: 'Use if-statements to make the spell choose what happens next.',
        concept: 'Conditions',
        difficulty: 'Hard',
        objectives: ['Use if', 'Use else', 'Print an outcome'],
        code: `has_key = True

if has_key:
    print("The choice gate opens!")
else:
    print("Find the key first.")`,
        hint: 'An if-statement checks if something is true. Add else for the other path.',
        success: { checks: ['ifStatement', 'elseStatement', 'print'] },
        rewards: { xp: 80, coins: 48, unlock: 'Choice Key', badge: '🗝️' },
        scene: 'gate'
      },
      {
        id: 9,
        world: 'Animation Arena',
        avatar: '🎬',
        title: 'Spin the Arena Sigil',
        headline: 'The arena needs motion.',
        story: 'Create repeated drawing that feels animated. Fast loops can make static code feel alive.',
        concept: 'Animation',
        difficulty: 'Hard',
        objectives: ['Use many repeats', 'Use changing angle or size', 'Create motion-like output'],
        code: `import turtle

t = turtle.Turtle()
t.speed(0)

for i in range(36):
    for side in range(4):
        t.forward(90)
        t.right(90)
    t.right(10)

print("Arena sigil spinning!")`,
        hint: 'Draw a shape, rotate a little, then draw it again many times.',
        success: { checks: ['rangeMany', 'nestedLoop', 'turning'] },
        rewards: { xp: 90, coins: 55, unlock: 'Arena Sigil', badge: '🎬' },
        scene: 'arena'
      },
      {
        id: 10,
        world: 'Creator Sky',
        avatar: '🚀',
        title: 'Build Your Own Mini World',
        headline: 'The final realm is blank.',
        story: 'Use everything you learned to create your own Python-powered artwork or mini-game idea.',
        concept: 'Creativity',
        difficulty: 'Expert',
        objectives: ['Use a loop', 'Use a function or variable', 'Add your own idea'],
        code: `import turtle

t = turtle.Turtle()
t.speed(0)
colors = ["red", "blue", "green", "purple"]

def my_world():
    for i in range(40):
        t.color(colors[i % 4])
        t.forward(i * 3)
        t.right(92)

my_world()
print("My mini world is alive!")`,
        hint: 'Combine loops, colors, variables, and functions. Make something that feels like yours.',
        success: { checks: ['loop', 'creativeLength', 'print'] },
        rewards: { xp: 120, coins: 80, unlock: 'Realm Builder Trophy', badge: '🏆' },
        scene: 'creator'
      }
    ];
  }

  get currentLevel() { return this.progress.currentLevel; }
  set currentLevel(value) { this.progress.currentLevel = value; }
  get unlockedLevels() { return this.progress.unlockedLevels; }
  get completedLevels() { return this.progress.completedLevels; }

  getCurrentLevel() {
    return this.levels.find(level => level.id === this.progress.currentLevel) || this.levels[0];
  }

  getLevel(levelId) {
    return this.levels.find(level => level.id === levelId);
  }

  getNextLevel() {
    return this.getLevel(this.progress.currentLevel + 1) || null;
  }

  getPrevLevel() {
    return this.getLevel(this.progress.currentLevel - 1) || null;
  }

  goToLevel(levelId) {
    if (!this.isLevelUnlocked(levelId)) return false;
    this.progress.currentLevel = levelId;
    this.saveProgress();
    return true;
  }

  isLevelUnlocked(levelId) {
    return this.progress.unlockedLevels.includes(levelId);
  }

  isLevelCompleted(levelId) {
    return this.progress.completedLevels.includes(levelId);
  }

  completeCurrentLevel() {
    const level = this.getCurrentLevel();
    const alreadyCompleted = this.isLevelCompleted(level.id);

    if (!alreadyCompleted) {
      this.progress.completedLevels.push(level.id);
      this.progress.xp += level.rewards.xp;
      this.progress.coins += level.rewards.coins;
      this.progress.streak += 1;
      this.progress.lastCompletedAt = new Date().toISOString();

      if (!this.progress.inventory.includes(level.rewards.unlock)) {
        this.progress.inventory.push(level.rewards.unlock);
      }

      const nextId = level.id + 1;
      if (this.getLevel(nextId) && !this.isLevelUnlocked(nextId)) {
        this.progress.unlockedLevels.push(nextId);
      }
    }

    this.saveProgress();
    return { level, alreadyCompleted };
  }

  saveCode(levelId, code) {
    this.progress.savedCode[String(levelId)] = code;
    this.saveProgress();
  }

  getSavedCode(levelId) {
    return this.progress.savedCode[String(levelId)] || null;
  }

  getCompletionPercentage() {
    return Math.round((this.progress.completedLevels.length / this.levels.length) * 100);
  }

  saveProgress() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
  }

  loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey));
      if (saved) {
        this.progress = {
          ...this.defaultProgress,
          ...saved,
          unlockedLevels: saved.unlockedLevels?.length ? saved.unlockedLevels : [1],
          completedLevels: saved.completedLevels || [],
          inventory: saved.inventory || [],
          savedCode: saved.savedCode || {}
        };
      }
    } catch (error) {
      this.progress = { ...this.defaultProgress };
    }
  }

  resetProgress() {
    this.progress = { ...this.defaultProgress, unlockedLevels: [1], completedLevels: [], inventory: [], savedCode: {} };
    this.saveProgress();
  }
}

window.LevelSystem = LevelSystem;
