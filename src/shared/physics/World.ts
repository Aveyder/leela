import Body from "./Body";

export default class World {

  public static readonly STEPS: number = 5;

  public readonly staticBodies: Set<Body>;
  public readonly dynamicBodies: Set<Body>;

  constructor() {
    this.staticBodies = new Set();
    this.dynamicBodies = new Set();
  }

  public add(body: Body): void {
    if (body.isStatic) {
      this.staticBodies.add(body);
    } else {
      this.dynamicBodies.add(body);
    }
  }

  remove(body: Body): void {
    this.staticBodies.delete(body);
    this.dynamicBodies.delete(body);
  }

  public isColliding(a: Body, b: Body): boolean {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    const combinedHalfWidths = (a.width + b.width) / 2;
    const combinedHalfHeights = (a.height + b.height) / 2;

    return dx < combinedHalfWidths && dy < combinedHalfHeights;
  }

  public step() {
    for(const body of this.dynamicBodies) {
      if (body.dx !== 0 || body.dy !== 0) {
        const stepX = body.dx / World.STEPS;
        const stepY = body.dy / World.STEPS;

        for(let i = 0; i < World.STEPS; i++) {
          body.x += stepX;
          for(const staticBody of this.staticBodies) {
            if (this.isColliding(body, staticBody)) {
              if (stepX > 0) {
                body.x = staticBody.x - (staticBody.width + body.width) / 2;
              } else if (stepX < 0) {
                body.x = staticBody.x + (staticBody.width + body.width) / 2;
              }
              break;
            }
          }

          body.y += stepY;
          for(const staticBody of this.staticBodies) {
            if (this.isColliding(body, staticBody)) {
              if (stepY > 0) {
                body.y = staticBody.y - (staticBody.height + body.height) / 2;
              } else if (stepY < 0) {
                body.y = staticBody.y + (staticBody.height + body.height) / 2;
              }
              break;
            }
          }
        }
      }

      body.dx = 0;
      body.dy = 0;
    }
  }
}
