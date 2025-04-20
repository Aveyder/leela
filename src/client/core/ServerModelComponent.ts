import Component from "../../core/Component";
import ModelComponent from "./ModelComponent";
import ServerComponent from "./ServerComponent";
import { ComponentId } from "../../protocol/codec/ComponentId";
import { ModelDescriptor } from "../../resource/Model";

export default class ServerModelComponent extends Component {

  private server: ServerComponent;
  private model: ModelComponent;

  public start() {
    this.server = this.gameObject.getComponent(ServerComponent);
    this.model = this.gameObject.getComponent(ModelComponent);
  }

  update(delta: number) {
    const state = this.server.getLastState();

    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;

    this.model.setModel(model);
  }
}
