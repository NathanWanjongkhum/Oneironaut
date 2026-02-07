class MenuRoomController {
  constructor(game) {
    this.game = game;

    // States
    this.scene = "menu"; // "menu" (sky screen) or "room" (bedroom screen)
    this.theme = "day";  // "day" or "night"

    // Fade transition
    this.transitioning = false;
    this.fade = 0;
    this.fadeDir = 0;
    this.nextScene = null;

    // UI rects (computed every frame)
    this.startRect = { x: 0, y: 0, w: 0, h: 0 }; // menu screen start

    this.showHelp = false;
    this.helpPanelRect = { x: 0, y: 0, w: 0, h: 0 };
    this.helpCloseRect = { x: 0, y: 0, w: 44, h: 44 };

    // Room screen buttons
    this.newDreamRect = { x: 0, y: 0, w: 0, h: 0 };
    this.loadDreamRect = { x: 0, y: 0, w: 0, h: 0 };
    this.helpRect = { x: 0, y: 0, w: 0, h: 0 };
    this.creditsRect = { x: 0, y: 0, w: 0, h: 0 };

    this.toggleRect = { x: 0, y: 0, w: 110, h: 46 };
    this.backRect = { x: 0, y: 0, w: 150, h: 46 };

    // Credits modal
    this.showCredits = false;
    this.creditsPanelRect = { x: 0, y: 0, w: 0, h: 0 };
    this.creditsCloseRect = { x: 0, y: 0, w: 44, h: 44 };


    
  }

  update() {

   if (this.game.mode !== "menu") return;
    
    const cw = this.game.ctx.canvas.width;
    const ch = this.game.ctx.canvas.height;

    const pad = 18;

    // Toggle top-right
    this.toggleRect.w = 110;
    this.toggleRect.h = 46;
    this.toggleRect.x = cw - this.toggleRect.w - pad;
    this.toggleRect.y = pad;

    // Back button top-left (only used in room)
    this.backRect.w = 150;
    this.backRect.h = 46;
    this.backRect.x = pad;
    this.backRect.y = pad;

    // MENU screen: Start button (center)
    this.startRect.w = Math.min(320, Math.max(220, cw * 0.22));
    this.startRect.h = Math.min(80, Math.max(56, ch * 0.085));
    this.startRect.x = (cw - this.startRect.w) / 2;
    this.startRect.y = (ch - this.startRect.h) / 2;

    // ROOM screen buttons (only meaningful when scene === "room")
    const buttonH = Math.min(86, Math.max(54, ch * 0.08));

    // New Dream (center, over portal)
    this.newDreamRect.w = Math.min(360, Math.max(240, cw * 0.28));
    this.newDreamRect.h = Math.min(90, Math.max(56, ch * 0.09));
    this.newDreamRect.x = (cw - this.newDreamRect.w) / 2;
    this.newDreamRect.y = ch * 0.46 - this.newDreamRect.h / 2;

    // Load Dream (bottom-left, over bed)
    this.loadDreamRect.w = Math.min(320, Math.max(220, cw * 0.22));
    this.loadDreamRect.h = buttonH;
    this.loadDreamRect.x = cw * 0.10;          // tweak this if you want it more on the bed
    this.loadDreamRect.y = ch - pad - buttonH; // near bottom

    // Help (bottom-middle/right, cabinets area)
    this.helpRect.w = Math.min(300, Math.max(210, cw * 0.20));
    this.helpRect.h = buttonH;
    this.helpRect.x = cw * 0.67 - this.helpRect.w / 2;
    this.helpRect.y = ch - pad - buttonH;

    // Help modal sizing (centered)
    this.helpPanelRect.w = Math.min(720, cw * 0.75);
    this.helpPanelRect.h = Math.min(420, ch * 0.55);
    this.helpPanelRect.x = (cw - this.helpPanelRect.w) / 2;
    this.helpPanelRect.y = (ch - this.helpPanelRect.h) / 2;

    // Close button inside the panel (top-right of panel)
    this.helpCloseRect.w = 44;
    this.helpCloseRect.h = 44;
    this.helpCloseRect.x =
      this.helpPanelRect.x + this.helpPanelRect.w - this.helpCloseRect.w - 12;
    this.helpCloseRect.y = this.helpPanelRect.y + 12;

    // Credits modal sizing (centered)
    this.creditsPanelRect.w = Math.min(720, cw * 0.75);
    this.creditsPanelRect.h = Math.min(360, ch * 0.50);
    this.creditsPanelRect.x = (cw - this.creditsPanelRect.w) / 2;
    this.creditsPanelRect.y = (ch - this.creditsPanelRect.h) / 2;

    // Close button inside the credits panel (top-right)
    this.creditsCloseRect.w = 44;
    this.creditsCloseRect.h = 44;
    this.creditsCloseRect.x =
      this.creditsPanelRect.x +
      this.creditsPanelRect.w -
      this.creditsCloseRect.w -
      12;
    this.creditsCloseRect.y = this.creditsPanelRect.y + 12;

    // Credits (bottom-right)
    this.creditsRect.w = Math.min(280, Math.max(190, cw * 0.18));
    this.creditsRect.h = buttonH;
    this.creditsRect.x = cw - pad - this.creditsRect.w;
    this.creditsRect.y = ch - pad - buttonH;

    // Handle click
    if (this.game.click) {
      const { x, y } = this.game.click;
      this.game.click = null;
      this.handleClick(x, y);
    }

    // Fade transition
    if (this.transitioning) {
      const speed = 1.8;
      this.fade = Math.max(
        0,
        Math.min(1, this.fade + this.fadeDir * speed * this.game.clockTick)
      );

      if (this.fade >= 1 && this.fadeDir === 1) {
        this.scene = this.nextScene;
        this.fadeDir = -1;
      }

      if (this.fade <= 0 && this.fadeDir === -1) {
        this.transitioning = false;
        this.nextScene = null;
      }
    }
  }

  draw(ctx) {

    if (this.game.mode !== "menu") return;
    const cw = this.game.ctx.canvas.width;
    const ch = this.game.ctx.canvas.height;

    const bg = this.getBackground();

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cw, ch);
    this.drawContain(ctx, bg, 0, 0, cw, ch);

    // Always show theme toggle
    this.drawToggle(ctx);

    if (this.scene === "menu") {
      // Sky screen
      this.drawMenuButton(ctx, this.startRect, "Start Game");
    } else if (this.scene === "room") {
      // Bedroom screen: back + 4 buttons
      this.drawMenuButton(ctx, this.backRect, "← Menu");
      this.drawMenuButton(ctx, this.newDreamRect, "New Dream");
      this.drawMenuButton(ctx, this.loadDreamRect, "Load Dream (Coming Soon)");
      this.drawMenuButton(ctx, this.helpRect, "Help");
      this.drawMenuButton(ctx, this.creditsRect, "Credits");
    } else if (this.scene === "dream") {
      // Gameplay sample screen: back to room only
      this.drawMenuButton(ctx, this.backRect, "← Room");
    }

    // Modals
    if (this.showHelp) this.drawHelpModal(ctx);
    if (this.showCredits) this.drawCreditsModal(ctx);

    // Fade overlay
    if (this.transitioning) {
      ctx.save();
      ctx.globalAlpha = this.fade;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, cw, ch);
      ctx.restore();
    }
  }

  handleClick(x, y) {

    // 1. Credits modal has priority
    if (this.showCredits) {
      if (this.pointInRect(x, y, this.creditsCloseRect)) {
        this.showCredits = false;
        return;
      }

      const p = this.creditsPanelRect;
      const inside =
        x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;

      if (!inside) {
        this.showCredits = false;
        return;
      }

      return; // clicks inside credits panel do nothing
    }

    // 2. Help modal has priority
    if (this.showHelp) {
      if (this.pointInRect(x, y, this.helpCloseRect)) {
        this.showHelp = false;
        return;
      }

      const p = this.helpPanelRect;
      const inside =
        x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;

      if (!inside) {
        this.showHelp = false;
        return;
      }

      return; // clicks inside help panel do nothing
    }

    // 3. Dream scene back button
    if (this.scene === "dream") {
      if (this.pointInRect(x, y, this.backRect)) {
        this.transitionTo("room");
        if (window.setMusicMode) window.setMusicMode("menu"); // Oneironaut music
        return;
      }

      // Ignore other clicks in dream scene for now
      return;
    }

    // 4. Theme toggle (works in menu/room)
    if (this.pointInRect(x, y, this.toggleRect)) {
      this.theme = this.theme === "night" ? "day" : "night";
      return;
    }

    if (this.transitioning) return;

    // 5. Menu -> Room
    if (this.scene === "menu" && this.pointInRect(x, y, this.startRect)) {
      this.transitionTo("room");
      return;
    }

    // 6. Room buttons
    if (this.scene === "room") {
      if (this.pointInRect(x, y, this.backRect)) {
        this.dead = false;
        this.deadCounter = 0;
        this.transitionTo("menu");
        return;
      }

      if (this.pointInRect(x, y, this.newDreamRect)) {
        this.transitionTo("dream");
        if (window.setMusicMode) window.setMusicMode("dream"); // Lucid Journey
        this.showHelp = false;
        this.showCredits = false;

        // ✅ Start gameplay immediately
        this.game.mode = "gameplay";

        return;
      }

      if (this.pointInRect(x, y, this.loadDreamRect)) {
        console.log("TODO: Load Dream");
        return;
      }

      if (this.pointInRect(x, y, this.helpRect)) {
        this.showHelp = true;
        this.showCredits = false;
        return;
      }

      if (this.pointInRect(x, y, this.creditsRect)) {
        this.showCredits = true;
        this.showHelp = false;
        return;
      }
    }
  }

  transitionTo(sceneKey) {
    if (this.transitioning) return;

    // Close modals when switching scenes
    this.showHelp = false;
    this.showCredits = false;

    this.transitioning = true;
    this.nextScene = sceneKey;
    this.fadeDir = 1;
  }

  // GUI Drawing

  drawMenuButton(ctx, r, label) {
    ctx.save();

    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, r.x, r.y, r.w, r.h, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = `600 ${Math.floor(r.h * 0.38)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2);

    ctx.restore();
  }

  drawToggle(ctx) {
    const r = this.toggleRect;
    const isNight = this.theme === "night";

    ctx.save();

    ctx.fillStyle = isNight
      ? "rgba(10,20,60,0.55)"
      : "rgba(255,255,255,0.35)";
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, r.x, r.y, r.w, r.h, r.h / 2);
    ctx.fill();
    ctx.stroke();

    const knobR = r.h * 0.38;
    const knobX = isNight ? r.x + r.w - r.h / 2 : r.x + r.h / 2;
    const knobY = r.y + r.h / 2;

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobR, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "600 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(isNight ? "Night" : "Day", r.x + r.w / 2, r.y + r.h + 14);

    ctx.restore();
  }

  // Backgrounds

  getBackground() {
    if (this.scene === "menu") {
      return this.theme === "night"
        ? ASSET_MANAGER.getAsset("./assets/background/menu/NightDream.png")
        : ASSET_MANAGER.getAsset("./assets/background/menu/DayDream.png");
    }

    if (this.scene === "room") {
      return this.theme === "night"
        ? ASSET_MANAGER.getAsset("./assets/background/menu/NightDreamRoom.png")
        : ASSET_MANAGER.getAsset("./assets/background/menu/DaydreamRoom.png");
    }

    return ASSET_MANAGER.getAsset("./assets/background/menu/newDream.png");
  }

  // Helpers

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

  drawContain(ctx, img, x, y, w, h) {
    const iw = img.width;
    const ih = img.height;

    const scale = Math.min(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;

    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  drawHelpModal(ctx) {
    const cw = this.game.ctx.canvas.width;
    const ch = this.game.ctx.canvas.height;

    // Dim background
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();

    // Panel
    const p = this.helpPanelRect;

    ctx.save();
    ctx.fillStyle = "rgba(20, 24, 40, 0.85)";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, p.x, p.y, p.w, p.h, 22);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Title
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Help", p.x + p.w / 2, p.y + 18);
    ctx.restore();

    // Close button (X)
    this.drawCloseButton(ctx, this.helpCloseRect);

    // Body text (centered block)
    const body =
      "New Dream: Start a fresh run.\n" +
      "Load Dream: Continue from a saved dream.\n" +
      "Night/Day: Changes the theme.\n" +
      "Controls\n\n" +
      "Left Mouse Click (Planning):\n" +
      "- Click to set a path point (creates a new node and links to the previous).\n" +
      "- Click + hold on empty space: creates a node that follows the cursor; locks on release.\n" +
      "- Click + hold on an existing node: drags the node; connected links redraw on release.\n\n" +
      "Right Mouse Click (Planning):\n" +
      "- Right click a hovered node to remove it.\n" +
      "- Deletes that node AND all nodes after it (order based on the first placed node / starter node).\n\n" +
      "Return Key:\n" +
      "- Begins the next phase.\n\n" +
      "T Key:\n" +
      "- Takes the current dream bubble item (if present) and places it into the selected cursor slot.\n\n" +
      "P Key:\n" +
      "- Selects the edit path option.\n\n" +
      "Space Bar:\n" +
      "- Use currently selected item.\n\n" +
      "1 Key:\n" +
      "- Selects the first inventory item.\n" +
      "2 Key:\n" +
      "- Selects the second inventory item.\n" +
      "3 Key:\n" +
      "- Selects the third inventory item.";

    this.drawWrappedTextCentered(
      ctx,
      body,
      p.x + 40,
      p.y + 80,
      p.w - 80,
      p.h - 120,
      16
    );
  }

  drawCreditsModal(ctx) {
    const cw = this.game.ctx.canvas.width;
    const ch = this.game.ctx.canvas.height;

    // Dim background
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cw, ch);
    ctx.restore();

    // Panel
    const p = this.creditsPanelRect;

    ctx.save();
    ctx.fillStyle = "rgba(20, 24, 40, 0.85)";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, p.x, p.y, p.w, p.h, 22);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Title
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "700 28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Credits", p.x + p.w / 2, p.y + 18);
    ctx.restore();

    // Close button (X)
    this.drawCloseButton(ctx, this.creditsCloseRect);

    // Names (centered)
    const body =
      "Developers:\n" +
      "Cristian Acevedo-Villasana\n" +
      "Corey Young\n" +
      "Nathan Wanjongkhum\n" +
      "Hussein Sheikh";

    this.drawWrappedTextCentered(
      ctx,
      body,
      p.x + 40,
      p.y + 80,
      p.w - 80,
      p.h - 120,
      22
    );
  }

  drawCloseButton(ctx, r) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    this.roundRectPath(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r.x + 14, r.y + 14);
    ctx.lineTo(r.x + r.w - 14, r.y + r.h - 14);
    ctx.moveTo(r.x + r.w - 14, r.y + 14);
    ctx.lineTo(r.x + 14, r.y + r.h - 14);
    ctx.stroke();
    ctx.restore();
  }

  drawWrappedTextCentered(ctx, text, x, y, w, h, fontSize = 20) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = `500 ${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const lines = [];
    const paragraphs = text.split("\n");

    // Build wrapped lines
    for (const para of paragraphs) {
      // keep intentional blank lines
      if (para.trim() === "") {
        lines.push("");
        continue;
      }

      const words = para.split(" ");
      let line = "";

      for (const word of words) {
        const test = line ? `${line} ${word}` : word;

        if (ctx.measureText(test).width > w && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      }

      if (line) lines.push(line);
    }

    // Draw lines from top (not vertically centered)
    const lineH = Math.floor(fontSize * 1.35);
    const startY = y;

    // Only draw what fits inside the box
    const maxLines = Math.floor(h / lineH);

    for (let i = 0; i < lines.length && i < maxLines; i++) {
      ctx.fillText(lines[i], x + w / 2, startY + i * lineH);
    }

    ctx.restore();
  }
}