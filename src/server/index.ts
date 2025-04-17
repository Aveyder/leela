import dotenv from "dotenv"
import path from "path";
import WorldServer from "./WorldServer";
import WorldServerConfig from "./WorldServerConfig";

function main() {
  dotenv.config({ path: path.resolve(process.cwd(), `${process.env.ENV_DIR}`, `.${process.env.NODE_ENV}.env`) });

  new WorldServer(WorldServerConfig.fromEnv());
}

main();
