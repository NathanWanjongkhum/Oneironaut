class WaypointBuilder {
  constructor(game) {
    this.waypoints = [];
    this.game = game;
    this.game.waypoints = this.waypoints;
    this.lineColor = "#d0d0d0ff";
    this.nodeColor = "#ff00ff";
    this.pointColor = "#ffffff";
    //TODO: use gradient 
    // this.lineColor = game.ctx.createRadialGradient(100, 200, 100, 300, 60, 300);//TODO: adjust this so that the lines are visible

    // this.gradient.addColorStop("0", "#3259e3");//TODO: replace colors, use #555555 format to control transparency
    // this.gradient.addColorStop("0.5", "#25fbed");
    // this.gradient.addColorStop("1.0", "#f591cf");
  }

  draw(ctx) {
    if (this.game.inLevel === false) return;

    const camX = this.game.camera?.x ?? 0;
    const camY = this.game.camera?.y ?? 0;

    if (this.waypoints.length > 0) {
      // World-space path rendering with camera offset, isolated from other draws.
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(-camX, -camY);

      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      if (this.waypoints.length > 1) {
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 0; i < this.waypoints.length - 1; i++) {
          const from = this.waypoints[i];
          const to = this.waypoints[i + 1];
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
        }
        ctx.stroke();
      }

      // Node styling: colored core + white center + white outer ring.
      for (const point of this.waypoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.lineColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = this.pointColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Mouse preview stays in screen space.
    if (this.game.mouse) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = this.nodeColor;
      ctx.beginPath();
      ctx.arc(this.game.mouse.x, this.game.mouse.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  update() {
    if (this.game.mode !== "gameplay" || this.game.gameOver) return;

    if (this.game.click) {
      const click = this.game.click;
      const p = click.space === "world"
        ? { x: click.x, y: click.y }
        : this.game.screenToWorld(click.x, click.y);

      this.addPoint(p.x, p.y);
      this.game.holdCameraThisFrame = true;
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
    this.game.playSFX?.("pathPointPlace", 0.85);
  }
}
