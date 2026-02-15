class LevelBuilder {
    constructor(game) {
        this.game = game;
        this.occupiedCells = new Set();
    }

    /**
     * @param {number} gx - Grid X (Column)
     * @param {number} gy - Grid Y (Row)
     */
    spawnBlock(gx, gy) {
        const cellKey = `${gx},${gy}`;

        // Prevent overlapping blocks
        if (this.occupiedCells.has(cellKey)) {
            if (PARAMS.DEBUG) console.warn(`Block placement rejected at ${gx},${gy}: Already occupied.`);
            return;
        }

        // Stay within Canvas bounds
        const canvasX = gx * PARAMS.BLOCKWIDTH;
        const canvasY = gy * PARAMS.BLOCKWIDTH;

        if (canvasX < 0 || canvasX >= PARAMS.CANVAS_WIDTH || 
            canvasY < 0 || canvasY >= PARAMS.CANVAS_HEIGHT) {
            if (PARAMS.DEBUG) console.warn(`Block placement rejected: Out of bounds.`);
            return;
        }

        this.game.addEntity(new Block(this.game, canvasX, canvasY));
        this.occupiedCells.add(cellKey);
    }

    spawnRow(gy, startGx, endGx) {
        for (let x = startGx; x <= endGx; x++) {
            this.spawnBlock(x, gy);
        }
    }

    spawnColumn(gx, startGy, endGy) {
        for (let y = startGy; y <= endGy; y++) {
            this.spawnBlock(gx, y);
        }
    }
}