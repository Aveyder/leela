import GameObject from "./GameObject";

export default abstract class Component {
  public gameObject: GameObject;

  public init(): void {
  }

  public start(): void {
  }

  public update(delta: number): void {
  }

  public lateUpdate(delta: number): void {
  }

  public destroy(): void {
  }
}
