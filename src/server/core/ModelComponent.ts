import Component from "../../core/Component";
import { Model, ModelDescriptor, MODELS } from "../../resource/Model";

export default class ModelComponent extends Component {

  private _model: ModelDescriptor;

  private counter: number = 0;

  constructor() {
    super();

    this._model = Model.UNIT_0;
  }

  update(delta: number) {
    this.counter++;

    if (this.counter % 20 === 0) {
      const randomModel = Math.floor(MODELS.length * Math.random());
      this.setModel(MODELS[randomModel]);
    }
  }

  public get model(): ModelDescriptor {
    return this._model;
  }

  public start(): void {
    this.setModel(this._model);
  }

  public setModel(model: ModelDescriptor): void {
    this._model = model;
  }
}
