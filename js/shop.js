// CodeQuest coin shop and hero customisation.
// Loaded after main.js so it can extend the existing app without disrupting core gameplay.
(function installCodeQuestShop() {
  const SHOP_ITEMS = [
    {
      id: 'skin-classic-turtle',
      type: 'skin',
      name: 'Classic Turtle',
      icon: '🐢',
      price: 0,
      description: 'The original brave turtle. Always unlocked.',
      glow: 'rgba(34,197,94,.26)'
    },
    {
      id: 'skin-wizard-turtle',
      type: 'skin',
      name: 'Wizard Turtle',
      icon: '🧙‍♂️',
      price: 35,
      description: 'A tiny spellcaster for players who open gates with style.',
      glow: 'rgba(168,85,247,.32)'
    },
    {
      id: 'skin-ninja-turtle',
      type: 'skin',
      name: 'Ninja Turtle',
      icon: '🥷',
      price: 50,
      description: 'Fast, quiet, dramatic. Perfect for speed spells.',
      glow: 'rgba(148,163,184,.32)'
    },
    {
      id: 'skin-dragon-hatchling',
      type: 'skin',
      name: 'Dragon Hatchling',
      icon: '🐉',
      price: 90,
      description: 'A rare companion for late-realm builders.',
      glow: 'rgba(248,113,113,.34)'
    },
    {
      id: 'trail-ink',
      type: 'trail',
      name: 'Ink Trail',
      icon: '✒️',
      price: 0,
      description: 'Clean black Python lines. Always unlocked.',
      color: '#111827',
      glow: 'rgba(17,24,39,.25)'
    },
    {
      id: 'trail-rainbow',
      type: 'trail',
      name: 'Rainbow Trail',
      icon: '🌈',
      price: 30,
      description: 'Makes every spell feel like a portal parade.',
      color: '#38bdf8',
      glow: 'rgba(56,189,248,.32)'
    },
    {
      id: 'trail-gold',
      type: 'trail',
      name: 'Gold Trail',
      icon: '✨',
      price: 45,
      description: 'A glowing trail for treasure-minded coders.',
      color: '#facc15',
      glow: 'rgba(250,204,21,.34)'
    },
    {
      id: 'trail-fire',
      type: 'trail',
      name: 'Fire Trail',
      icon: '🔥',
      price: 70,
      description: 'Hot lines for players who want every run to roar.',
      color: '#fb7185',
      glow: 'rgba(251,113,133,.34)'
    }
  ];

  const DEFAULT_SKIN = 'skin-classic-turtle';
  const DEFAULT_TRAIL = 'trail-ink';

  function getItem(id) {
    return SHOP_ITEMS.find(item => item.id === id) || null;
  }

  function ensureCosmeticProgress(levelSystem) {
    const p = levelSystem.progress;
    p.purchasedItems = Array.isArray(p.purchasedItems) ? p.purchasedItems : [DEFAULT_SKIN, DEFAULT_TRAIL];
    if (!p.purchasedItems.includes(DEFAULT_SKIN)) p.purchasedItems.push(DEFAULT_SKIN);
    if (!p.purchasedItems.includes(DEFAULT_TRAIL)) p.purchasedItems.push(DEFAULT_TRAIL);
    p.selectedSkin = p.selectedSkin || DEFAULT_SKIN;
    p.selectedTrail = p.selectedTrail || DEFAULT_TRAIL;
    levelSystem.saveProgress();
  }

  function selectedSkin(levelSystem) {
    ensureCosmeticProgress(levelSystem);
    return getItem(levelSystem.progress.selectedSkin) || getItem(DEFAULT_SKIN);
  }

  function selectedTrail(levelSystem) {
    ensureCosmeticProgress(levelSystem);
    return getItem(levelSystem.progress.selectedTrail) || getItem(DEFAULT_TRAIL);
  }

  function patchLevelSystem() {
    if (!window.LevelSystem || window.LevelSystem.prototype.__shopPatched) return;
    window.LevelSystem.prototype.__shopPatched = true;

    const originalLoadProgress = window.LevelSystem.prototype.loadProgress;
    window.LevelSystem.prototype.loadProgress = function loadProgressWithCosmetics() {
      originalLoadProgress.call(this);
      this.progress.purchasedItems = Array.isArray(this.progress.purchasedItems) ? this.progress.purchasedItems : [DEFAULT_SKIN, DEFAULT_TRAIL];
      if (!this.progress.purchasedItems.includes(DEFAULT_SKIN)) this.progress.purchasedItems.push(DEFAULT_SKIN);
      if (!this.progress.purchasedItems.includes(DEFAULT_TRAIL)) this.progress.purchasedItems.push(DEFAULT_TRAIL);
      this.progress.selectedSkin = this.progress.selectedSkin || DEFAULT_SKIN;
      this.progress.selectedTrail = this.progress.selectedTrail || DEFAULT_TRAIL;
      this.saveProgress();
    };

    const originalResetProgress = window.LevelSystem.prototype.resetProgress;
    window.LevelSystem.prototype.resetProgress = function resetProgressWithCosmetics() {
      originalResetProgress.call(this);
      this.progress.purchasedItems = [DEFAULT_SKIN, DEFAULT_TRAIL];
      this.progress.selectedSkin = DEFAULT_SKIN;
      this.progress.selectedTrail = DEFAULT_TRAIL;
      this.saveProgress();
    };

    window.LevelSystem.prototype.isItemPurchased = function isItemPurchased(itemId) {
      ensureCosmeticProgress(this);
      return this.progress.purchasedItems.includes(itemId);
    };

    window.LevelSystem.prototype.buyItem = function buyItem(itemId) {
      ensureCosmeticProgress(this);
      const item = getItem(itemId);
      if (!item) return { ok: false, reason: 'Item not found.' };
      if (this.progress.purchasedItems.includes(item.id)) return { ok: true, alreadyOwned: true, item };
      if (this.progress.coins < item.price) return { ok: false, reason: `You need ${item.price - this.progress.coins} more coins.` };
      this.progress.coins -= item.price;
      this.progress.purchasedItems.push(item.id);
      this.saveProgress();
      return { ok: true, purchased: true, item };
    };

    window.LevelSystem.prototype.equipItem = function equipItem(itemId) {
      ensureCosmeticProgress(this);
      const item = getItem(itemId);
      if (!item) return { ok: false, reason: 'Item not found.' };
      if (!this.progress.purchasedItems.includes(item.id)) return { ok: false, reason: 'Buy it first.' };
      if (item.type === 'skin') this.progress.selectedSkin = item.id;
      if (item.type === 'trail') this.progress.selectedTrail = item.id;
      this.saveProgress();
      return { ok: true, item };
    };

    window.LevelSystem.prototype.getSelectedCosmetics = function getSelectedCosmetics() {
      ensureCosmeticProgress(this);
      return {
        skin: selectedSkin(this),
        trail: selectedTrail(this)
      };
    };
  }

  function patchCanvasRenderer() {
    if (!window.CanvasRenderer || window.CanvasRenderer.prototype.__shopPatched) return;
    window.CanvasRenderer.prototype.__shopPatched = true;

    window.CanvasRenderer.prototype.setCosmetics = function setCosmetics(cosmetics) {
      this.cosmetics = cosmetics || {};
      if (this.cosmetics.trail?.color && this.turtle) {
        this.turtle.color = this.cosmetics.trail.color;
      }
    };

    const originalReset = window.CanvasRenderer.prototype.reset;
    window.CanvasRenderer.prototype.reset = function resetWithCosmetics() {
      originalReset.call(this);
      if (this.cosmetics?.trail?.color) this.turtle.color = this.cosmetics.trail.color;
    };

    const originalSetColor = window.CanvasRenderer.prototype.setColor;
    window.CanvasRenderer.prototype.setColor = function setColorWithShop(color) {
      originalSetColor.call(this, color || this.cosmetics?.trail?.color || '#111827');
    };

    const originalForward = window.CanvasRenderer.prototype.forward;
    window.CanvasRenderer.prototype.forward = function forwardWithTrail(distance) {
      if (this.cosmetics?.trail?.id !== DEFAULT_TRAIL && this.turtle) {
        this.turtle.color = this.cosmetics.trail.color || this.turtle.color;
        this.turtle.width = Math.max(this.turtle.width || 4, 5);
      }
      originalForward.call(this, distance);
    };

    const originalDrawTurtle = window.CanvasRenderer.prototype.drawTurtle;
    window.CanvasRenderer.prototype.drawTurtle = function drawShopSkin() {
      if (!this.cosmetics?.skin?.icon) return originalDrawTurtle.call(this);
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(this.turtle.x, this.turtle.y);
      ctx.rotate(this.radians());
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = this.cosmetics.trail?.color || 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = this.cosmetics.trail?.id === DEFAULT_TRAIL ? 8 : 16;
      ctx.fillText(this.cosmetics.skin.icon, 0, 0);
      ctx.restore();
    };
  }

  function createShopModal() {
    if (document.getElementById('shop-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'shop-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-card shop-card">
        <div class="modal-badge">🛒</div>
        <h2>Coin Shop</h2>
        <div class="shop-topline">
          <p>Spend coins on skins and trails. The hero you choose appears in the live world.</p>
          <div class="shop-balance">🪙 <span id="shop-balance">0</span> coins</div>
        </div>
        <div class="shop-tabs" role="tablist" aria-label="Shop categories">
          <button class="shop-tab active" data-shop-tab="skin">Heroes</button>
          <button class="shop-tab" data-shop-tab="trail">Trails</button>
        </div>
        <div id="shop-grid" class="shop-grid"></div>
        <p id="shop-error" class="shop-error" aria-live="polite"></p>
        <div class="modal-actions" style="margin-top:18px">
          <button id="shop-close" class="secondary-btn">Close shop</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function createShopButton() {
    if (document.getElementById('shop-btn')) return;
    const soundToggle = document.getElementById('sound-toggle');
    const button = document.createElement('button');
    button.id = 'shop-btn';
    button.className = 'ghost-btn shop-btn';
    button.title = 'Open coin shop';
    button.textContent = 'Shop';
    if (soundToggle && soundToggle.parentElement) {
      soundToggle.parentElement.insertBefore(button, soundToggle);
    }
  }

  function createCosmeticPreview() {
    if (document.getElementById('cosmetic-preview-card')) return;
    const rewardBox = document.querySelector('.reward-box');
    if (!rewardBox?.parentElement) return;
    const card = document.createElement('div');
    card.id = 'cosmetic-preview-card';
    card.className = 'cosmetic-card';
    card.innerHTML = `
      <h4>Equipped hero</h4>
      <div class="cosmetic-preview">
        <div id="equipped-avatar" class="cosmetic-avatar">🐢</div>
        <div class="cosmetic-meta">
          <strong id="equipped-skin-name">Classic Turtle</strong>
          <span id="equipped-trail-name">Ink Trail</span>
        </div>
      </div>
    `;
    rewardBox.insertAdjacentElement('afterend', card);
  }

  class CodeQuestShop {
    constructor(app) {
      this.app = app;
      this.currentTab = 'skin';
      this.modal = document.getElementById('shop-modal');
      this.grid = document.getElementById('shop-grid');
      this.balance = document.getElementById('shop-balance');
      this.error = document.getElementById('shop-error');
      this.init();
    }

    init() {
      ensureCosmeticProgress(this.app.levelSystem);
      this.syncCanvasCosmetics();
      this.updatePreview();
      this.render();

      document.getElementById('shop-btn')?.addEventListener('click', () => this.open());
      document.getElementById('shop-close')?.addEventListener('click', () => this.close());
      this.modal?.addEventListener('click', event => {
        if (event.target === this.modal) this.close();
      });
      document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.currentTab = tab.dataset.shopTab || 'skin';
          document.querySelectorAll('.shop-tab').forEach(item => item.classList.toggle('active', item === tab));
          this.render();
        });
      });
    }

    open() {
      this.render();
      this.modal?.classList.add('show');
      this.modal?.setAttribute('aria-hidden', 'false');
      this.app.playSound?.('hint');
    }

    close() {
      this.modal?.classList.remove('show');
      this.modal?.setAttribute('aria-hidden', 'true');
    }

    render() {
      ensureCosmeticProgress(this.app.levelSystem);
      const progress = this.app.levelSystem.progress;
      if (this.balance) this.balance.textContent = progress.coins;
      if (this.error) this.error.textContent = '';
      if (!this.grid) return;

      this.grid.innerHTML = '';
      SHOP_ITEMS.filter(item => item.type === this.currentTab).forEach(item => {
        const owned = progress.purchasedItems.includes(item.id);
        const equipped = progress.selectedSkin === item.id || progress.selectedTrail === item.id;
        const affordable = progress.coins >= item.price;
        const card = document.createElement('article');
        card.className = 'shop-item';
        card.style.setProperty('--item-glow', item.glow || 'rgba(56,189,248,.22)');
        card.innerHTML = `
          <div class="shop-item-icon">${item.icon}</div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="shop-item-footer">
            <span class="shop-price">${item.price === 0 ? 'Free' : `🪙 ${item.price}`}</span>
            <button class="shop-action ${equipped ? 'equipped' : owned ? 'owned' : !affordable ? 'locked' : ''}">
              ${equipped ? 'Equipped' : owned ? 'Equip' : item.price === 0 ? 'Get' : affordable ? 'Buy' : 'Need coins'}
            </button>
          </div>
        `;
        const action = card.querySelector('.shop-action');
        action.disabled = equipped || (!owned && !affordable && item.price > 0);
        action.addEventListener('click', () => this.handleItem(item));
        this.grid.appendChild(card);
      });
    }

    handleItem(item) {
      const levelSystem = this.app.levelSystem;
      let result = { ok: true };
      if (!levelSystem.isItemPurchased(item.id)) {
        result = levelSystem.buyItem(item.id);
      }
      if (!result.ok) {
        this.error.textContent = result.reason || 'Not enough coins yet.';
        this.app.playSound?.('error');
        return;
      }
      levelSystem.equipItem(item.id);
      this.syncCanvasCosmetics();
      this.updatePreview();
      this.app.updateHUD?.();
      this.render();
      this.app.showToast?.(`${item.name} equipped.`);
      this.app.playSound?.('success');
      document.getElementById('cosmetic-preview-card')?.classList.add('shop-burst');
      setTimeout(() => document.getElementById('cosmetic-preview-card')?.classList.remove('shop-burst'), 600);
    }

    syncCanvasCosmetics() {
      const cosmetics = this.app.levelSystem.getSelectedCosmetics();
      this.app.canvasRenderer.setCosmetics?.(cosmetics);
    }

    updatePreview() {
      const cosmetics = this.app.levelSystem.getSelectedCosmetics();
      const avatar = document.getElementById('equipped-avatar');
      const skinName = document.getElementById('equipped-skin-name');
      const trailName = document.getElementById('equipped-trail-name');
      if (avatar) avatar.textContent = cosmetics.skin.icon;
      if (skinName) skinName.textContent = cosmetics.skin.name;
      if (trailName) trailName.textContent = cosmetics.trail.name;
    }
  }

  function patchAppLifecycle() {
    if (!window.app || window.app.__shopInstalled) return;
    window.app.__shopInstalled = true;
    window.app.shop = new CodeQuestShop(window.app);

    const originalLoadLevel = window.app.loadLevel.bind(window.app);
    window.app.loadLevel = function loadLevelWithCosmetics(levelId) {
      originalLoadLevel(levelId);
      this.shop?.syncCanvasCosmetics();
      this.shop?.updatePreview();
    };

    const originalUpdateHUD = window.app.updateHUD.bind(window.app);
    window.app.updateHUD = function updateHUDWithShop() {
      originalUpdateHUD();
      this.shop?.render();
      this.shop?.updatePreview();
    };

    const originalResetProgress = window.app.resetProgress.bind(window.app);
    window.app.resetProgress = function resetProgressWithShop() {
      originalResetProgress();
      ensureCosmeticProgress(this.levelSystem);
      this.shop?.syncCanvasCosmetics();
      this.shop?.updatePreview();
      this.shop?.render();
    };
  }

  function boot() {
    patchLevelSystem();
    patchCanvasRenderer();
    createShopButton();
    createShopModal();
    createCosmeticPreview();
    patchAppLifecycle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }
})();
