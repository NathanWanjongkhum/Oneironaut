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
            7: this.level7,
            8: this.level8,
            9: this.level9,
            10: this.level10,
            11: this.level11,
            12: this.level12,
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
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;

        // =========================================================
        // SPAWN / GOAL
        // =========================================================
        engine.addEntity(new SleepyGuy(engine, gx(4), gy(18)));
        engine.addEntity(new Bed(engine, gx(35), gy(4)));

        // =========================================================
        // ITEMS
        // =========================================================
        engine.addEntity(new PickupItem(engine, gx(6), gy(17), "SleepDust"));
        engine.addEntity(new PickupItem(engine, gx(31), gy(10), "SandBag3"));
        engine.addEntity(new PickupItem(engine, gx(23), gy(17), "Rocket"));
        engine.addEntity(new PickupItem(engine, gx(14), gy(6), "TeddyBear"));

        const builder = new LevelBuilder(engine);

        // =========================================================
        // OUTER BORDER
        // =========================================================
        builder.spawnRow(2, 2, 60);
        builder.spawnRow(21, 2, 60);
        builder.spawnColumn(2, 2, 40);
        builder.spawnColumn(50, 2, 40);

        // =========================================================
        // MAIN MAZE WALLS
        // All doorways are 5 tiles tall so every entity can pass.
        // Route pattern:
        // start lower-left -> up opening -> down opening -> up opening -> bed
        // =========================================================

        // Wall 1: opening low
        // gap rows 15..19
        //builder.spawnColumn(10, 2, 14);
        builder.spawnColumn(10, 25, 21);

        // Wall 4: opening high
        // gap rows 4..8
        builder.spawnColumn(34, 2, 3);
        builder.spawnColumn(34, 9, 21);

        // =========================================================
        // SHORT LEDGES / MAZE DETAIL
        // These add maze feeling without sealing the player in.
        // =========================================================

        builder.spawnRow(14, 28, 32);

        // =========================================================
        // HAZARDS
        // Keep hazards away from the actual doorway paths.
        // =========================================================
        for (let c = 21; c <= 23; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(6)));
        }

        for (let c = 29; c <= 31; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(18)));
        }

        engine.addEntity(new StickyBush(engine, gx(22), gy(12)));

        // =========================================================
        // ENEMIES
        // Spread out by chamber so it feels fair.
        // =========================================================
        engine.addEntity(new Demon(engine, gx(6), gy(11)));
        engine.addEntity(new Ghost(engine, gx(21), gy(5)));
        engine.addEntity(new Ghost(engine, gx(28), gy(14)));
        engine.addEntity(new Ghost(engine, gx(28), gy(5)));
        engine.addEntity(new Sheep(engine, gx(29), gy(10)));

        engine.addEntity(new Spider(engine, [
            { x: gx(12), y: gy(19) },
            { x: gx(16), y: gy(19) }
        ]));
    }

    static level7(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;

        engine.addEntity(new Bed(engine, gx(45), gy(18)));
        engine.addEntity(new SleepyGuy(engine, gx(4), gy(4)));

        engine.addEntity(new PickupItem(engine, gx(6), gy(5), "DreamCatcher"));
        engine.addEntity(new PickupItem(engine, gx(18), gy(11), "SleepMask"));
        engine.addEntity(new PickupItem(engine, gx(29), gy(17), "TheStrangeLamp"));

        const builder = new LevelBuilder(engine);

        builder.spawnRow(2, 2, 37);
        builder.spawnRow(21, 2, 37);
        builder.spawnColumn(2, 2, 21);
        builder.spawnColumn(37, 2, 21);

        builder.spawnRow(7, 10, 24);
        builder.spawnRow(12, 6, 28);
        builder.spawnRow(17, 10, 34);

        for (let c = 14; c <= 18; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(20)));
        }
        for (let c = 27; c <= 31; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(11)));
        }

        engine.addEntity(new Ghost(engine, gx(5), gy(5)));
        engine.addEntity(new Demon(engine, gx(20), gy(10)));
        engine.addEntity(new Ghost(engine, gx(32), gy(15)));
        engine.addEntity(new VenusFlyTrap(engine, gx(24), gy(18)));

        engine.addEntity(new Spider(engine, [
            { x: gx(27), y: gy(6) },
            { x: gx(35), y: gy(6) },
        ]));

        engine.addEntity(new Spider(engine, [
            { x: gx(4), y: gy(19) },
            { x: gx(12), y: gy(19) },
        ]));
    }

    static level8(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW;
        const gy = (r) => r * BW;

        engine.addEntity(new Bed(engine, gx(41), gy(3)));
        engine.addEntity(new SleepyGuy(engine, gx(5), gy(18)));

        engine.addEntity(new PickupItem(engine, gx(16), gy(14), "Pajama"));
        engine.addEntity(new PickupItem(engine, gx(12), gy(6), "SleepDust"));
        engine.addEntity(new PickupItem(engine, gx(24), gy(15), "DreamCatcher"));
        engine.addEntity(new PickupItem(engine, gx(31), gy(5), "TheStrangeLamp"));

        const builder = new LevelBuilder(engine);

        builder.spawnRow(2, 3, 40);
        builder.spawnRow(20, 3, 40);
        builder.spawnColumn(3, 2, 20);
        builder.spawnColumn(39, 2, 20);

        builder.spawnRow(11, 3, 15);
        builder.spawnColumn(19, 2, 8);
        builder.spawnColumn(21, 11, 20);

        builder.spawnRow(6, 19, 30);

        for (let c = 16; c <= 20; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(10)));
        }
        for (let c = 22; c <= 25; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(12)));
        }

        engine.addEntity(new StickyBush(engine, gx(21), gy(9)));
        engine.addEntity(new Ghost(engine, gx(9), gy(5)));
        engine.addEntity(new Ghost(engine, gx(24), gy(10)));
        engine.addEntity(new Demon(engine, gx(24), gy(6)));
        engine.addEntity(new Sheep(engine, gx(14), gy(17)));
        engine.addEntity(new VenusFlyTrap(engine, gx(31), gy(15)));

        engine.addEntity(new Spider(engine, [
            { x: gx(7), y: gy(9) },
            { x: gx(16), y: gy(9) },
        ]));

        engine.addEntity(new Spider(engine, [
            { x: gx(23), y: gy(14) },
            { x: gx(33), y: gy(14) },
        ]));
    }

    /*    static level6(engine) {
            const BW = PARAMS.BLOCKWIDTH;
            const gx = (c) => c * BW;
            const gy = (r) => r * BW;
            engine.addEntity(new Bed(engine, gx(30), gy(5)));
    
            engine.addEntity(new PickupItem(engine, gx(6), gy(5), "TheStrangeLamp"));
            engine.addEntity(new PickupItem(engine, gx(13), gy(9), "Sword"));
            engine.addEntity(new PickupItem(engine, gx(21), gy(3), "ToothBrush"));
    
            const builder = new LevelBuilder(engine);
    
            builder.spawnRow(1, 1, 39);
            builder.spawnColumn(1, 1, 25);
            builder.spawnColumn(39, 1, 25);
           // builder.spawnRow(20, 1, 15);
            builder.spawnRow(22, 1, 39);
    
            builder.spawnColumn(9, 6, 10);
            builder.spawnColumn(9, 13, 17);
            builder.spawnColumn(9, 21, 24);
            builder.spawnColumn(16, 1, 6);
            builder.spawnRow(6, 10, 18);
            builder.spawnColumn(18,7,12); 
            builder.spawnColumn(18,17,22); 
            builder.spawnRow(17, 18, 23);
            builder.spawnColumn(23, 13, 16);
            builder.spawnRow(13, 23, 25);
            builder.spawnColumn(30, 9, 13);
    
            engine.addEntity(new Spikes(engine, gx(9), gy(17)));
            engine.addEntity(new Spikes(engine, gx(9), gy(20)));
            engine.addEntity(new Spikes(engine, gx(9), gy(21)));
               for (let c = 26; c <= 29; c++) {
                engine.addEntity(new Spikes(engine, gx(c), gy(13)));
            }
    
            //engine.addEntity(new Sheep(engine, gx(11), gy(6)));
            //engine.addEntity(new Demon(engine, gx(11), gy(15)));
              for (let c = 23; c <= 34; c++) {
                engine.addEntity(new Spikes(engine, gx(c), gy(21)));
            }
            const spiderPath1 = [
                { x: gx(10), y: gy(19) },
                { x: gx(16), y: gy(20) }
            ];
            for (let c = 23; c <= 34; c++) {
                engine.addEntity(new Spikes(engine, gx(c), gy(21)));
            }
            const spiderPath2 = [
                { x: gx(30), y: gy(12) },
                { x: gx(38), y: gy(12) }
            ];
            engine.addEntity(new Ghost(engine, gx(16), gy(12)));
            engine.addEntity(new Spider(engine, spiderPath1));
            engine.addEntity(new Spider(engine, spiderPath2));
            engine.addEntity(new StickyBush(engine, gx(23), gy(11)));
            engine.addEntity(new Demon(engine, gx(28), gy(4)));
            engine.addEntity(new SleepyGuy(engine, gx(4), gy(15)));
        }
        static level7(engine) {
            const BW = PARAMS.BLOCKWIDTH;
            const gx = (c) => c * BW;
            const gy = (r) => r * BW;
            engine.addEntity(new Bed(engine, gx(31), gy(10)));
    
            engine.addEntity(new PickupItem(engine, gx(6), gy(5), "TheStrangeLamp"));
            engine.addEntity(new PickupItem(engine, gx(13), gy(9), "Sword"));
            engine.addEntity(new PickupItem(engine, gx(21), gy(3), "ToothBrush"));
    
            const builder = new LevelBuilder(engine);
    
            builder.spawnRow(1, 1, 39);
            builder.spawnColumn(1, 1, 25);
            builder.spawnColumn(39, 1, 7);
            builder.spawnColumn(39, 15, 25);
           // builder.spawnRow(20, 1, 15);
            builder.spawnRow(22, 1, 33);
            builder.spawnRow(22, 39, 39);
    
            builder.spawnColumn(9, 6, 14);
            builder.spawnColumn(9,18, 23);
            builder.spawnRow(6,9,14);
            builder.spawnRow(19,9,23);
            builder.spawnColumn(23, 18, 23)
            builder.spawnColumn(23, 1, 6);
            builder.spawnRow(10,23,34);
            builder.spawnColumn(23, 10, 17);
      
    
              for (let c = 2; c <= 8; c++) {
                engine.addEntity(new Spikes(engine, gx(c), gy(5)));
            }
             for (let c = 15; c <= 22; c++) {
                engine.addEntity(new Spikes(engine, gx(c), gy(5)));
            }
             for (let c = 35; c <= 38; c++) {
                engine.addEntity(new Spikes(engine, gx(c), gy(10)));
            }
            engine.addEntity(new StickyBush(engine, gx(39), gy(8)));
            engine.addEntity(new VenusFlyTrap(engine, gx(34), gy(12)));
            engine.addEntity(new Demon(engine, gx(34), gy(20)));
    
            const spiderPath1 = [
                { x: gx(9), y: gy(16) },
                { x: gx(17), y: gy(18) }
            ];
        
            const spiderPath2 = [
                { x: gx(22), y: gy(8) },
                { x: gx(29), y: gy(8) }
            ];
            engine.addEntity(new Spider(engine, spiderPath1));
            engine.addEntity(new Spider(engine, spiderPath2));
            engine.addEntity(new SleepyGuy(engine, gx(4), gy(18)));
        }
    
       */
    static level9(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW
        const gy = (r) => r * BW;
        engine.addEntity(new Bed(engine, gx(31), gy(1)));
        engine.addEntity(new SleepyGuy(engine, gx(4), gy(4)));

        engine.addEntity(new PickupItem(engine, gx(18), gy(4), "ToothBrush"));
        engine.addEntity(new PickupItem(engine, gx(3), gy(21), "Rocket"));
        engine.addEntity(new PickupItem(engine, gx(31), gy(20), "Pajama"));
        engine.addEntity(new PickupItem(engine, gx(10), gy(12), "Sword"));
        engine.addEntity(new PickupItem(engine, gx(9), gy(-2), "SleepDust"));


        const builder = new LevelBuilder(engine);

        builder.spawnRow(1, 1, 19);
        builder.spawnColumn(1, 1, 16);
        builder.spawnColumn(20, 1, 16);
        builder.spawnRow(7, 7, 9);
        builder.spawnColumn(9, 7, 9);
        builder.spawnRow(9, 9, 14);
        builder.spawnColumn(14, 9, 11);
        builder.spawnRow(16, 1, 7);
        builder.spawnRow(16, 17, 20);
        builder.spawnColumn(17, 16, 19);
        builder.spawnRow(19, 12, 16);
        builder.spawnRow(19, 1, 7)
        builder.spawnColumn(1, 19, 22);
        builder.spawnRow(22, 1, 20);
        builder.spawnColumn(28, 8, 22);
        builder.spawnRow(8, 28, 38);
        builder.spawnColumn(38, 1, 8);

        for (let c = 2; c <= 6; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(6)));
        }
        for (let c = 15; c <= 19; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(11)));
        }

        const spiderPath1 = [
            { x: gx(20), y: gy(16) },
            { x: gx(20), y: gy(21) }
        ];
        const spiderPath2 = [
            { x: gx(27), y: gy(1) },
            { x: gx(27), y: gy(7) }
        ];
        engine.addEntity(new Spider(engine, spiderPath1));
        engine.addEntity(new Spider(engine, spiderPath2));
        engine.addEntity(new Ghost(engine, gx(30), gy(-2)));
        engine.addEntity(new Demon(engine, gx(14), gy(-4)));
        engine.addEntity(new VenusFlyTrap(engine, gx(25), gy(22)));



    }

    static level10(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW
        const gy = (r) => r * BW;
        engine.addEntity(new Bed(engine, gx(31), gy(18)));
        engine.addEntity(new SleepyGuy(engine, gx(5), gy(6)));



        engine.addEntity(new PickupItem(engine, gx(11), gy(0), "Pajama"));
        engine.addEntity(new PickupItem(engine, gx(15), gy(4), "ToothBrush"));
        engine.addEntity(new PickupItem(engine, gx(20), gy(15), "TheStrangeLamp"));
        engine.addEntity(new PickupItem(engine, gx(10), gy(12), "Sword"));
        engine.addEntity(new PickupItem(engine, gx(-3), gy(-5), "SleepDust"));


        const builder = new LevelBuilder(engine);

        builder.spawnRow(1, 1, 19);
        builder.spawnColumn(1, 1, 4);
        builder.spawnColumn(1, 8, 14);
        builder.spawnColumn(20, 1, 2);
        builder.spawnRow(20, 1, 17)
        builder.spawnColumn(10, 1, 6);
        builder.spawnRow(6, 11, 17);
        builder.spawnColumn(17, 7, 12);
        builder.spawnRow(12, 17, 22);
        builder.spawnColumn(22, 12, 15);
        builder.spawnRow(12, 7, 11);
        builder.spawnColumn(11, 12, 16);
        builder.spawnColumn(30, 1, 7);
        builder.spawnRow(18, 32, 38);


        for (let c = 18; c <= 23; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(20)));
        }
        //  for (let c = 15; c <= 19; c++) {
        //     engine.addEntity(new Spikes(engine, gx(c), gy(11)));
        // }

        const spiderPath1 = [
            { x: gx(30), y: gy(25) },
            { x: gx(36), y: gy(25) }
        ];


        engine.addEntity(new Spider(engine, spiderPath1));



        engine.addEntity(new VenusFlyTrap(engine, gx(8), gy(10)));
        engine.addEntity(new Ghost(engine, gx(27), gy(18)));
        engine.addEntity(new Ghost(engine, gx(37), gy(18)));
        engine.addEntity(new Demon(engine, gx(33), gy(14)));
        engine.addEntity(new Ghost(engine, gx(-1), gy(15)));
        engine.addEntity(new Demon(engine, gx(6), gy(21)));
        engine.addEntity(new Ghost(engine, gx(1), gy(-4)));
        engine.addEntity(new Ghost(engine, gx(15), gy(-4)));
        engine.addEntity(new StickyBush(engine, gx(0), gy(6)));

        // engine.addEntity(new Demon(engine, gx(14), gy(-4)));
        // engine.addEntity(new VenusFlyTrap(engine, gx(25), gy(22)));

    }

    static level11(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW
        const gy = (r) => r * BW;
        engine.addEntity(new Bed(engine, gx(29), gy(16)));
        engine.addEntity(new SleepyGuy(engine, gx(5), gy(6)));



        engine.addEntity(new PickupItem(engine, gx(17), gy(16), "Pajama"));
        engine.addEntity(new PickupItem(engine, gx(4), gy(21), "Rocket"));
        engine.addEntity(new PickupItem(engine, gx(17), gy(0), "TheStrangeLamp"));
        engine.addEntity(new PickupItem(engine, gx(30), gy(4), "SleepDust"));



        const builder = new LevelBuilder(engine);

        builder.spawnRow(1, 1, 3);
        builder.spawnColumn(1, 1, 6);
        builder.spawnRow(6, 1, 5);
        builder.spawnColumn(5, 6, 9);
        builder.spawnRow(9, 5, 8);
        builder.spawnColumn(8, 9, 12);

        builder.spawnColumn(1, 17, 25);
        builder.spawnRow(22, 1, 37);
        builder.spawnColumn(15, 13, 17);
        builder.spawnRow(17, 15, 19)
        builder.spawnColumn(37, 16, 25);
        builder.spawnRow(16, 26, 37)
        builder.spawnColumn(37, 1, 10);
        builder.spawnRow(1, 27, 37);
        builder.spawnRow(5, 27, 37);
        builder.spawnRow(10, 27, 37);
        builder.spawnRow(10, 32, 37);
        builder.spawnRow(1, 10, 22);
        builder.spawnColumn(13, 1, 7);
        builder.spawnRow(7, 13, 18);

        const spiderPath = [
            { x: gx(24), y: gy(16) },
            { x: gx(24), y: gy(21) }
        ];
        engine.addEntity(new Ghost(engine, gx(9), gy(-4)));
        engine.addEntity(new Ghost(engine, gx(18), gy(-4)));
        engine.addEntity(new Demon(engine, gx(25), gy(5)));
        engine.addEntity(new Demon(engine, gx(14), gy(2)));

        engine.addEntity(new VenusFlyTrap(engine, gx(1), gy(12)));
        engine.addEntity(new Sheep(engine, gx(14), gy(16)));
        engine.addEntity(new Demon(engine, gx(24), gy(11)));
        engine.addEntity(new Spider(engine, spiderPath));
        engine.addEntity(new Spikes(engine, gx(15), gy(12)));


        for (let c = 3; c <= 15; c++) {
            engine.addEntity(new Spikes(engine, gx(c), gy(27)));
        }

    }


    static level12(engine) {
        const BW = PARAMS.BLOCKWIDTH;
        const gx = (c) => c * BW
        const gy = (r) => r * BW;
        engine.addEntity(new Bed(engine, gx(11), gy(10)));
        engine.addEntity(new SleepyGuy(engine, gx(-5), gy(-5)));



        engine.addEntity(new PickupItem(engine, gx(37), gy(11), "SleepDust"));
        engine.addEntity(new PickupItem(engine, gx(37), gy(17), "TheStrangeLamp"));
        engine.addEntity(new PickupItem(engine, gx(22), gy(5), "Sword"));
        engine.addEntity(new PickupItem(engine, gx(8), gy(4), "Pajama"));



        const builder = new LevelBuilder(engine);


        builder.spawnRow(1, 3, 7);
        builder.spawnRow(1, 21, 25);
        builder.spawnRow(6, 17.24);
        builder.spawnRow(11, 1, 3);
        builder.spawnRow(16, 1, 3);
        builder.spawnRow(21, 5, 7);
        builder.spawnRow(21, 11, 13);
        builder.spawnRow(21, 17, 19);
        builder.spawnRow(21, 23, 25);
        builder.spawnRow(16, 26, 28);
        builder.spawnRow(11, 26, 28);
        builder.spawnRow(6, 26, 28);
        builder.spawnRow(9, 11, 19);
        builder.spawnRow(8, 34, 39);
        builder.spawnRow(18, 34, 39);

        const spiderPath1 = [
            { x: gx(10), y: gy(10) },
            { x: gx(10), y: gy(15) }
        ];

        const spiderPath2 = [
            { x: gx(19), y: gy(10) },
            { x: gx(19), y: gy(15) }
        ];

        const spiderPath3 = [
            { x: gx(8), y: gy(1) },
            { x: gx(18), y: gy(1) }
        ];

        const spiderPath4 = [
            { x: gx(39), y: gy(9) },
            { x: gx(39), y: gy(17) }
        ];

        engine.addEntity(new Spider(engine, spiderPath1));
        engine.addEntity(new Spider(engine, spiderPath2));
        engine.addEntity(new Spider(engine, spiderPath3));
        engine.addEntity(new Spider(engine, spiderPath4));
        engine.addEntity(new Ghost(engine, gx(0), gy(2)));
        engine.addEntity(new Ghost(engine, gx(0), gy(7)));
        engine.addEntity(new Ghost(engine, gx(0), gy(12)));
        engine.addEntity(new Demon(engine, gx(4), gy(17)));
        engine.addEntity(new Demon(engine, gx(10), gy(17)));
        engine.addEntity(new Demon(engine, gx(16), gy(17)));
        engine.addEntity(new Demon(engine, gx(22), gy(17)));
        engine.addEntity(new VenusFlyTrap(engine, gx(26), gy(14)));
        engine.addEntity(new VenusFlyTrap(engine, gx(26), gy(9)));
        engine.addEntity(new VenusFlyTrap(engine, gx(26), gy(5)));
        engine.addEntity(new StickyBush(engine, gx(6), gy(-1)));
        engine.addEntity(new StickyBush(engine, gx(23), gy(-1)));

    }
}