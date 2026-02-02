class GameEngine {
    constructor(options) {

        this.ctx = null;
        this.entities = [];

        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.gameOver = false;
        this.gameWon = false;
        this.clockTick = 0;
        this.timer = new Timer();
        this.mode = "menu"; //"menu" || "gameplay"

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
        this.inLevel = true;

    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
    }

    start() {
        const loop = () => {
            this.loop();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    startInput() {
        const canvas = this.ctx.canvas;

        // Click
        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();

            // convert from CSS pixels -> canvas internal pixels
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            this.click = {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        });

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        this.mouse = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    });

    window.addEventListener("keydown", (e) => {
        this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
    });
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  update() {
        for (let i = 0; i < this.entities.length; i++) {
            const ent = this.entities[i];
            if (!ent.removeFromWorld && ent.update) ent.update();
        }

        // remove entities marked for deletion
        this.entities = this.entities.filter(e => !e.removeFromWorld);
  }

    draw() {
        // clear whole canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (let i = 0; i < this.entities.length; i++) {
            const ent = this.entities[i];
            if (ent.draw) ent.draw(this.ctx);
        }
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}