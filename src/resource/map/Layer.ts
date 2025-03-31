export interface LayerDescriptor {
    name: string;
    zIndex: number;
}

export class Layer {
    static readonly GROUND: LayerDescriptor = {
        name: "ground",
        zIndex: 0
    };
    static readonly TERRAIN: LayerDescriptor = {
        name: "terrain",
        zIndex: 1
    };
    static readonly BUILDING_INTERIOR: LayerDescriptor = {
        name: "building_interior",
        zIndex: 2
    };
    static readonly BUILDING_EXTERIOR: LayerDescriptor = {
        name: "building_exterior",
        zIndex: 3
    };
    static readonly FOREGROUND: LayerDescriptor = {
        name: "foreground",
        zIndex: 4
    };
    static readonly DECORATION: LayerDescriptor = {
        name: "decoration",
        zIndex: 5
    };
    static readonly OVERLAY: LayerDescriptor = {
        name: "overlay",
        zIndex: 6
    };
    static readonly WEATHER: LayerDescriptor = {
        name: "weather",
        zIndex: 7
    };
    static readonly UI: LayerDescriptor = {
        name: "UI",
        zIndex: 8
    };
}
