function clamp(number: number, min: number, max: number): number {
    return Math.max(min, Math.min(number, max));
}

function toFixed(value: number, fractionDigits: number): number {
    return Number(value.toFixed(fractionDigits));
}

export {
    clamp,
    toFixed
}
