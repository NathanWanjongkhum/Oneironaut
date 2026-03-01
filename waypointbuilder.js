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
    if (this.game.mouse) {
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(this.game.mouse.x, this.game.mouse.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  update() {
    if (this.game.mode !== "gameplay" || this.game.gameOver) return;

    if (this.game.click) {
      this.addPoint(this.game.click.x, this.game.click.y);
      this.game.click = null; 
    }
  }

  addPoint(x, y) {
    // Prevent placing nodes too close together
    if (this.waypoints.length > 0) {
      const lastWp = this.waypoints[this.waypoints.length - 1];
      const dist = Math.sqrt((x - lastWp.x) ** 2 + (y - lastWp.y) ** 2);

      if (dist < 10) {
        return;
      }
    }

    this.waypoints.push({ x: x, y: y });
  }
}
