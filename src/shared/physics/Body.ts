export interface BodyData {
  x: number;
  y: number;

  width: number;
  height: number;

  dx: number;
  dy: number;

  isStatic: boolean;
}

export default class Body implements BodyData {

  public x: number;
  public y: number;

  public width: number;
  public height: number;

  public dx: number;
  public dy: number;

  public isStatic: boolean;

  constructor(options: Partial<BodyData>) {
    this.x = 0;
    this.y = 0;

    this.width = 0;
    this.height = 0;

    this.dx = 0;
    this.dy = 0;

    this.isStatic = false;

    Object.assign(this, options);
  }

  public setPosition(x: number, y: number) {
    this.dx = x - this.x;
    this.dy = y - this.y;
  }
}
