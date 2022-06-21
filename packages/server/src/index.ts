import World from "./world/World";
import WorldServer from "./server/WorldServer";
import Loop from "./Loop";
import {SIMULATION_RATE} from "@leela/common";

function boot() {
    const world = new World();
    world.init();

    const server = new WorldServer(world);
    server.init();

    worldUpdateLoop(world);
}

function worldUpdateLoop(world: World) {
    const loop = new Loop();
    return loop.start(delta => {
        if (!world.stopped) {
            world.update(delta);
        } else {
            loop.stop();
        }
    }, SIMULATION_RATE);
}

boot();
