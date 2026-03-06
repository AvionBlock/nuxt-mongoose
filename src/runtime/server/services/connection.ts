import type { ConnectOptions } from "mongoose";
import { consola } from "consola";
import { colors } from "consola/utils";
import mongoose from "mongoose";
import dns from "node:dns";
import { useRuntimeConfig } from "#imports";

export async function defineMongooseConnection({
  uri,
  options,
}: { uri?: string; options?: ConnectOptions } = {}): Promise<void> {
  const config = useRuntimeConfig().mongoose as any;

  const dnsServers = config.dnsServers as string[] | undefined;
  if (Array.isArray(dnsServers) && dnsServers.length) {
    dns.setServers(dnsServers);
  }

  const mongooseUri = uri || config.uri;
  if (!(mongooseUri as string).trim()) return;

  const mongooseOptions = options || config.options;

  try {
    await mongoose.connect(mongooseUri, { ...mongooseOptions });
    consola.success("Connected to MongoDB");
  } catch (err) {
    consola.error(colors.red(`Error connecting to MongoDB: ${err}`));
  }
}
