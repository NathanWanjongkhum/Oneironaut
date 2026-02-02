class WaypointBuilder {
    constructor(game) {
        this.waypoints = [];
        this.game = game;
        this.game.waypoints = this.waypoints;
    }

    draw(ctx) {
        if (this.waypoints.length === 0) return;
        if (this.game.inLevel === false) return;
        
        // Draw waypoints
        ctx.fillStyle = "red";
        ctx.beginPath();
        for (let point of this.waypoints) {
            ctx.moveTo(point.x, point.y);
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        }
        ctx.fill();

        // Draw lines between waypoints
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.waypoints.length - 1; i++) {
            const from = this.waypoints[i];
            const to = this.waypoints[i + 1];
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
        }
        ctx.stroke();

        // Draw current mouse position as a waypoint preview
        if (gameEngine.mouse) {
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(gameEngine.mouse.x, gameEngine.mouse.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    update() {
        if (this.game.mode !== "gameplay" || this.game.gameOver) return;
        // Add waypoint on click
        if (gameEngine.click) {
            this.addPoint(gameEngine.click.x, gameEngine.click.y);
        }
    }

    addPoint(x, y) {
        this.waypoints.push({ x: x, y: y });
    }
}