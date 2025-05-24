import { Client, ParseClient } from "seyfert";
import { listen } from "listhen";
import { createApp, toNodeListener } from "h3";
import {
  createIPX,
  ipxFSStorage,
  ipxHttpStorage,
  createIPXH3Handler,
} from "ipx";

const ipx = createIPX({
  storage: ipxFSStorage(),
  httpStorage: ipxHttpStorage({ domains: ["media.discordapp.net", "cdn.discordapp.com"] }),
});

const app = createApp().use("/", createIPXH3Handler(ipx));

const client = new Client({
  commands: {
    prefix: () => ["*"]
  }
});

// This will start the connection with the Discord gateway and load commands, events, components, and language (i18n)
client.start().then(() => client.uploadCommands({ cachePath: './commands.json' }));;

listen(toNodeListener(app));

declare module 'seyfert' {
  interface UsingClient extends ParseClient<Client<true>> { }
}
