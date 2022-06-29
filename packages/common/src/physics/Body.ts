export default class Body {
    public x: number;
    public y: number;
    public vx: number;
    public vy: number;
    public width: number;
    public height: number;
    public bullet?: boolean;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.width = 0;
        this.height = 0;
        this.bullet = false;
    }
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