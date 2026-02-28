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
    this.optRect = { x: 0, y: 0, w: 0, h: 0 };
    this.exitRect = { x: 0, y: 0, w: 0, h: 0 };

    // Signals to GameEngine
    this.requestExitToMenu = false;
    this.requestOpenOptions = false;
  }

  update(cw, ch) {
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
    const panelPad = 10;

    this.panelRect.w = pw;
    this.panelRect.x = this.menuRect.x;
    this.panelRect.y = this.menuRect.y + this.menuRect.h + 8;
    this.panelRect.h = panelPad + bh + 10 + bh + panelPad;

    this.optRect.x = this.panelRect.x + panelPad;
    this.optRect.y = this.panelRect.y + panelPad;
    this.optRect.w = this.panelRect.w - panelPad * 2;
    this.optRect.h = bh;

    this.exitRect.x = this.panelRect.x + panelPad;
    this.exitRect.y = this.optRect.y + bh + 10;
    this.exitRect.w = this.panelRect.w - panelPad * 2;
    this.exitRect.h = bh;

    this.topBarH = this.menuRect.y + this.menuRect.h + 10;
  }

  // Return true if HUD consumed the click
  handleClick(x, y) {
    // Hamburger toggle
    if (this.pointInRect(x, y, this.menuRect)) {
      this.showMenu = !this.showMenu;
      return true;
    }

    // If dropdown is open, it consumes clicks
    if (this.showMenu) {
      if (this.pointInRect(x, y, this.optRect)) {
        this.requestOpenOptions = true;
        this.showMenu = false;
        return true;
      }

      if (this.pointInRect(x, y, this.exitRect)) {
        this.requestExitToMenu = true;
        this.showMenu = false;
        return true;
      }

      // Click outside closes it
      if (!this.pointInRect(x, y, this.panelRect) && !this.pointInRect(x, y, this.menuRect)) {
        this.showMenu = false;
        return true;
      }

      return true;
    }

    // Inventory click -> pick slot
    if (this.pointInRect(x, y, this.invRect)) {
      const slot = this.getSlotIndexAt(x, y);
      if (slot !== null) this.inv.select(slot);
      return true;
    }

    return false;
  
}

  draw(ctx) {
    this.drawHamburgerButton(ctx);
    this.drawInventorySlots(ctx);
    if (this.showMenu) this.drawHamburgerDropdown(ctx);
  }

  // ===== Drawing =====
  drawHudButtonBase(ctx, r) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, r.x, r.y, r.w, r.h, 10);
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
    this.roundRectPath(ctx, r.x, r.y, r.w, r.h, 10);
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
      this.roundRectPath(ctx, sx, sy, sw, sh, 8);
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
      // show stack count (sandbags)
      if (typeof item.count === "number" && item.count > 1) {
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
    this.roundRectPath(ctx, hx + 3, r.y + 3, slotW - 6, r.h - 6, 8);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    this.roundRectPath(ctx, hx + 3, r.y + 3, slotW - 6, r.h - 6, 8);
    ctx.stroke();
    ctx.restore();
  }

  drawHamburgerDropdown(ctx) {
    const p = this.panelRect;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.strokeStyle = "rgba(255,255,255,0.70)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, p.x, p.y, p.w, p.h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    this.drawDropdownButton(ctx, this.optRect, "Options");
    this.drawDropdownButton(ctx, this.exitRect, "Exit to Main Menu");
  }

  drawDropdownButton(ctx, r, label) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, r.x, r.y, r.w, r.h, 10);
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

  // ===== Generic helpers =====
  pointInRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  roundRectPath(ctx, x, y, w, h, radius) {
    const rr = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
}