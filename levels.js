//Use this file to build specific level layouts.
class Levels {

    buildLevel(engine) {
        const levelMap = {
            0: this.testLevel,
            1: this.level1,
            2: this.level2,
        };
        (levelMap[engine.currentLevel] || defaultLevel)(engine);
        engine.addEntity(new Bed(engine, 700, 300)); //This can get placed in each function with a unique location
        engine.addEntity(new SleepyGuy(engine, 100, 100)); //This can get placed in each function with a unique location
        engine.addEntity(new WaypointBuilder(engine));
    }

    level1(engine) {
        engine.addEntity(new Ghost(engine, 700, 50));
        engine.addEntity(new Ghost(engine, 775, 350));
        engine.addEntity(new Ghost(engine, 300, 400));
        engine.addEntity(new Sheep(engine, 500, 50));
    }

    level2(engine) {
        const spiderPath = [
            { x: 400, y: 0 },
            { x: 600, y: 0 },
        ];
        // Add blocks 
        const builder = new LevelBuilder(engine);

        builder.spawnRow(15, 0, 20); 
        builder.spawnBlock(5, 14);
        builder.spawnBlock(5, 13);

        engine.addEntity(new Demon(engine, 300, 400))
        engine.addEntity(new Sheep(engine, 100, 200));
        engine.addEntity(new Spider(engine, spiderPath));
        engine.addEntity(new Ghost(engine, 700, 50));
    }


    defaultLevel(engine) {
        this.testLevel(engine);
    }

    testLevel(engine) {
        engine.addEntity(new Ghost(engine, 700, 50));
        // Collection of some items - for demonstration purposes
        engine.addEntity(new PickupItem(engine, 220, 140, "Sword"));
        engine.addEntity(new PickupItem(engine, 280, 140, "ToothBrush"));
        engine.addEntity(new PickupItem(engine, 340, 140, "TeddyBear"));

        engine.addEntity(new PickupItem(engine, 220, 220, "DreamCatcher"));
        engine.addEntity(new PickupItem(engine, 280, 220, "Rocket"));
        engine.addEntity(new PickupItem(engine, 340, 220, "Pajama"));
    }

}