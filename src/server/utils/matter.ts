import CaltheraMap from "../../assets/map/calthera.json";
import Matter, { Bodies } from "matter-js";
import { CollisionCategory } from "../../shared/Constants";

export function createBodiesFromObjectGroups(tiledMap: typeof CaltheraMap): Matter.Body[] {
  const objectMap = new Map();
  for (const tileset of tiledMap.tilesets) {
    const tiles = tileset.tiles;
    if (tiles) {
      for (const tile of tileset.tiles) {
        if (tile.objectgroup) {
          objectMap.set(tile.id, tile.objectgroup.objects)
        }
      }
    }
  }

  const tilewidth = tiledMap.tilewidth;
  const tileheight = tiledMap.tileheight;

  const bodies = [] as Matter.Body[];

  for(const layer of tiledMap.layers) {
    const chunks = layer.chunks;

    if (chunks) {
      for(const chunk of chunks) {
        for (let i = 0; i < chunk.height; i++) {
          for(let j = 0; j < chunk.width; j++) {
            const tileId = chunk.data[i * chunk.width + j] - 1;

            const objects = objectMap.get(tileId);
            if (objects) {
              const tileX = (layer.x + chunk.x + j) * tilewidth;
              const tileY = (layer.y + chunk.y + i) * tileheight;

              for (const object of objects) {
                bodies.push(
                  Bodies.rectangle(tileX + object.x + object.width / 2, tileY + object.y + object.height / 2, object.width, object.height, {
                    isStatic: true,
                    collisionFilter: {
                      category: CollisionCategory.WALL,
                      mask: CollisionCategory.WALL | CollisionCategory.PLAYER
                    },
                    chamfer: {
                      radius: 2
                    }
                  })
                );
              }
            }
          }
        }
      }
    }
  }

  return bodies;
}
