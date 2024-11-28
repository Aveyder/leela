import Component from "../../core/Component";
import { GameObjectState } from "../../entity/GameObjectState";

export interface ServerGameObjectSnapshot {
  timestamp: number;
  state: GameObjectState;
}

export default class ServerComponent extends Component {

  public guid: number;

  public readonly snapshots: ServerGameObjectSnapshot[];

  constructor(guid: number = -1) {
    super();

    this.guid = guid;

    this.snapshots = [];
  }
}
