export interface TilesetDescriptor {
    name: string;
    imageKey: string;
}
export class Tileset {
    static readonly BASE: TilesetDescriptor = {
        name: "base",
        imageKey: "base"
    };
    static readonly GRASS: TilesetDescriptor = {
        name: "grass",
        imageKey: "grass"
    };
}

