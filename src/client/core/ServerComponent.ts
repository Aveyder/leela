import Component from "../../core/Component";

export default class ServerComponent extends Component {

  public guid: number;

  constructor(guid: number = -1) {
    super();

    this.guid = guid;
  }
}
