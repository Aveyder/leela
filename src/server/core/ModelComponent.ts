import Component from "../../core/Component";
import { ModelDescriptor, MODELS } from "../../resource/Model";

export default class ModelComponent extends Component {

  private _model: ModelDescriptor;

  constructor() {
    super();

    this._model = MODELS[0];
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
