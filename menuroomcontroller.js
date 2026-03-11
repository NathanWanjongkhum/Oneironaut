class MenuRoomController {
	constructor(game) {
		this.game = game;

		// States
		this.scene = "menu"; // "menu" (sky screen) or "room" (bedroom screen)
		this.theme = "day";  // "day" or "night"

		this.btnBubbleNormal = ASSET_MANAGER.getAsset("./assets/background/menu/Unselected.png");
		this.btnBubbleHover = ASSET_MANAGER.getAsset("./assets/background/menu/Selected.png");



		// Fade transition
		this.transitioning = false;
		this.fade = 0;
		this.fadeDir = 0;
		this.nextScene = null;

		// UI rects (computed every frame)
		this.startRect = { x: 0, y: 0, w: 0, h: 0 };

		this.showHelp = false;
		this.helpPanelRect = { x: 0, y: 0, w: 0, h: 0 };
		this.helpCloseRect = { x: 0, y: 0, w: 44, h: 44 };

		// Room screen buttons
		this.newDreamRect = { x: 0, y: 0, w: 0, h: 0 };
		this.loadDreamRect = { x: 0, y: 0, w: 0, h: 0 };
		this.helpRect = { x: 0, y: 0, w: 0, h: 0 };
		this.optionsRect = { x: 0, y: 0, w: 0, h: 0 };
		this.creditsRect = { x: 0, y: 0, w: 0, h: 0 };

		this.toggleRect = { x: 0, y: 0, w: 110, h: 46 };
		this.backRect = { x: 0, y: 0, w: 150, h: 46 };

		// Credits modal
		this.showCredits = false;
		this.creditsPanelRect = { x: 0, y: 0, w: 0, h: 0 };
		this.creditsCloseRect = { x: 0, y: 0, w: 44, h: 44 };

		// Options modal
		this.showOptions = false;
		this.optionsPanelRect = { x: 0, y: 0, w: 0, h: 0 };
		this.optionsCloseRect = { x: 0, y: 0, w: 44, h: 44 };

		// Options UI buttons inside modal
		this.optMuteRect = { x: 0, y: 0, w: 0, h: 0 };
		this.optVolDownRect = { x: 0, y: 0, w: 0, h: 0 };
		this.optVolUpRect = { x: 0, y: 0, w: 0, h: 0 };


		this.levels = [
			{ id: 1, name: "Level 1", unlocked: true },
			{ id: 2, name: "Level 2", unlocked: false },
			{ id: 3, name: "Level 3", unlocked: false },
			{ id: 4, name: "Level 4", unlocked: false },
			{ id: 5, name: "Level 5", unlocked: false },
			{ id: 6, name: "Level 6", unlocked: false },
			{ id: 7, name: "Level 7", unlocked: false },
			{ id: 8, name: "Level 8", unlocked: false },
		];

		this.selectedLevel = null;

		// grid button rects (computed every frame)
		this.levelRects = [];
		this.levelPanelRect = { x: 0, y: 0, w: 0, h: 0 };
		this.levelBackRect = { x: 0, y: 0, w: 150, h: 46 };
		this.levelSelectRect = { x: 0, y: 0, w: 0, h: 0 };

		this.currentWorld = "daydream";
		this.worldOrder = ["daydream", "lucidsunset", "nightfall"];

		//TODO: level numbers should be interacted with directly rather than adding an additional layer of mapping!
		// section themes do not need to specify level contents beyond a number range which is faster, more readable, and all around better suited.
		// We do not need more code, we need clean code.
		this.worldThemes = {
			daydream: {
				title: "DayDream Levels",
				roomBg: ASSET_MANAGER.getAsset("./assets/background/selectLevel/DayDream_Hall.png"),
				portalCard: ASSET_MANAGER.getAsset("./assets/background/selectLevel/DayDreamPortal.png"),
				levels: [
					{ id: 1, name: "Level 1", unlocked: true },
					{ id: 2, name: "Level 2", unlocked: false },
					{ id: 3, name: "Level 3", unlocked: false },
					{ id: 4, name: "Level 4", unlocked: false },
				]
			},
			lucidsunset: {
				title: "LucidSunset Levels",
				roomBg: ASSET_MANAGER.getAsset("./assets/background/selectLevel/SunsetHall.png"),
				portalCard: ASSET_MANAGER.getAsset("./assets/background/selectLevel/SunsetPortal.png"),
				levels: [
					{ id: 5, name: "Level 1", unlocked: true },
					{ id: 6, name: "Level 2", unlocked: false },
					{ id: 7, name: "Level 3", unlocked: false },
					{ id: 8, name: "Level 4", unlocked: false },
				]
			},
			nightfall: {
				title: "NightFall Levels",
				roomBg: ASSET_MANAGER.getAsset("./assets/background/selectLevel/NightFallHall.png"),
				portalCard: ASSET_MANAGER.getAsset("./assets/background/selectLevel/NightFall_Portal.png"),
				levels: [
					{ id: 9, name: "Level 1", unlocked: false },
					{ id: 10, name: "Level 2", unlocked: false },
					{ id: 11, name: "Level 3", unlocked: false },
					{ id: 12, name: "Level 4", unlocked: false },
				]
			}
		};

		this.worldNextRect = { x: 0, y: 0, w: 140, h: 52 };//
		this.worldPrevRect = { x: 0, y: 0, w: 140, h: 52 };//



		this.portalUnlocked =
			ASSET_MANAGER.getAsset("./assets/background/selectLevel/unlockedLevel.png");

		this.portalLocked =
			ASSET_MANAGER.getAsset("./assets/background/selectLevel/lockedLevel.png");

	}

	update() {
		if (this.game.mode == "gameplay") return;

		const cw = this.game.ctx.canvas.width;
		const ch = this.game.ctx.canvas.height;

		// const activeTheme = this.getActiveWorldTheme(); //TODO change this to send back a range.
		// There is no reason to add an extra layer of string mappings when levels already exist as a clear num map
		// Handle the numbers directly instead of adding in heavier and unnecessary mappings.
		// const activeLevels = activeTheme.levels;

		const pad = 18;

		// Toggle top-right
		this.toggleRect.w = 110;
		this.toggleRect.h = 46;
		this.toggleRect.x = cw - this.toggleRect.w - pad;
		this.toggleRect.y = pad;

		// Back button top-left
		this.backRect.w = 150;
		this.backRect.h = 46;
		this.backRect.x = pad;
		this.backRect.y = pad;

		this.levelBackRect.w = 150;
		this.levelBackRect.h = 46;
		this.levelBackRect.x = 18;
		this.levelBackRect.y = 18;



		// MENU screen: Start button (center)
		this.startRect.w = Math.min(320, Math.max(220, cw * 0.22));
		this.startRect.h = Math.min(80, Math.max(56, ch * 0.085));
		this.startRect.x = (cw - this.startRect.w) / 2;
		this.startRect.y = (ch - this.startRect.h) / 2;

		// ROOM screen buttons
		const buttonH = Math.min(86, Math.max(54, ch * 0.08));

		// New Dream (center)
		this.newDreamRect.w = Math.min(360, Math.max(240, cw * 0.28));
		this.newDreamRect.h = Math.min(90, Math.max(56, ch * 0.09));
		this.newDreamRect.x = (cw - this.newDreamRect.w) / 2;
		this.newDreamRect.y = ch * 0.46 - this.newDreamRect.h / 2;

		// Load Dream (bottom-left)
		this.loadDreamRect.w = Math.min(320, Math.max(220, cw * 0.22));
		this.loadDreamRect.h = buttonH;
		this.loadDreamRect.x = cw * 0.10;
		this.loadDreamRect.y = ch - pad - buttonH;

		// Bottom row: Help | Options | Credits
		const gap = 14;
		let btnW = Math.min(260, Math.max(170, cw * 0.16));

		const leftEdge = this.loadDreamRect.x + this.loadDreamRect.w + gap;
		const rightEdge = cw - pad;

		const totalNeed = btnW * 3 + gap * 2;
		const available = rightEdge - leftEdge;

		if (available < totalNeed) {
			btnW = Math.max(120, (available - gap * 2) / 3);
		}

		this.creditsRect.w = btnW;
		this.creditsRect.h = buttonH;
		this.creditsRect.x = rightEdge - btnW;
		this.creditsRect.y = ch - pad - buttonH;

		this.optionsRect.w = btnW;
		this.optionsRect.h = buttonH;
		this.optionsRect.x = this.creditsRect.x - gap - btnW;
		this.optionsRect.y = ch - pad - buttonH;

		this.helpRect.w = btnW;
		this.helpRect.h = buttonH;
		this.helpRect.x = this.optionsRect.x - gap - btnW;
		this.helpRect.y = ch - pad - buttonH;

		// Help modal sizing
		this.helpPanelRect.w = Math.min(720, cw * 0.75);
		this.helpPanelRect.h = Math.min(420, ch * 0.55);
		this.helpPanelRect.x = (cw - this.helpPanelRect.w) / 2;
		this.helpPanelRect.y = (ch - this.helpPanelRect.h) / 2;

		this.helpCloseRect.w = 44;
		this.helpCloseRect.h = 44;
		this.helpCloseRect.x =
			this.helpPanelRect.x + this.helpPanelRect.w - this.helpCloseRect.w - 12;
		this.helpCloseRect.y = this.helpPanelRect.y + 12;

		// Credits modal sizing
		this.creditsPanelRect.w = Math.min(720, cw * 0.75);
		this.creditsPanelRect.h = Math.min(360, ch * 0.50);
		this.creditsPanelRect.x = (cw - this.creditsPanelRect.w) / 2;
		this.creditsPanelRect.y = (ch - this.creditsPanelRect.h) / 2;

		this.creditsCloseRect.w = 44;
		this.creditsCloseRect.h = 44;
		this.creditsCloseRect.x =
			this.creditsPanelRect.x +
			this.creditsPanelRect.w -
			this.creditsCloseRect.w -
			12;
		this.creditsCloseRect.y = this.creditsPanelRect.y + 12;

		this.optionsPanelRect.w = Math.min(720, cw * 0.70);
		this.optionsPanelRect.h = Math.min(360, ch * 0.50);
		this.optionsPanelRect.x = (cw - this.optionsPanelRect.w) / 2;
		this.optionsPanelRect.y = (ch - this.optionsPanelRect.h) / 2;


		this.optionsCloseRect.w = 44;
		this.optionsCloseRect.h = 44;
		this.optionsCloseRect.x =
			this.optionsPanelRect.x +
			this.optionsPanelRect.w -
			this.optionsCloseRect.w -
			12;
		this.optionsCloseRect.y = this.optionsPanelRect.y + 12;

		// Buttons inside options modal
		const p = this.optionsPanelRect;
		const optBtnW = Math.min(260, p.w * 0.55);
		const optBtnH = 56;
		const cx = p.x + p.w / 2 - optBtnW / 2;

		this.optMuteRect = { x: cx, y: p.y + 110, w: optBtnW, h: optBtnH };
		this.optVolDownRect = {
			x: cx,
			y: p.y + 110 + 80,
			w: (optBtnW - 16) / 2,
			h: optBtnH,
		};
		this.optVolUpRect = {
			x: cx + (optBtnW + 16) / 2,
			y: p.y + 110 + 80,
			w: (optBtnW - 16) / 2,
			h: optBtnH,
		};



		// Level Select (top-middle-ish or wherever you want)
		this.levelSelectRect.w = Math.min(320, Math.max(220, cw * 0.22));
		this.levelSelectRect.h = buttonH;
		this.levelSelectRect.x = (cw - this.levelSelectRect.w) / 2;
		this.levelSelectRect.y = this.newDreamRect.y + this.newDreamRect.h + 18; // sits under New Dream


		// Handle click in menu mode only.
		// Pause-mode clicks are routed by GameEngine.
		if (this.game.mode === "menu" && this.game.click) {
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

		if (this.scene === "levelSelect") {
			// Unlock by REAL level id across ALL worlds.
			// highestLevel starts at 0, so +1 keeps Level 1 open at the start.
			for (const worldKey of this.worldOrder) {
				for (const L of this.worldThemes[worldKey].levels) {
					L.unlocked = L.id <= (this.game.highestLevel + 1);
				}
			}

			const activeTheme = this.getActiveWorldTheme();
			const activeLevels = activeTheme.levels;

			const cols = 2;
			const titleTop = ch * 0.17;
			const titleHeight = 70;
			const topSafe = titleTop + titleHeight + 25;
			const bottomSafe = 40;
			const gap = Math.max(22, cw * 0.018);

			const rows = Math.ceil(activeLevels.length / cols);

			const availW = cw * 0.78;
			const availH = ch - topSafe - bottomSafe;

			const maxCardW = (availW - gap * (cols - 1)) / cols;
			const maxCardH = (availH - gap * (rows - 1)) / rows;

			const aspect = 1.05;
			let cardW = Math.min(maxCardW, maxCardH / aspect);

			cardW *= 0.92;
			cardW = Math.max(190, Math.min(290, cardW));

			const cardH = cardW * aspect;

			const gridW = cols * cardW + (cols - 1) * gap;
			const gridH = rows * cardH + (rows - 1) * gap;

			const startX = (cw - gridW) / 2;
			const startY = topSafe + (availH - gridH) / 2;

			this.levelRects = [];

			for (let i = 0; i < activeLevels.length; i++) {
				const row = Math.floor(i / cols);
				const col = i % cols;

				this.levelRects.push({
					levelIndex: i,
					x: startX + col * (cardW + gap),
					y: startY + row * (cardH + gap),
					w: cardW,
					h: cardH,
				});
			}

			this.worldPrevRect = {
				x: cw * 0.20 - 70,
				y: ch - 85,
				w: 140,
				h: 52
			};

			this.worldNextRect = {
				x: cw * 0.80 - 70,
				y: ch - 85,
				w: 140,
				h: 52
			};
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
			this.drawMenuButton(ctx, this.optionsRect, "Options");
			this.drawMenuButton(ctx, this.creditsRect, "Credits");
			this.drawMenuButton(ctx, this.levelSelectRect, "Select Level");

		} else if (this.scene === "levelSelect") {
			const activeTheme = this.getActiveWorldTheme();
			const activeLevels = activeTheme.levels;
			this.drawMenuButton(ctx, this.levelBackRect, "← Room");

			const titleY = ch * 0.17;
			ctx.save();
			ctx.fillStyle = "rgba(255,255,255,0.95)";
			ctx.font = "700 52px serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.shadowColor = "rgba(0,0,0,0.65)";
			ctx.shadowBlur = 14;
			ctx.fillText(activeTheme.title, cw / 2, titleY);
			ctx.restore();

			for (const r of this.levelRects) {
				const L = activeLevels[r.levelIndex];

				const hover =
					this.game.mouse && pointInRect(this.game.mouse.x, this.game.mouse.y, r);

				// 1) frosted glass card background
				this.drawGlassCard(ctx, r, { hover, locked: !L.unlocked });

				// 2) portal image clipped inside rounded card
				const portalImg = L.unlocked ? activeTheme.portalCard : this.portalLocked;
				this.drawImageClipped(ctx, portalImg, r, 16);

				// 3) number badge / lock badge
				const badgeR = Math.min(34, r.w * 0.12);
				const bx = r.x + r.w / 2;
				const by = r.y + r.h - badgeR - 14;

				ctx.save();
				ctx.fillStyle = "rgba(20,18,35,0.55)";
				ctx.strokeStyle = "rgba(255,255,255,0.35)";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();

				ctx.fillStyle = "rgba(255,255,255,0.95)";
				ctx.font = `700 ${Math.floor(badgeR * 1.05)}px serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(L.unlocked ? String(r.levelIndex + 1) : "🔒", bx, by + 1);
				ctx.restore();

				// 4) locked overlay
				if (!L.unlocked) {
					ctx.save();
					ctx.globalAlpha = 0.22;
					ctx.fillStyle = "black";
					roundRect(ctx, r.x, r.y, r.w, r.h, 18);
					ctx.fill();
					ctx.restore();
				}
			}

			const currentWorldIndex = this.worldOrder.indexOf(this.currentWorld);
			const lastWorldIndex = this.worldOrder.length - 1;

			if (currentWorldIndex > 0) {
				this.drawMenuButton(ctx, this.worldPrevRect, "← Prev World");
			}

			if (currentWorldIndex < lastWorldIndex) {
				this.drawMenuButton(ctx, this.worldNextRect, "Next World →");
			}


		} else if (this.scene === "dream") {
			this.drawMenuButton(ctx, this.backRect, "← Room");
		}

		if (this.showHelp) this.drawHelpModal(ctx);
		if (this.showOptions) this.drawOptionsModal(ctx);
		if (this.showCredits) this.drawCreditsModal(ctx);


		if (this.transitioning) {
			ctx.save();
			ctx.globalAlpha = this.fade;
			ctx.fillStyle = "black";
			ctx.fillRect(0, 0, cw, ch);
			ctx.restore();
		}
	}


	handleClick(x, y) {
		if (this.transitioning) return;

		// Pause only supports the in-game options panel.
		if (this.game.mode === "pause") {
			if (this.showOptions) this.inOptionsMenu(x, y);
			return;
		}


		// // Click a level
		// 	for (const r of this.levelRects) {
		// 		if (this.pointInRect(x, y, r)) {
		// 			const L = activeLevels[r.levelIndex];

		// 			if (!L.unlocked) {
		// 				alert("Coming soon");
		// 				return;
		// 			}

		// 			this.selectedLevel = L.id;
		// 			this.game.currentWorld = this.currentWorld;

		// 			if (this.game.startLevel) {
		// 				this.game.startLevel(this.selectedLevel, this.currentWorld);
		// 			} else {
		// 				this.game.mode = "gameplay";
		// 			}

		// Priority menus
		if (this.showOptions || this.showCredits || this.showHelp) {
			if (this.showOptions) {
				this.inOptionsMenu(x, y);
			} else {
				//Same behavior = treat them identically + only one can be true at a time
				const currMenuRect = this.showCredits ? this.creditsPanelRect : this.helpPanelRect;
				const currCloseRect = this.showCredits ? this.creditsCloseRect : this.helpCloseRect;
				if (pointInRect(x, y, currCloseRect)) {
					this.showCredits = false;
					this.showHelp = false;
				}
				if (!pointInRect(x, y, currMenuRect)) {
					this.showCredits = false;
					this.showHelp = false;
				}
			}
			return;
		}

		// Theme toggle (2nd priority)
		if (pointInRect(x, y, this.toggleRect)) {
			this.theme = this.theme === "night" ? "day" : "night";
			return;
		}

		// Standard menus (3rd priority)
		if (this.scene === "menu") {
			this.inStartMenu(x, y);
		}
		if (this.scene === "levelSelect") {
			this.inSelectLevelMenu(x, y);
			return;
		}
		if (this.scene === "room") {
			this.inRoomMenu(x, y);
		}

	}

	inStartMenu(x, y) {
		if (pointInRect(x, y, this.startRect)) {
			this.transitionTo("room");
			return;
		}
	}
	inRoomMenu(x, y) {

		if (pointInRect(x, y, this.backRect)) {
			this.transitionTo("menu");
			return;
		}
		if (pointInRect(x, y, this.levelSelectRect)) {
			this.transitionTo("levelSelect");
			return;
		}
		if (pointInRect(x, y, this.newDreamRect)) {
			if (window.setMusicMode) window.setMusicMode("dream"); // Lucid Journey
			this.showHelp = false;
			this.showCredits = false;
			if (this.game.startGameplay) {
				this.game.startGameplay();
			} else {// fallback (shouldn't happen)
				this.game.mode = "gameplay";
				if (window.setMusicMode) window.setMusicMode("dream");
			}
			return;
		}
		if (pointInRect(x, y, this.creditsRect)) {
			this.showCredits = true;
			this.showHelp = false;
			this.showOptions = false;
			return;
		}
		if (pointInRect(x, y, this.loadDreamRect)) {
			console.log("TODO: Load Dream");
			return;
		}
		if (pointInRect(x, y, this.helpRect)) {
			this.showHelp = true;
			this.showOptions = false;
			this.showCredits = false;
			return;
		}
		if (pointInRect(x, y, this.optionsRect)) {
			this.showOptions = true;
			this.showHelp = false;
			this.showCredits = false;
			return;
		}
	}

 	inSelectLevelMenu(x, y) {
		// Back to room
		if (pointInRect(x, y, this.levelBackRect)) {
			this.transitionTo("room");
			return;
		}

		const currentWorldIndex = this.worldOrder.indexOf(this.currentWorld);
		const lastWorldIndex = this.worldOrder.length - 1;

		// Previous world
		if (currentWorldIndex > 0 && pointInRect(x, y, this.worldPrevRect)) {
			this.currentWorld = this.worldOrder[currentWorldIndex - 1];
			return;
		}

		// Next world
		if (currentWorldIndex < lastWorldIndex && pointInRect(x, y, this.worldNextRect)) {
			this.currentWorld = this.worldOrder[currentWorldIndex + 1];
			return;
		}

		// Click a level from the ACTIVE world
		const activeLevels = this.getActiveWorldTheme().levels;

		for (const rect of this.levelRects) {
			if (pointInRect(x, y, rect)) {
				const L = activeLevels[rect.levelIndex];
				if (!L || !L.unlocked) return;

				this.selectedLevel = L.id;

				if (this.game.startLevel) {
					this.game.startLevel(this.selectedLevel);
				} else {
					this.game.mode = "gameplay";
				}
				return;
			}
		}
	}

	inOptionsMenu(x, y) {
		if (!pointInRect(x, y, this.optionsPanelRect)) {
			this.showOptions = false;
			if (this.game.mode == "pause" && !this.game.gameOver) {
				this.game.mode = "gameplay";
			}
			return;
		}
		if (pointInRect(x, y, this.optionsCloseRect)) {
			this.showOptions = false;
			if (this.game.mode == "pause" && !this.game.gameOver) {
				this.game.mode = "gameplay";
			}
			return;
		}
		if (pointInRect(x, y, this.optMuteRect)) {
			if (window.Music) {
				Music.setMuted(!Music.muted);
				const muteEl = document.getElementById("mute");
				if (muteEl) muteEl.checked = Music.muted;
			}
			return;
		}
		if (pointInRect(x, y, this.optVolDownRect)) {
			if (window.Music) {
				Music.setVolume(Math.max(0, Music.userVolume - 0.05));
				const volEl = document.getElementById("volume");
				if (volEl) volEl.value = String(Music.userVolume);
			}
			return;
		}
		if (pointInRect(x, y, this.optVolUpRect)) {
			if (window.Music) {
				Music.setVolume(Math.min(1, Music.userVolume + 0.05));
				const volEl = document.getElementById("volume");
				if (volEl) volEl.value = String(Music.userVolume);
			}
			return;
		}
	}

    transitionTo(sceneKey) {
		if (this.transitioning) return;

		this.showHelp = false;
		this.showOptions = false;
		this.showCredits = false;

		this.transitioning = true;
		this.nextScene = sceneKey;
		this.fadeDir = 1;
	}

	// GUI Drawing

	drawMenuButton(ctx, r, label) {
		ctx.save();

		// ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
		// ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
		// ctx.lineWidth = 2;
		// roundRectPath(ctx, r.x, r.y, r.w, r.h, 18);
		// ctx.fill();
		// ctx.stroke();

		const hover =
			this.game.mouse && pointInRect(this.game.mouse.x, this.game.mouse.y, r);

		const bubble = hover ? this.btnBubbleHover : this.btnBubbleNormal;

		if (bubble) {
			ctx.drawImage(bubble, r.x, r.y, r.w, r.h);
		}

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
		roundRectPath(ctx, r.x, r.y, r.w, r.h, r.h / 2);
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

		if (this.scene === "levelSelect") {
			return this.getActiveWorldTheme().roomBg;
		}

		return ASSET_MANAGER.getAsset("./assets/background/menu/newDream.png");
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

	drawGlassCard(ctx, r, { hover = false, locked = false } = {}) {
		ctx.save();

		// soft shadow
		ctx.shadowColor = "rgba(0,0,0,0.35)";
		ctx.shadowBlur = 18;
		ctx.shadowOffsetY = 8;

		// frosted fill
		ctx.fillStyle = locked ? "rgba(20, 20, 35, 0.55)" : "rgba(255,255,255,0.12)";
		roundRect(ctx, r.x, r.y, r.w, r.h, 18);
		ctx.fill();

		// border
		ctx.shadowBlur = 0;
		ctx.lineWidth = 2;
		ctx.strokeStyle = locked ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.30)";
		ctx.stroke();

		// hover glow
		if (hover && !locked) {
			ctx.strokeStyle = "rgba(210, 200, 255, 0.55)";
			ctx.lineWidth = 3;
			roundRect(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 18);
			ctx.stroke();

			ctx.globalAlpha = 0.10;
			ctx.fillStyle = "white";
			roundRect(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 18);
			ctx.fill();
		}

		ctx.restore();
	}

	drawImageClipped(ctx, img, r, pad = 14) {
		if (!img) return;

		const ix = r.x + pad;
		const iy = r.y + pad;
		const iw = r.w - pad * 2;
		const ih = r.h - pad * 2;

		ctx.save();
		roundRect(ctx, ix, iy, iw, ih, 14);
		ctx.clip();

		// contain
		const scale = Math.min(iw / img.width, ih / img.height);
		const dw = img.width * scale;
		const dh = img.height * scale;
		const dx = ix + (iw - dw) / 2;
		const dy = iy + (ih - dh) / 2;

		ctx.drawImage(img, dx, dy, dw, dh);
		ctx.restore();
	}



	drawHelpModal(ctx) {
		const cw = this.game.ctx.canvas.width;
		const ch = this.game.ctx.canvas.height;


		//TODO: What does this block of code do? Backgrounds dim without it. Merge relic??----- 
		// Dim background
		ctx.save();
		ctx.fillStyle = "white";
		ctx.font = "700 46px serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.shadowColor = "rgba(0,0,0,0.7)";
		ctx.shadowBlur = 12;
		//ctx.fillText("Select Level", cw/2, titleY); //merge issue where does titleY come from?
		ctx.restore();
		// --------


		// Panel
		const p = this.helpPanelRect;

		ctx.save();
		ctx.fillStyle = "rgba(20, 24, 40, 0.85)";
		ctx.strokeStyle = "rgba(255,255,255,0.45)";
		ctx.lineWidth = 2;
		roundRectPath(ctx, p.x, p.y, p.w, p.h, 22);
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
			"- Deletes that node AND all nodes after it.\n\n" +
			"Return Key:\n" +
			"- Begins the next phase.\n\n" +
			"T Key:\n" +
			"- Takes the current dream bubble item.\n\n" +
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

	drawOptionsModal(ctx) {
		const cw = this.game.ctx.canvas.width;
		const ch = this.game.ctx.canvas.height;

		// Dim background
		ctx.save();
		ctx.globalAlpha = 0.55;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, cw, ch);
		ctx.restore();

		// Panel
		const p = this.optionsPanelRect;

		ctx.save();
		ctx.fillStyle = "rgba(20, 24, 40, 0.85)";
		ctx.strokeStyle = "rgba(255,255,255,0.45)";
		ctx.lineWidth = 2;
		roundRectPath(ctx, p.x, p.y, p.w, p.h, 22);
		ctx.fill();
		ctx.stroke();
		ctx.restore();

		// Title
		ctx.save();
		ctx.fillStyle = "rgba(255,255,255,0.95)";
		ctx.font = "700 28px serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("Options", p.x + p.w / 2, p.y + 18);
		ctx.restore();

		// Close button (X)
		this.drawCloseButton(ctx, this.optionsCloseRect);

		const muteLabel = window.Music && Music.muted ? "Unmute" : "Mute";
		const volPct = window.Music ? Math.round(Music.userVolume * 100) : 10;

		this.drawMenuButton(ctx, this.optMuteRect, muteLabel);
		this.drawMenuButton(ctx, this.optVolDownRect, "Vol -");
		this.drawMenuButton(ctx, this.optVolUpRect, `Vol + (${volPct}%)`);
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
		roundRectPath(ctx, p.x, p.y, p.w, p.h, 22);
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
		roundRectPath(ctx, r.x, r.y, r.w, r.h, 12);
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

	getActiveWorldTheme() {
		return this.worldThemes[this.currentWorld];
	}

	drawWrappedTextCentered(ctx, text, x, y, w, h, fontSize = 20) {
		ctx.save();
		ctx.fillStyle = "rgba(255,255,255,0.92)";
		ctx.font = `500 ${fontSize}px serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "top";

		const lines = [];
		const paragraphs = text.split("\n");

		for (const para of paragraphs) {
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

		const lineH = Math.floor(fontSize * 1.35);
		const startY = y;
		const maxLines = Math.floor(h / lineH);

		for (let i = 0; i < lines.length && i < maxLines; i++) {
			ctx.fillText(lines[i], x + w / 2, startY + i * lineH);
		}

		ctx.restore();
	}
}
