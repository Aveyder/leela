import InventoryManager from "../manager/InventoryManager";

export default class UIScene extends Phaser.Scene {

  public static readonly KEY = "UIScene";

  inventory: InventoryManager;

  constructor() {
    super(UIScene.KEY);
  }

  public create(): void {
    this.inventory = new InventoryManager(this);
  }
}
