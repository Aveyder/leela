import Component from "../../core/Component";
import { Model, ModelDescriptor } from "../../resource/Model";

export default class ModelComponent extends Component {

  private _model: ModelDescriptor;

  constructor() {
    super();

    this._model = Model.UNIT_0;
  }

  public get model(): Model {
    return this._model;
  }

  public start(): void {
    this.setModel(this._model);
  }

  public setModel(model: ModelDescriptor): void {
    this._model = model;
  }
}
