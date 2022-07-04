import {Type} from "@leela/common";

export default class Item {
    public readonly typeId: number;
    public id: number;
    public stack: number;

    constructor(id: number, stack: number) {
        this.typeId = Type.ITEM;
        this.id = id;
        this.stack = stack;
    }
}

const itemData = {
    1: {
        maxStack: 20
    },
    2: {
        maxStack: 20
    },
    3: {
        maxStack: 20
    },
    4: {
        maxStack: 20
    },
    5: {
        maxStack: 20
    },
    6: {
        maxStack: 20
    }
}

export {
    itemData
}