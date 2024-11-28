import Component from "../../core/Component";
import ModelComponent from "./ModelComponent";
import ServerComponent from "./ServerComponent";
import { ComponentId } from "../../protocol/codec/ComponentId";
import MovementSpec from "../../entity/component/MovementSpec";
import { ModelDescriptor } from "../../resource/Model";

export default class ServerControlComponent extends Component {

  private server!: ServerComponent;
  private model!: ModelComponent;

  public start() {
    this.server = this.gameObject.getComponent(ServerComponent);
    this.model = this.gameObject.getComponent(ModelComponent);
  }

  update(delta: number) {
    const state = this.server.getLastState();

    this.gameObject.x = state.gameObject.x;
    this.gameObject.y = state.gameObject.y;

    const model = state.components.get(ComponentId.MODEL) as ModelDescriptor;
    this.model.setModel(model);

    const movementSpec = state.components.get(ComponentId.MOVEMENT) as MovementSpec;
    this.model.setDirection(movementSpec.dx, movementSpec.dy);
  }
}
