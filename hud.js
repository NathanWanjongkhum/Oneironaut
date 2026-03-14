// HUD.js
class HUD {
  constructor(game, inventory) {
    this.game = game;
    this.inv = inventory;

    this.pad = 18;
    this.gap = 10;

    // Top-left button (hamburger only)
    this.menuRect = { x: 0, y: 0, w: 44, h: 44 };

    // Inventory container (clean pill)
    this.invRect = { x: 0, y: 0, w: 0, h: 44 };

    // Dropdown panel
    this.showMenu = false;
    this.panelRect = { x: 0, y: 0, w: 220, h: 0 };
    this.helpRect = { x: 0, y: 0, w: 0, h: 0 };
    this.optRect = { x: 0, y: 0, w: 0, h: 0 };
    this.exitRect = { x: 0, y: 0, w: 0, h: 0 };

    // Signals to GameEngine
    this.requestExitToMenu = false;
    this.requestOpenOptions = false;
    this.requestOpenHelp = false;
  }

  update(cw, ch) {
    this.cw = cw;
    this.ch = ch;
    const pad = this.pad;
    const gap = this.gap;

    // Hamburger button (top-left)
    this.menuRect.w = 44;
    this.menuRect.h = 44;
    this.menuRect.x = pad;
    this.menuRect.y = pad;

    // Inventory pill to the right of hamburger
    const invH = 44;
    const invW = Math.min(260, Math.max(200, cw * 0.18)); // clean HUD width

    this.invRect.x = this.menuRect.x + this.menuRect.w + gap;
    this.invRect.y = pad;
    this.invRect.w = invW;
    this.invRect.h = invH;

    // Dropdown under hamburger
    const pw = 220;
    const bh = 44;
    const rowGap = 10;
    const panelPad = 10;

    this.panelRect.w = pw;
    this.panelRect.x = this.menuRect.x;
    this.panelRect.y = this.menuRect.y + this.menuRect.h + 8;
    this.panelRect.h = panelPad + bh + rowGap + bh + rowGap + bh + panelPad;

    this.helpRect.x = this.panelRect.x + panelPad;
    this.helpRect.y = this.panelRect.y + panelPad;
    this.helpRect.w = this.panelRect.w - panelPad * 2;
    this.helpRect.h = bh;

    this.optRect.x = this.panelRect.x + panelPad;
    this.optRect.y = this.helpRect.y + bh + rowGap;
    this.optRect.w = this.panelRect.w - panelPad * 2;
    this.optRect.h = bh;

    this.exitRect.x = this.panelRect.x + panelPad;
    this.exitRect.y = this.optRect.y + bh + rowGap;
    this.exitRect.w = this.panelRect.w - panelPad * 2;
    this.exitRect.h = bh;
  }

  handleClick(x, y) {
    // Hamburger toggle
    if (pointInRect(x, y, this.menuRect)) {
      const opening = !this.showMenu;
      this.showMenu = opening;
      this.game.playSFX?.(opening ? "menuOpen" : "menuClose", 0.9);
      return true;
    }

    // If dropdown is open, it consumes clicks
    if (this.showMenu) {
      if (pointInRect(x, y, this.helpRect)) {
        this.game.playSFX?.("buttonPress", 0.9);
        this.requestOpenHelp = true;
        this.showMenu = false;
        return true;
      }

      if (pointInRect(x, y, this.optRect)) {
        this.game.playSFX?.("buttonPress", 0.9);
        this.requestOpenOptions = true;
        this.showMenu = false;
        return true;
      }

      if (pointInRect(x, y, this.exitRect)) {
        this.game.playSFX?.("buttonPress", 0.9);
        this.requestExitToMenu = true;
        this.showMenu = false;
        return true;
      }

      // Click outside closes it
      if (!pointInRect(x, y, this.panelRect) && !pointInRect(x, y, this.menuRect)) {
        this.showMenu = false;
        this.game.playSFX?.("menuClose", 0.85);
        return true;
      }

      return true;
    }

    // Inventory click -> pick slot
    if (pointInRect(x, y, this.invRect)) {
      const slot = this.getSlotIndexAt(x, y);
      if (slot !== null) {
        this.inv.select(slot);

        const item = this.inv.getSelectedItem();
        if (item?.id === "Sword") {
          this.game.playSFX?.("swordEquip", 0.9);
        } else if (item?.id === "ToothBrush") {
          this.game.playSFX?.("toothbrushEquip", 0.9);
        } else if (item?.id === "TeddyBear") {
          this.game.playSFX?.("teddyBearEquip", 0.9);
        } else if (item?.id?.startsWith("SandBag")) {
          this.game.playSFX?.("sandBagEquip", 0.9);
        }
      }
      return true;
    }

    return false;
  }

  draw(ctx) {
    this.drawHamburgerButton(ctx);
    this.drawInventorySlots(ctx);
    this.drawPajamaHPBar(ctx);

    // timers on the top-right
    this.drawRightTimers(ctx);

    if (this.showMenu) this.drawHamburgerDropdown(ctx);
  }

  drawRightTimers(ctx) {
    const g = this.game;

    // Only show active timers
    const timers = [];
    if (g.dreamCatcherTimer > 0) timers.push({ label: "DreamCatcher", secs: Math.ceil(g.dreamCatcherTimer), icon: "./assets/items/DreamCatcher.png" });
    if (g.rocketTimer > 0) timers.push({ label: "Rocket", secs: Math.ceil(g.rocketTimer), icon: "./assets/items/Rocket.png" });
    if (g.sleepMaskTimer > 0) timers.push({ label: "SleepMask", secs: Math.ceil(g.sleepMaskTimer), icon: "./assets/items/SleepMask.png" });
    if (g.strangeLampTimer > 0) timers.push({ label: "Lamp", secs: Math.ceil(g.strangeLampTimer), icon: "./assets/items/TheStrangeLamp.png" });

    if (timers.length === 0) return;

    const pad = this.pad;
    const xRight = (this.cw || ctx.canvas.width) - pad;

    const h = 28;
    const padX = 12;
    const gapY = 8;

    let y = pad; // top-right stack start

    // Optional: bubble swap “pop” ring near the first pill
    if (g.bubbleSwapFX) {
      const t = Math.min(1, g.bubbleSwapFX.t / g.bubbleSwapFX.duration);
      const alpha = 0.7 * (1 - t);
      const r = 10 + 26 * t;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(200,240,255,0.95)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(xRight - 18, y + h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < timers.length; i++) {
      const t = timers[i];
      const text = `${t.label}: ${t.secs}s`;

      // little icon “bounce” on swap
      let iconBoost = 1;
      if (i === 0 && g.bubbleSwapFX) {
        const p = Math.min(1, g.bubbleSwapFX.t / g.bubbleSwapFX.duration);
        iconBoost = 1 + 0.25 * (1 - p);
      }

      y += this.drawTimerPillWithIcon(ctx, xRight, y, h, padX, t.icon, text, iconBoost) + gapY;
    }
  }

  drawTimerPillWithIcon(ctx, xRight, y, h, padX, iconPath, text, iconBoost = 1) {
    ctx.save();
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";

    const iconImg = ASSET_MANAGER.getAsset(iconPath);
    const iconGap = 8;

    // icon size based on pill height
    const baseIcon = h - 8;
    const iconSize = Math.floor(baseIcon * iconBoost);

    const textW = ctx.measureText(text).width;

    // total width = padding + icon + gap + text + padding
    const w = padX * 2 + (iconImg ? iconSize + iconGap : 0) + textW;

    const x = xRight - w;

    // pill
    ctx.fillStyle = "rgba(80, 160, 220, 0.22)";
    ctx.strokeStyle = "rgba(200, 240, 255, 0.95)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    let tx = x + padX;

    // icon
    if (iconImg) {
      const iy = y + (h - iconSize) / 2;
      ctx.drawImage(iconImg, tx, iy, iconSize, iconSize);
      tx += iconSize + iconGap;
    }

    // text shadow
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(text, tx + 1, y + h / 2 + 1);

    // text
    ctx.fillStyle = "white";
    ctx.fillText(text, tx, y + h / 2);

    ctx.restore();
    return h;
  }

  drawRocketTimer(ctx) {
    const g = this.game;
    if (!g.rocketActive || g.rocketTimer <= 0) return;

    const secs = Math.ceil(g.rocketTimer);
    const text = `Rocket: ${secs}s`;

    const x = this.invRect.x;
    const y = this.invRect.y + this.invRect.h + (g.dreamCatcherActive && g.dreamCatcherTimer > 0 ? 44 : 10);
    const h = 28;
    const padX = 12;

    ctx.save();
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";

    const w = ctx.measureText(text).width + padX * 2;

    // background
    ctx.fillStyle = "rgba(80, 160, 220, 0.22)";
    ctx.strokeStyle = "rgba(200, 240, 255, 0.95)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // text shadow
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(text, x + padX + 1, y + h / 2 + 1);

    // main text
    ctx.fillStyle = "white";
    ctx.fillText(text, x + padX, y + h / 2);

    ctx.restore();
  }

  drawSleepMaskTimer(ctx) {
    const g = this.game;
    if (g.sleepMaskTimer <= 0) return;

    const secs = Math.ceil(g.sleepMaskTimer);
    const text = `SleepMask: ${secs}s`;

    const x = this.invRect.x;
    const y = this.invRect.y + this.invRect.h + 78; // 3rd row
    const h = 28;
    const padX = 12;

    ctx.save();
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";

    const w = ctx.measureText(text).width + padX * 2;

    ctx.fillStyle = "rgba(80, 160, 220, 0.22)";
    ctx.strokeStyle = "rgba(200, 240, 255, 0.95)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(text, x + padX + 1, y + h / 2 + 1);

    ctx.fillStyle = "white";
    ctx.fillText(text, x + padX, y + h / 2);

    ctx.restore();
  }

  drawStrangeLampTimer(ctx) {
    const g = this.game;
    if (g.strangeLampTimer <= 0) return;

    const secs = Math.ceil(g.strangeLampTimer);
    const text = `Lamp: ${secs}s`;

    const x = this.invRect.x;
    const y = this.invRect.y + this.invRect.h + 112; // 4th row
    const h = 28;
    const padX = 12;

    ctx.save();
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";

    const w = ctx.measureText(text).width + padX * 2;

    ctx.fillStyle = "rgba(80, 160, 220, 0.22)";
    ctx.strokeStyle = "rgba(200, 240, 255, 0.95)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(text, x + padX + 1, y + h / 2 + 1);

    ctx.fillStyle = "white";
    ctx.fillText(text, x + padX, y + h / 2);

    ctx.restore();
  }

  drawDreamCatcherTimer(ctx) {
    const g = this.game;
    if (!g.dreamCatcherActive || g.dreamCatcherTimer <= 0) return;

    const secs = Math.ceil(g.dreamCatcherTimer);
    const text = `DreamCatcher: ${secs}s`;

    const x = this.invRect.x;
    const y = this.invRect.y + this.invRect.h + 10;
    const h = 28;
    const padX = 12;

    ctx.save();
    ctx.font = "16px Arial";
    ctx.textBaseline = "middle";

    const w = ctx.measureText(text).width + padX * 2;

    // background
    ctx.fillStyle = "rgba(80, 160, 220, 0.22)";
    ctx.strokeStyle = "rgba(200, 240, 255, 0.95)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // text shadow
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(text, x + padX + 1, y + h / 2 + 1);

    // main text
    ctx.fillStyle = "white";
    ctx.fillText(text, x + padX, y + h / 2);

    ctx.restore();
  }

  // ===== Drawing =====
  drawHudButtonBase(ctx, r) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawHamburgerButton(ctx) {
    const r = this.menuRect;

    this.drawHudButtonBase(ctx, r);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const left = r.x + 12;
    const right = r.x + r.w - 12;
    const y1 = r.y + 15;
    const y2 = r.y + 22;
    const y3 = r.y + 29;

    ctx.beginPath();
    ctx.moveTo(left, y1); ctx.lineTo(right, y1);
    ctx.moveTo(left, y2); ctx.lineTo(right, y2);
    ctx.moveTo(left, y3); ctx.lineTo(right, y3);
    ctx.stroke();
    ctx.restore();
  }

  // Option 1: clean pill with dividers + highlight
  drawInventorySlots(ctx) {
    const r = this.invRect;
    const slots = this.inv.slotCount;
    const slotW = r.w / slots;

    // pill container
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.60)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // subtle slot fill blocks
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    for (let i = 0; i < slots; i++) {
      const sx = r.x + i * slotW + 4;
      const sy = r.y + 4;
      const sw = slotW - 8;
      const sh = r.h - 8;
      roundRectPath(ctx, sx, sy, sw, sh, 8);
      ctx.fill();
    }
    ctx.restore();

    // dividers
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    for (let i = 1; i < slots; i++) {
      const x = r.x + i * slotW;
      ctx.beginPath();
      ctx.moveTo(x, r.y + 8);
      ctx.lineTo(x, r.y + r.h - 8);
      ctx.stroke();
    }
    ctx.restore();

    // ===== draw item icons inside slots (smooth scaling) =====
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"; // optional, safe

    for (let i = 0; i < slots; i++) {
      const item = this.inv.slots[i];
      if (!item || !item.img) continue;

      const sx = r.x + i * slotW;
      const cx = sx + slotW / 2;
      const cy = r.y + r.h / 2;

      // slightly less padding so icons look nicer
      const maxW = slotW - 10;
      const maxH = r.h - 10;

      const iw = item.img.width;
      const ih = item.img.height;
      const scale = Math.min(maxW / iw, maxH / ih);

      const dw = iw * scale;
      const dh = ih * scale;

      ctx.drawImage(item.img, cx - dw / 2, cy - dh / 2, dw, dh);
      // show remaining count / durability
      if (typeof item.count === "number" && item.count > 0) {
        ctx.save();
        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillText(String(item.count), cx + dw / 2 - 14, cy + dh / 2 - 2);
        ctx.fillStyle = "white";
        ctx.fillText(String(item.count), cx + dw / 2 - 15, cy + dh / 2 - 3);
        ctx.restore();
      }
    }

    ctx.restore();


    // selected highlight
    const sel = this.inv.getSelectedIndex();
    const hx = r.x + sel * slotW;

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRectPath(ctx, hx + 3, r.y + 3, slotW - 6, r.h - 6, 8);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    roundRectPath(ctx, hx + 3, r.y + 3, slotW - 6, r.h - 6, 8);
    ctx.stroke();
    ctx.restore();
  }

  drawPajamaHPBar(ctx) {
    const g = this.game;
    if (!g.pajamaArmorActive || g.pajamaArmorMaxHits <= 0) return;

    const maxHits = g.pajamaArmorMaxHits || 5;
    const hits = Math.max(0, Math.min(maxHits, g.pajamaArmorHits || 0));

    const x = this.invRect.x;
    const y = this.showMenu
      ? this.panelRect.y + this.panelRect.h + 10
      : this.invRect.y + this.invRect.h + 10;
    const w = this.invRect.w;
    const h = 36;
    const pad = 8;

    let barColor = "rgba(70, 220, 120, 0.95)";   // green
    if (hits <= 1) {
      barColor = "rgba(235, 70, 70, 0.95)";       // red
    } else if (hits <= 2) {
      barColor = "rgba(245, 210, 70, 0.95)";      // yellow
    }

    // container
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.strokeStyle = "rgba(255,255,255,0.60)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // label
    ctx.save();
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(`HP: ${hits}/${maxHits}`, x + pad + 1, y + 6 + 1);
    ctx.fillStyle = "white";
    ctx.fillText(`HP: ${hits}/${maxHits}`, x + pad, y + 6);
    ctx.restore();

    // segmented bar
    const barX = x + pad;
    const barY = y + 20;
    const barW = w - pad * 2;
    const barH = 10;
    const gap = 4;
    const segW = (barW - gap * (maxHits - 1)) / maxHits;

    for (let i = 0; i < maxHits; i++) {
      const sx = barX + i * (segW + gap);
      const active = i < hits;

      ctx.save();
      ctx.fillStyle = active ? barColor : "rgba(255,255,255,0.10)";
      ctx.strokeStyle = active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, sx, barY, segW, barH, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawHamburgerDropdown(ctx) {
    const p = this.panelRect;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.strokeStyle = "rgba(255,255,255,0.70)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, p.x, p.y, p.w, p.h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    this.drawDropdownButton(ctx, this.helpRect, "Help");
    this.drawDropdownButton(ctx, this.optRect, "Options");
    this.drawDropdownButton(ctx, this.exitRect, "Exit to Main Menu");
  }

  drawDropdownButton(ctx, r, label) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    roundRectPath(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "600 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2);
    ctx.restore();
  }

  // ===== Slot picking =====
  getSlotIndexAt(x, y) {
    const r = this.invRect;
    const slotW = r.w / this.inv.slotCount;
    let idx = Math.floor((x - r.x) / slotW);
    if (idx < 0) idx = 0;
    if (idx >= this.inv.slotCount) idx = this.inv.slotCount - 1;
    return idx;
  }
}
