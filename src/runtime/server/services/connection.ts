import type { ConnectOptions } from "mongoose";
import { consola } from "consola";
import { colors } from "consola/utils";
import mongoose from "mongoose";
import dns from "node:dns";
import { useRuntimeConfig } from "#imports";

const DNS_STATE_KEY = "__NUXT_MONGOOSE_DNS_SERVERS__" as const;

type GlobalWithDnsState = typeof globalThis & {
  [DNS_STATE_KEY]?: string;
};

function applyDnsServers(servers?: string[]): void {
  if (!Array.isArray(servers) || !servers.length) return;

  const normalized = servers.join(",");
  const globalDnsState = globalThis as GlobalWithDnsState;
  if (globalDnsState[DNS_STATE_KEY] === normalized) return;

  dns.setServers(servers);

  const resolver = new dns.promises.Resolver();
  resolver.setServers(servers);

  // MongoDB driver uses dns.promises.resolveSrv/resolveTxt for SRV bootstrap and polling.
  dns.promises.resolveSrv = resolver.resolveSrv.bind(resolver);
  dns.promises.resolveTxt = resolver.resolveTxt.bind(resolver);

  globalDnsState[DNS_STATE_KEY] = normalized;
}

export async function defineMongooseConnection({
  uri,
  options,
}: { uri?: string; options?: ConnectOptions } = {}): Promise<void> {
  const config = useRuntimeConfig().mongoose as any;

  applyDnsServers(config.dnsServers as string[] | undefined);

  const mongooseUri = (uri || config.uri || "").trim();
  if (!mongooseUri) return;

  const mongooseOptions = options || config.options;

  try {
    await mongoose.connect(mongooseUri, { ...mongooseOptions });
    consola.success("Connected to MongoDB");
  } catch (err) {
    consola.error(colors.red(`Error connecting to MongoDB: ${err}`));
  }
}
