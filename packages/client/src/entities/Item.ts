

type TextureInfo = {
    key: string,
    frame?: number
}

const itemTexture: Record<number, TextureInfo> = {
    0: {
        key: "base",
        frame: 52
    },
    1: {
        key: "base",
        frame: 53
    },
    2: {
        key: "base",
        frame: 54
    },
    3: {
        key: "base",
        frame: 55
    },
    4: {
        key: "base",
        frame: 156
    },
    5: {
        key: "rpg-items",
        frame: 44
    }
}

export {
    itemTexture
}