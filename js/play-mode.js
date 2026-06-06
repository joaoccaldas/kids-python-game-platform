// CodeQuest play mode: first-run overlay, mobile dock, and cosmetic sync across visible game moments.
(function installCodeQuestPlayMode() {
  function waitForApp(callback, attempts = 80) {
    if (window.app?.levelSystem && window.app?.canvasRenderer) {
      callback(window.app);
      return;
    }
    if (attempts <= 0) return;
    setTimeout(() => waitForApp(callback, attempts - 1), 100);
  }

  function getCosmetics(app) {
    return app.levelSystem.getSelectedCosmetics?.() || app.levelSystem.getCosmetics?.() || {
      skin: { icon: '🐢', name: 'Classic Turtle' },
      selectedSkin: { icon: '🐢', name: 'Classic Turtle' },
      trail: null,
      selectedTrail: null
    };
  }

  function getSkin(app) {
    const cosmetics = getCosmetics(app);
    return cosmetics.skin || cosmetics.selectedSkin || { icon: '🐢', name: 'Classic Turtle' };
  }

  function getTrail(app) {
    const cosmetics = getCosmetics(app);
    return cosmetics.trail || cosmetics.selectedTrail || null;
  }

  function createStartOverlay() {
    if (document.getElementById('start-quest-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'start-quest-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-card start-quest-card">
        <div class="modal-badge">🧙‍♂️</div>
        <h2>Open the first gate</h2>
        <p class="start-tip">Your code is the controller. Run the spell, watch the world react, then unlock the next realm.</p>
        <div class="start-steps">
          <div><strong>1</strong><span>Look at the live world. The gate is waiting.</span></div>
          <div><strong>2</strong><span>Check the Python spell. The scanner tells you what is missing.</span></div>
          <div><strong>3</strong><span>Tap Run Spell and collect coins for skins and trails.</span></div>
        </div>
        <div class="modal-actions">
          <button id="start-adventure" class="primary-btn">Start adventure</button>
          <button id="start-run-now" class="secondary-btn">Run spell now</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  function createPlayDock() {
    if (document.getElementById('playdock')) return;
    const dock = document.createElement('nav');
    dock.id = 'playdock';
    dock.className = 'playdock';
    dock.setAttribute('aria-label', 'Quick game controls');
    dock.innerHTML = `
      <button type="button" data-play-scroll="world">World</button>
      <button type="button" data-play-scroll="spell">Spell</button>
      <button type="button" class="primary" id="dock-run">Run</button>
      <button type="button" id="dock-shop">Shop</button>`;
    document.body.appendChild(dock);
  }

  function syncVisibleHero(app) {
    const skin = getSkin(app);
    const trail = getTrail(app);
    const avatarTargets = [
      document.getElementById('quest-avatar'),
      document.getElementById('modal-badge'),
      document.getElementById('equipped-avatar')
    ];
    avatarTargets.forEach(target => {
      if (!target) return;
      target.textContent = skin.icon || '🐢';
      target.classList.remove('hero-spark');
      void target.offsetWidth;
      target.classList.add('hero-spark');
    });

    const name = document.getElementById('equipped-skin-name');
    if (name) name.textContent = skin.name || 'Classic Turtle';
    const trailName = document.getElementById('equipped-trail-name');
    if (trailName) trailName.textContent = trail?.name || 'Ink Trail';
  }

  function patchCanvasGateHero(app) {
    const renderer = app.canvasRenderer;
    if (!renderer || renderer.__playModePatched) return;
    renderer.__playModePatched = true;

    const originalDrawSquareGateScene = renderer.drawSquareGateScene?.bind(renderer);
    if (originalDrawSquareGateScene) {
      renderer.drawSquareGateScene = function drawSquareGateSceneWithHeroSkin() {
        const originalAvatar = this.level?.avatar;
        if (this.level) this.level.avatar = getSkin(app).icon || originalAvatar || '🐢';
        originalDrawSquareGateScene();
        if (this.level) this.level.avatar = originalAvatar;
      };
    }
  }

  function installDockActions(app) {
    document.querySelectorAll('[data-play-scroll]').forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.playScroll === 'world'
          ? document.querySelector('.stage-card')
          : document.querySelector('.spell-card');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.getElementById('dock-run')?.addEventListener('click', () => {
      document.querySelector('.stage-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => app.runCode?.(), 180);
    });

    document.getElementById('dock-shop')?.addEventListener('click', () => {
      const shopButton = document.getElementById('shop-btn');
      if (shopButton) shopButton.click();
      else document.getElementById('shop-modal')?.classList.add('show');
    });
  }

  function installStartOverlay(app) {
    const modal = document.getElementById('start-quest-modal');
    if (!modal) return;

    document.getElementById('start-adventure')?.addEventListener('click', () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      localStorage.setItem('codequest-start-seen-v1', 'true');
      document.querySelector('.stage-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('start-run-now')?.addEventListener('click', () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      localStorage.setItem('codequest-start-seen-v1', 'true');
      document.querySelector('.stage-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => app.runCode?.(), 220);
    });

    if (!localStorage.getItem('codequest-start-seen-v1')) {
      setTimeout(() => {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      }, 650);
    }
  }

  function patchAppLifecycle(app) {
    if (app.__playModeInstalled) return;
    app.__playModeInstalled = true;

    const originalLoadLevel = app.loadLevel?.bind(app);
    if (originalLoadLevel) {
      app.loadLevel = function loadLevelWithPlayMode(levelId) {
        originalLoadLevel(levelId);
        syncVisibleHero(app);
      };
    }

    const originalUpdateHUD = app.updateHUD?.bind(app);
    if (originalUpdateHUD) {
      app.updateHUD = function updateHUDWithPlayMode() {
        originalUpdateHUD();
        syncVisibleHero(app);
      };
    }

    const originalOpenModal = app.openModal?.bind(app);
    if (originalOpenModal) {
      app.openModal = function openModalWithHero(level) {
        originalOpenModal(level);
        syncVisibleHero(app);
      };
    }
  }

  function boot(app) {
    createStartOverlay();
    createPlayDock();
    patchCanvasGateHero(app);
    patchAppLifecycle(app);
    installDockActions(app);
    installStartOverlay(app);
    syncVisibleHero(app);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => waitForApp(boot), { once: true });
  } else {
    waitForApp(boot);
  }
})();
