interface Item {
    id: number;
    stack: number;
}

type TextureInfo = {
    key: string,
    frame?: number
}

const itemTexture: Record<number, TextureInfo> = {
    1: {
        key: "base",
        frame: 52
    },
    2: {
        key: "base",
        frame: 53
    },
    3: {
        key: "base",
        frame: 54
    },
    4: {
        key: "base",
        frame: 55
    },
    5: {
        key: "base",
        frame: 156
    },
    6: {
        key: "rpg-items",
        frame: 44
    }
}

export {
    Item,
    itemTexture
}