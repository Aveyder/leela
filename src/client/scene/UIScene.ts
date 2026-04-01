import InventoryManager from "../manager/InventoryManager";
import GameContext from "../GameContext";

export default class UIScene extends Phaser.Scene {

  public static readonly KEY = "UIScene";

  public context: GameContext;

  public inventory: InventoryManager;

  constructor() {
    super(UIScene.KEY);
  }

  public create(): void {
    this.context = GameContext.get(this);

    this.inventory = new InventoryManager(this);
  }
}
