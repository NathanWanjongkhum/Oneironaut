//Use this file to build specific level layouts.
class Levels {

    static buildLevel(engine) {
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
        engine.addEntity(new Bed(engine, 700, 300)); //This can get placed in each function with a unique location
        engine.addEntity(new SleepyGuy(engine, 100, 100)); //This can get placed in each function with a unique location
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
        engine.addEntity(new PickupItem(engine, 170, 100, "Sword")); // near SleepyGuy spawn (100,100)
        engine.addEntity(new PickupItem(engine, 400, 140, "SandBag3"));
        engine.addEntity(new PickupItem(engine, 260, 120, "SleepDust"));
        engine.addEntity(new PickupItem(engine, 230, 100, "TeddyBear"));
        engine.addEntity(new PickupItem(engine, 240, 120, "DreamCatcher"));
        engine.addEntity(new PickupItem(engine, 320, 100, "Rocket"));
        engine.addEntity(new PickupItem(engine, 400, 220, "SleepMask"));
        engine.addEntity(new PickupItem(engine, 360, 180, "TheStrangeLamp"));
        engine.addEntity(new Ghost(engine, 700, 50));
        engine.addEntity(new Ghost(engine, 775, 350));
        engine.addEntity(new Ghost(engine, 300, 400));
        engine.addEntity(new Sheep(engine, 500, 50));
        const spiderPath = [
            { x: 400, y: 0 },
            { x: 600, y: 0 },
            { x: 500, y: 30 },
            { x: 400, y: 10 },
        ];
        engine.addEntity(new Spider(engine, spiderPath));
    }

    static level2(engine) {
        const spiderPath = [
            { x: 400, y: 0 },
            { x: 600, y: 0 },
        ];
        // Add blocks 
        const builder = new LevelBuilder(engine);

        engine.addEntity(new PickupItem(engine, 190, 120, "ToothBrush")); // near SleepyGuy spawn
        engine.addEntity(new PickupItem(engine, 260, 120, "SleepDust"));
        engine.addEntity(new PickupItem(engine, 400, 140, "SandBag3"));
        engine.addEntity(new PickupItem(engine, 250, 120, "TeddyBear"));
        engine.addEntity(new PickupItem(engine, 360, 180, "TheStrangeLamp"));
        builder.spawnRow(15, 0, 20);
        builder.spawnBlock(5, 14);
        builder.spawnBlock(5, 13);
        builder.spawnSpikesRow(14, 0, 4)

        engine.addEntity(new StickyBush(engine, 100, 200))
        engine.addEntity(new Demon(engine, 300, 500))
        engine.addEntity(new Sheep(engine, 100, 200));
        engine.addEntity(new Spider(engine, spiderPath));
        engine.addEntity(new Ghost(engine, 700, 50));
    }

    static level3(engine) {
        const spiderPathA = [
            { x: 400, y: 0 },
            { x: 600, y: 0 },
            { x: 500, y: 30 },
            { x: 400, y: 10 },
        ];
        const spiderPathB = [
            { x: 200, y: 700 },
            { x: 600, y: 600 },
            { x: 500, y: 500 },
            { x: 400, y: 10 },
        ];
        const spiderPathC = [
            { x: 600, y: 0 },
            { x: 800, y: 0 },
            { x: 800, y: 100 },
            { x: 600, y: 100 },
            { x: 600, y: 0 },
        ];
        engine.addEntity(new Spider(engine, spiderPathA));
        engine.addEntity(new Spider(engine, spiderPathB));
        engine.addEntity(new Spider(engine, spiderPathC));
        //TODO - build this level
    }

    static level4(engine) {
        engine.addEntity(new StickyBush(engine, 100, 200))
        //TODO - build this level
    }

    static level5(engine) {
        //TODO - build this level
    }

    static level6(engine) {
        //TODO - build this level
    }
    

}