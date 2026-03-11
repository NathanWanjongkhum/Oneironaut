class Levels {
    static buildLevel(engine) {
        // const world = engine.currentWorld || "daydream";

        const levelMap = {
            0: this.tutorial,
            1: this.level1,
            2: this.level2,
            3: this.level3,
            4: this.level4,
            5: this.level5,
            6: this.level6,
        };

        //TODO: put bed and sleepyguy in different location for each level rather than having them built here
        // engine.addEntity(new Bed(engine, 700, 300)); //This can get placed in each function with a unique location
        // engine.addEntity(new SleepyGuy(engine, 100, 100)); //This can get placed in each function with a unique location
        // if (!engine.entities.some(e => e instanceof Bed)) engine.addEntity(new Bed(engine, 1080, 420));
        (levelMap[engine.currentLevel] || this.defaultLevel)(engine); //Keep this last to ensure layer ordering
        engine.addEntity(new WaypointBuilder(engine));
    }

    static defaultLevel(engine) {
        this?.tutorial(engine);
    }

    static tutorial(engine) {
        // engine.addEntity(new Ghost(engine, 700, 50));
        // // Collection of some items - for demonstration purposes
        // engine.addEntity(new PickupItem(engine, 220, 140, "Sword"));
        // engine.addEntity(new PickupItem(engine, 280, 140, "ToothBrush"));
        engine.addEntity(new PickupItem(engine, 340, 140, "TeddyBear"));

        // engine.addEntity(new PickupItem(engine, 220, 220, "DreamCatcher"));
        engine.addEntity(new PickupItem(engine, 280, 220, "Rocket"));
        // engine.addEntity(new PickupItem(engine, 340, 220, "Pajama"));
    }

    static level1(engine) {
        engine.addEntity(new Bed(engine, 980, 250));
        engine.addEntity(new PickupItem(engine, 92, 60, "Pajama"));
        engine.addEntity(new PickupItem(engine, 170, 350, "Sword"));
        engine.addEntity(new PickupItem(engine, 400, 350, "SleepDust"));
        engine.addEntity(new PickupItem(engine, 430, 100, "TeddyBear"));

        const builder = new LevelBuilder(engine);
        builder.spawnRow(5, 18, 20);
        builder.spawnRow(20, 18, 20);

        engine.addEntity(new Ghost(engine, 80, 480));
        engine.addEntity(new Ghost(engine, 765, 520));
        engine.addEntity(new Ghost(engine, 750, 65));
        engine.addEntity(new Sheep(engine, 542, 80))
        engine.addEntity(new Sheep(engine, 542, 520))


        const spiderPath = [
            { x: 400, y: 0 },
            { x: 600, y: 0 },
            { x: 500, y: 30 },
            { x: 400, y: 10 },
        ];
        engine.addEntity(new Spider(engine, spiderPath));
        engine.addEntity(new SleepyGuy(engine, 70, 150));
    }

    static level2(engine) {
        engine.addEntity(new Bed(engine, 1030, 420));
        engine.addEntity(new PickupItem(engine, 50, 140, "SandBag3"));
        engine.addEntity(new PickupItem(engine, 723, 680, "TeddyBear"));
        engine.addEntity(new PickupItem(engine, 150, 600, "DreamCatcher"));
        engine.addEntity(new PickupItem(engine, 470, 510, "SleepMask"));
        engine.addEntity(new PickupItem(engine, 360, 180, "TheStrangeLamp"));

        const builder = new LevelBuilder(engine);
        builder.spawnRow(15, 0, 6);
        builder.spawnColumn(12, 4, 11);
        builder.spawnRow(12, 32, 13);
        builder.spawnRow(18, 12, 18);
        builder.spawnRow(4, 13, 14);

        engine.addEntity(new Demon(engine, 520, 170));
        engine.addEntity(new Sheep(engine, 385, 70));
        engine.addEntity(new Spikes(engine, 485, 540));
        engine.addEntity(new Spikes(engine, 450, 540));

        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;

        const spiderRow = 16;
        const spiderLeftCol = 17;
        const spiderRightCol = 26;

        const spiderPath = [
            { x: gx(spiderLeftCol), y: gy(spiderRow) },
            { x: gx(spiderRightCol), y: gy(spiderRow) },
        ];

        engine.addEntity(new Spider(engine, spiderPath));

        const postCol = 24;
        builder.spawnColumn(postCol, 18, 22);

        engine.addEntity(new Ghost(engine, 1080, 180));
        engine.addEntity(new SleepyGuy(engine, 160, 460));
    }

    static level3(engine) {
        engine.addEntity(new Bed(engine, 1030, 200));

        engine.addEntity(new PickupItem(engine, 170, 500, "Sword"));
        engine.addEntity(new PickupItem(engine, 600, 350, "SandBag3"));
        engine.addEntity(new PickupItem(engine, 260, 810, "SleepDust"));
        engine.addEntity(new PickupItem(engine, 130, 500, "ToothBrush"));
        engine.addEntity(new PickupItem(engine, 35, 180, "Rocket"));

        const builder = new LevelBuilder(engine);

        // Helpers
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;


        builder.spawnColumn(6, 5, 14);

        builder.spawnRow(10, 6, 15);
        builder.spawnColumn(15, 8, 9);
        builder.spawnRow(8, 15, 20);
        builder.spawnColumn(20, 8, 13);
        builder.spawnRow(13, 20, 25);
        builder.spawnColumn(22, 6, 13);
        builder.spawnColumn(23, 6, 13);
        builder.spawnRow(12, 25, 30);


        engine.addEntity(new StickyBush(engine, gx(17), gy(6)));
        engine.addEntity(new Ghost(engine, gx(8), gy(5)));
        engine.addEntity(new Sheep(engine, gx(22), gy(3)));
        engine.addEntity(new Ghost(engine, gx(24), gy(7)));

        for (let c = 8; c <= 12; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(13)));
        }

        for (let c = 1; c <= 15; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(21)));
        }


        // Spider timing gate: move patrol RIGHT so bottom lane has less “free runway”
        const spiderRow = 18;
        const spiderLeftCol = 16;
        const spiderRightCol = 31;

        const spiderPath = [
            { x: gx(spiderLeftCol), y: gy(spiderRow) },
            { x: gx(spiderRightCol), y: gy(spiderRow) },
        ];

        engine.addEntity(new Spider(engine, spiderPath));
        engine.addEntity(new SleepyGuy(engine, 130, 80));
    };

    static level4(engine) {
        engine.addEntity(new Bed(engine, 1030, 30));
        engine.addEntity(new PickupItem(engine, 130, 15, "Pajama"));
        engine.addEntity(new PickupItem(engine, 130, 320, "Sword"));
        engine.addEntity(new PickupItem(engine, 300, 190, "SleepDust"));
        engine.addEntity(new PickupItem(engine, 1200, 650, "Rocket"));

        const builder = new LevelBuilder(engine);

        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;

        builder.spawnColumn(7, 0, 8);
        builder.spawnColumn(7, 14, 24);

        // Spider patrol across the GAP 
        const gapRow = 11;
        const spiderLeftCol = 3;
        const spiderRightCol = 12;

        const spiderPath = [
            { x: gx(spiderLeftCol), y: gy(gapRow) },
            { x: gx(spiderRightCol), y: gy(gapRow) },
        ];
        engine.addEntity(new Spider(engine, spiderPath));


        // GAUNTLET: 2 arms
        const armStartCol = 7;
        const armLen = 22;
        const topArmRow = 4;
        const bottomArmRow = 18;

        builder.spawnRow(topArmRow, armStartCol, armLen);
        builder.spawnRow(bottomArmRow, armStartCol, armLen);

        // Close the gauntlet: right wall
        const rightCol = armStartCol + armLen - 1; // 28
        builder.spawnColumn(rightCol, topArmRow, bottomArmRow);

        builder.spawnColumn(16, topArmRow + 1, topArmRow + 3);
        builder.spawnColumn(20, bottomArmRow - 5, bottomArmRow - 1);

        // small ledge ABOVE the bottom tooth 
        const ledgeRow = bottomArmRow - 6;
        const ledgeStartCol = 18;
        const ledgeLen = 2;

        builder.spawnRow(ledgeRow, ledgeStartCol, ledgeLen);

        // Place bush on the ledge 
        engine.addEntity(new StickyBush(engine, gx(ledgeStartCol + 1), gy(ledgeRow)));

        // HAZARDS: spikes (short strip)
        for (let c = 10; c <= 13; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(bottomArmRow - 1)));
        }

        engine.addEntity(new Ghost(engine, gx(18), gy(4)));
        engine.addEntity(new VenusFlyTrap(engine, gx(24), gy(12)));
        engine.addEntity(new Demon(engine, gx(27), gy(7)));
        engine.addEntity(new SleepyGuy(engine, 130, 80));
    }

    static level5(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;
        engine.addEntity(new Bed(engine, gx(30), gy(3)));

        engine.addEntity(new PickupItem(engine, gx(6), gy(5), "Sword"));
        engine.addEntity(new PickupItem(engine, gx(9), gy(9), "SleepDust"));
        engine.addEntity(new PickupItem(engine, gx(21), gy(3), "TeddyBear"));

        const builder = new LevelBuilder(engine);

        builder.spawnRow(1, 1, 39);
        builder.spawnColumn(1, 1, 25);
        builder.spawnColumn(39, 1, 25);
        builder.spawnColumn(23, 3, 13);
        builder.spawnRow(20, 1, 15);
        builder.spawnRow(22, 1, 39);

        builder.spawnColumn(11, 8, 20);
        builder.spawnRow(8, 11, 13);
        //builder.spawnRow(20, 14, 28);

        builder.spawnColumn(23, 8, 13);

        engine.addEntity(new Sheep(engine, gx(11), gy(6)));
        engine.addEntity(new Demon(engine, gx(11), gy(15)));
        for (let c = 23; c <= 34; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(21)));
        }
        const spiderPath = [
            { x: gx(24), y: gy(12) },
            { x: gx(35), y: gy(12) }
        ];
        engine.addEntity(new Spider(engine, spiderPath));
        engine.addEntity(new SleepyGuy(engine, gx(4), gy(15)));
    }

    static level6(engine) {
        //TODO - build this level
        engine.addEntity(new Bed(engine, 1030, 30));
        engine.addEntity(new SleepyGuy(engine, 130, 80));
    }
    static level7(engine) {
        //TODO - build this level
        engine.addEntity(new Bed(engine, 1030, 30));
        engine.addEntity(new SleepyGuy(engine, 130, 80));
    }
}