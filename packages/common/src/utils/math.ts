function toFixed(value: number, fractionDigits: number): number {
    return Number(value.toFixed(fractionDigits));
}

type Vec2 = {x: number, y: number};

const TMP_VEC2: Vec2 = {x: 0, y: 0};

export {
    toFixed,
    Vec2,
    TMP_VEC2
}
