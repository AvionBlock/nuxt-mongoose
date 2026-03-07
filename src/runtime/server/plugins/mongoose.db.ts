import { defineMongooseConnection } from "../services";
import { defineNitroPlugin } from "nitropack/runtime/plugin";

export default defineNitroPlugin(async () => {
  await defineMongooseConnection();
});
