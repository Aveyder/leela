export default interface Body {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    bullet?: boolean;
}

function cloneBody(body: Body, result?: Body): Body {
    if (!result) {
        result = {} as Body;
    }

    result.x = body.x;
    result.y = body.y;
    result.vx = body.vx;
    result.vy = body.vy;
    result.width = body.width;
    result.height = body.height;
    result.bullet = body.bullet;

    return result;
}

export {
    cloneBody
}