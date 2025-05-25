import { Client, ParseClient } from "seyfert";
import { HandleCommand } from "seyfert/lib/commands/handle";
import { Yuna } from "yunaforseyfert";

class DokuroHandleCommand extends HandleCommand {
  argsParser = Yuna.parser();
}

const client = new Client({
  commands: {
    prefix: () => ["*"],
  },
});

client.setServices({
  handleCommand: DokuroHandleCommand,
});

client
  .start()
  .then(() => client.uploadCommands({ cachePath: "./commands.json" }));

declare module "seyfert" {
  interface UsingClient extends ParseClient<Client<true>> {}
}
