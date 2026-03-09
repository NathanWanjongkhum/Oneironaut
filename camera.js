//TODO: find vertical follow sweet spot
class Camera {
    constructor(game) {
        this.game = game;
        this.player = null;

        this.x = 0;
        this.y = 0;

        // Dead zone size (computed per screen in update()).
        this.marginX = this.game.ctx.canvas.width / 3;
        this.marginY = this.game.ctx.canvas.height / 3;

        this.worldTop = -500;
        this.worldBottom = 1300;

        // Minimal vertical drift.
        this.verticalFollow = 0.2;
    }

    clampY(screenH) {
        const maxY = Math.max(this.worldTop, this.worldBottom - screenH);
        this.y = Math.min(maxY, Math.max(this.worldTop, this.y));
    }

    snapToPlayer() {
        if (!this.player || !this.game?.ctx?.canvas) return;

        const screenW = this.game.ctx.canvas.width;
        const screenH = this.game.ctx.canvas.height;

        // Spawn in the middle; dead-zone logic handles margins afterward.
        this.x = this.player.x - screenW / 2;
        this.y = this.player.y - screenH / 2;
        this.clampY(screenH);
    }

    update() {
        if (!this.player || !this.game?.ctx?.canvas) return;

        let screenW = this.game.ctx.canvas.width;
        let screenH = this.game.ctx.canvas.height;

        // Keep a wide horizontal dead-zone and a larger vertical dead-zone
        // so vertical camera movement stays minimal.
        this.marginX = Math.max(150, Math.min(320, screenW * 0.22));
        this.marginY = Math.max(60, Math.min(120, screenH * 0.14));

        let playerScreenX = this.player.x - this.x;
        let playerScreenY = this.player.y - this.y;

        let targetX = this.x;
        let targetY = this.y;

        // If too far left
        if (playerScreenX < this.marginX) {
            targetX = this.player.x - this.marginX;
        }
        // If too far right
        if (playerScreenX > screenW - this.marginX) {
            targetX = this.player.x - (screenW - this.marginX);
        }

        // If too high
        if (playerScreenY < this.marginY) {
            targetY = this.player.y - this.marginY;
        }
        // If too low
        if (playerScreenY > screenH - this.marginY) {
            targetY = this.player.y - (screenH - this.marginY);
        }

        this.x = targetX;
        this.y += (targetY - this.y) * this.verticalFollow;

        this.clampY(screenH);
    }

    setPlayer(player) {
        this.player = player;
        this.snapToPlayer();
    }
}
