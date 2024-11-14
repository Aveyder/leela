import dotenv from "dotenv"
import path from "path";

function main() {
  dotenv.config({ path: path.resolve(process.cwd(), `${process.env.ENV_DIR}`, `.env`) });
  dotenv.config({ path: path.resolve(process.cwd(), `${process.env.ENV_DIR}`, `.${process.env.NODE_ENV}.env`) });

  console.log("hello server!");
}

main();
