class WaypointBuilder {
  constructor(game) {
    this.waypoints = [];
    this.game = game;
    this.game.waypoints = this.waypoints;
  }

draw(ctx) {
    if (this.waypoints.length === 0) return;
    if (this.game.inLevel === false) return;

    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; 
    ctx.shadowBlur = 2;                     
    ctx.shadowOffsetX = 2;                 
    ctx.shadowOffsetY = 2;                  

    // Draw waypoints
    ctx.fillStyle = "white";       
    ctx.strokeStyle = "white";     
    ctx.lineWidth = 2;            

    for (let point of this.waypoints) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    
    // Draw from SleepyGuy to the first waypoint
    if (this.game.sleepyGuy && this.waypoints.length > 0) {
      ctx.moveTo(this.game.sleepyGuy.x, this.game.sleepyGuy.y);
      ctx.lineTo(this.waypoints[0].x, this.waypoints[0].y);
    }

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const from = this.waypoints[i];
      const to = this.waypoints[i + 1];
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
    }
    ctx.stroke();

    // Draw current mouse position as a waypoint preview
    if (this.game.mouse) {
      ctx.fillStyle = "lightblue";
      ctx.beginPath();
      ctx.arc(this.game.mouse.x, this.game.mouse.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
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