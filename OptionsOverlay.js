class OptionsOverlay {
	constructor(game) {
		this.game = game;
		this.isOpen = true;

		this.panelRect = { x: 0, y: 0, w: 0, h: 0 };
		this.closeRect = { x: 0, y: 0, w: 44, h: 44 };

		this.optMuteRect = { x: 0, y: 0, w: 0, h: 0 };
		this.optVolDownRect = { x: 0, y: 0, w: 0, h: 0 };
		this.optVolUpRect = { x: 0, y: 0, w: 0, h: 0 };
	}

	update(cw, ch) {
		// Panel sizing (matches your MenuRoomController options modal)
		this.panelRect.w = Math.min(720, cw * 0.70);
		this.panelRect.h = Math.min(360, ch * 0.50);
		this.panelRect.x = (cw - this.panelRect.w) / 2;
		this.panelRect.y = (ch - this.panelRect.h) / 2;

		// Close button (top-right)
		this.closeRect.w = 44;
		this.closeRect.h = 44;
		this.closeRect.x = this.panelRect.x + this.panelRect.w - this.closeRect.w - 12;
		this.closeRect.y = this.panelRect.y + 12;

		// Buttons inside panel
		const p = this.panelRect;
		const btnW = Math.min(260, p.w * 0.55);
		const btnH = 56;
		const cx = p.x + p.w / 2 - btnW / 2;

		this.optMuteRect = { x: cx, y: p.y + 110, w: btnW, h: btnH };
		this.optVolDownRect = { x: cx, y: p.y + 110 + 80, w: (btnW - 16) / 2, h: btnH };
		this.optVolUpRect = { x: cx + (btnW + 16) / 2, y: p.y + 110 + 80, w: (btnW - 16) / 2, h: btnH };
	}

	handleClick(x, y) {
		// Close X
		if (this.pointInRect(x, y, this.closeRect)) {
			this.isOpen = false;
			return true;
		}

		// Buttons
		if (this.pointInRect(x, y, this.optMuteRect)) {
			if (window.Music) Music.setMuted(!Music.muted);
			return true;
		}

		if (this.pointInRect(x, y, this.optVolDownRect)) {
			if (window.Music) Music.setVolume(Math.max(0, Music.userVolume - 0.05));
			return true;
		}

		if (this.pointInRect(x, y, this.optVolUpRect)) {
			if (window.Music) Music.setVolume(Math.min(1, Music.userVolume + 0.05));
			return true;
		}

		// Click outside closes
		const p = this.panelRect;
		const inside = x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;
		if (!inside) {
			this.isOpen = false;
			return true;
		}

		return true; // consume clicks while open
	}

	draw(ctx, cw, ch) {
		// Dim background
		ctx.save();
		ctx.globalAlpha = 0.55;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, cw, ch);
		ctx.restore();

		// Panel
		const p = this.panelRect;

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
		ctx.fillText("Options", p.x + p.w / 2, p.y + 18);
		ctx.restore();

		// Close X
		this.drawCloseButton(ctx, this.closeRect);

		// Labels
		const muteLabel = (window.Music && Music.muted) ? "Unmute" : "Mute";
		const volPct = (window.Music ? Math.round(Music.userVolume * 100) : 10);

		// Buttons (same visual as menu buttons)
		this.drawMenuButton(ctx, this.optMuteRect, muteLabel);
		this.drawMenuButton(ctx, this.optVolDownRect, "Vol -");
		this.drawMenuButton(ctx, this.optVolUpRect, `Vol + (${volPct}%)`);
	}

	// ===== Drawing helpers (copied from your MenuRoomController style) =====
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