import GameObject from "./GameObject";

export default abstract class Component {
  public gameObject!: GameObject;

  public start(): void {
  }

  public update(delta: number): void {
  };

  public postUpdate(delta: number): void {
  };

  public destroy(): void {
  };
}
