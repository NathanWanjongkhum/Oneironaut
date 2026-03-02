// items.js
// Pickups: ONLY "Active Items" are pickable and go into inventory slots.
// Passive items + Pajamas are NOT pickable yet (they stay in the world).

const ITEM_DEFS = {
  // ===== ACTIVE ITEMS (Inventory items) =====
  Sword: { path: "./assets/items/Sword.png", pickable: true },
  ToothBrush: { path: "./assets/items/ToothBrush.png", pickable: true },
  TeddyBear: { path: "./assets/items/TeddyBear.png", pickable: true },
  SleepDust: { path: "./assets/items/SleepDust.png", pickable: true },

  // Sandbags (x3) - for now treat as pickable inventory item
  SandBag1: { path: "./assets/items/SandBag1.png", pickable: true },
  SandBag3: { path: "./assets/items/SandBag3.png", pickable: true },

  DreamCatcher: {
    path: "./assets/items/DreamCatcher.png",
    pickable: false,
    bubbleOnly: true,
  },
  Rocket: {
    path: "./assets/items/Rocket.png",
    pickable: false,
    bubbleOnly: true,
  },
  SleepMask: {
    path: "./assets/items/SleepMask.png",
    pickable: false,
    bubbleOnly: true,
  },
  TheStrangeLamp: {
    path: "./assets/items/TheStrangeLamp.png",
    pickable: false,
    bubbleOnly: true,
  },
  Pajama: {
    path: "./assets/items/Pijama.png",
    pickable: true,
    bubbleOnly: true,
  },
};

class PickupItem {
  constructor(game, x, y, id) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.id = id;

    this.def = ITEM_DEFS[id];
    this.sprite = this.def ? ASSET_MANAGER.getAsset(this.def.path) : null;

    // Normalize size so all items look consistent in the world
    this.maxWorldSize = 64; // adjust 48/56/64 if you want

    this.BB = null;
    this.removeFromWorld = false;
  }

  getScale() {
    if (!this.sprite) return 1;
    const maxDim = Math.max(this.sprite.width, this.sprite.height);
    return this.maxWorldSize / maxDim;
  }

  getDrawW() {
    if (!this.sprite) return 40;
    return this.sprite.width * this.getScale();
  }

  getDrawH() {
    if (!this.sprite) return 40;
    return this.sprite.height * this.getScale();
  }

  updateBB() {
    const w = this.getDrawW();
    const h = this.getDrawH();
    this.BB = new BoundingBox(this.x - w / 2, this.y - h / 2, w, h);
  }

  update() {
    if (this.game.mode !== "gameplay") return;
    if (!this.def || !this.sprite) return;

    const sg = this.game.sleepyGuy;
    if (!sg) return;

    if (!sg.BB) sg.updateBB?.();
    this.updateBB();

    // ===== Inventory items =====
    if (this.def.pickable) {
      if (this.BB && sg.BB && this.BB.collide(sg.BB)) {
        if (this.id) {
          console.log(this.id);

          if (this.id === "Pajama") {
            sg.applyPajamaEffect();
            this.removeFromWorld = true;
            return;
          }

          const item = { id: this.id, img: this.sprite };

          // Sandbags carry charges (SandBag3 -> 3 uses)
          if (this.id.startsWith("SandBag")) {
            const n = parseInt(this.id.replace("SandBag", ""), 10);
            item.count = Number.isFinite(n) ? n : 1;
          }

          const ok = this.game.inventory.addItem(item);
          if (ok) this.removeFromWorld = true;
        }
      }
      return;
    }

    // ===== Dream bubble-only items (non-inventory) =====
    if (this.def.bubbleOnly) {
      if (this.BB && sg.BB && this.BB.collide(sg.BB)) {
        if (!this.game.dreamBubble)
          this.game.dreamBubble = new DreamBubbleOverlay(this.game);

        const ok = this.game.dreamBubble.storeItem({
          id: this.id,
          img: this.sprite,
        });

        if (ok) {
          this.removeFromWorld = true; // stored successfully
        }
        // else bubble already full -> do nothing
      }
      return;
    }
  }

  draw(ctx) {
    if (this.game.mode !== "gameplay") return;
    if (!this.def || !this.sprite) return;

    const w = this.getDrawW();
    const h = this.getDrawH();
    ctx.drawImage(this.sprite, this.x - w / 2, this.y - h / 2, w, h);
  }
}
