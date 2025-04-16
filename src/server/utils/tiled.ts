import CaltheraMap from "../../assets/map/calthera.json";
import Body from "../../shared/physics/Body";

export function createBodiesFromObjectGroups(tiledMap: typeof CaltheraMap): Body[] {
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

  const bodies = [] as Body[];

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
                  new Body({
                    x: tileX + object.x + object.width / 2,
                    y: tileY + object.y + object.height / 2,
                    width: object.width,
                    height: object.height,
                    isStatic: true
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
