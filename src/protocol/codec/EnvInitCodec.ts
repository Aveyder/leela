import { WorldPacketData } from "../WorldPacket";
import { _Codec } from "../Codec";
import EnvInit from "../../entity/EnvInit";
import GameObject from "../../core/GameObject";
import GameObjectStateCodec from "./GameObjectStateCodec";

export default class EnvInitCodec implements _Codec<GameObject[], EnvInit> {

  private readonly gameObjectCodec = new GameObjectStateCodec();

  encode(gameObjects: GameObject[]): WorldPacketData {
    return gameObjects.map((gameObject: GameObject) => this.gameObjectCodec.encode(gameObject));
  }
  decode(data: WorldPacketData): EnvInit {
    return {
      gameObjects: data.map((data) => this.gameObjectCodec.decode(data as WorldPacketData))
    }
  }
}
