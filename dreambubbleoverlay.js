// DreamBubbleOverlay.js
// Key B toggles bubble. Bubble hides if SleepyGuy moves.
// Holds max ONE bubbleOnly item. Starts empty.
// Tunable item centering: iconScale, iconOffX, iconOffY.

class DreamBubbleOverlay {
    constructor(game) {
        this.game = game;

        this.isOpen = false;
        this.item = null; // { id, img }

        this.lastSGX = null;
        this.lastSGY = null;

        this.bubbleRect = { x: 0, y: 0, w: 0, h: 0 };

        // Bubble sprite (matches your current setup)
        this.bubbleImg = null;


        this.iconScale = 0.90;
        this.iconOffX = 8;
        this.iconOffY = -18;
    }

    // Only one item can be stored
    storeItem(item) {
        if (this.item) return false;
        this.item = item; // { id, img }
        return true;
    }

    open() {
        const sg = this.game.sleepyGuy;
        if (!sg) return;

        this.isOpen = true;
        this.lastSGX = sg.x;
        this.lastSGY = sg.y;
        // start empty: do not auto-roll
    }

    close(clearItem = false) {
        this.isOpen = false;

        if (clearItem) {
            this.item = null;
            this.lastSGX = null;
            this.lastSGY = null;
        }
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    update() {
        if (this.game.mode !== "gameplay") {
            this.close();
            return;
        }

        const sg = this.game.sleepyGuy;
        if (!sg) {
            this.close();
            return;
        }

        // Load bubble sprite once assets are ready
        if (!this.bubbleImg) {
            this.bubbleImg =
                ASSET_MANAGER.getAsset("./assets/items/DreamBubble.png") ||
                ASSET_MANAGER.getAsset("./assets/ui/DreamBubble.png") ||
                ASSET_MANAGER.getAsset("./assets/DreamBubble.png") ||
                ASSET_MANAGER.getAsset("./DreamBubble.png") ||
                null;
        }

        // If SleepyGuy moved -> bubble hides (but KEEP stored item)
        const moved =
            this.lastSGX !== null &&
            (Math.abs(sg.x - this.lastSGX) > 0.5 || Math.abs(sg.y - this.lastSGY) > 0.5);

        if (moved) {
            this.isOpen = false;
            this.lastSGX = sg.x;
            this.lastSGY = sg.y;
            return;
        }

        this.lastSGX = sg.x;
        this.lastSGY = sg.y;

        if (!this.isOpen) return;

        // ===== Position bubble up-left of SleepyGuy =====
        const w = 150;
        const h = 150;

        // Use SleepyGuy center if BB exists
        const sgW = sg.BB ? sg.BB.width : 60;
        const sgH = sg.BB ? sg.BB.height : 60;
        const sgCx = sg.BB ? sg.BB.x + sgW / 2 : sg.x;
        const sgCy = sg.BB ? sg.BB.y + sgH / 2 : sg.y;

        // UP-LEFT offsets (tweak if you want)
        const offsetX = 30; // left
        const offsetY = -180; // up

        let x = sgCx + offsetX;
        let y = sgCy + offsetY;

        // Keep bubble fully on-screen
        const cw = this.game.ctx.canvas.width;
        const ch = this.game.ctx.canvas.height;
        const margin = 10;

        x = Math.max(margin, Math.min(cw - w - margin, x));
        y = Math.max(margin, Math.min(ch - h - margin, y));

        this.bubbleRect = { x, y, w, h };

        // Consume clicks inside the bubble so it doesn't place waypoints, etc.
        if (this.game.click) {
            const { x: cx, y: cy } = this.game.click;
            if (this.pointInRect(cx, cy, this.bubbleRect)) {
                this.game.click = null;
            }
        }
    }

    draw(ctx) {
        if (!this.isOpen || this.game.gameOver) return;

        const r = this.bubbleRect;

        // Draw bubble sprite
        if (this.bubbleImg) {
            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(this.bubbleImg, r.x, r.y, r.w, r.h);
            ctx.restore();
        } else {
            // fallback if image missing
            ctx.save();
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.strokeStyle = "rgba(255,255,255,0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Draw stored item centered in the bubble (TUNABLE)
        if (this.item && this.item.img) {
            const img = this.item.img;

            const iw = img.width;
            const ih = img.height;

            const cx = r.x + r.w / 2;
            const cy = r.y + r.h / 2;

            // Max icon size relative to bubble (keeps consistent)
            const maxW = r.w * 0.42;
            const maxH = r.h * 0.42;

            const scale = this.iconScale * Math.min(maxW / iw, maxH / ih);
            const dw = iw * scale;
            const dh = ih * scale;

            ctx.save();
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(
                img,
                (cx - dw / 2) + this.iconOffX,
                (cy - dh / 2) + this.iconOffY,
                dw,
                dh
            );
            ctx.restore();
        }
    }

    pointInRect(px, py, r) {
        return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }
}