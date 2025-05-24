import { config } from "seyfert";
import { loadConfig } from "c12";

const cfg = await loadConfig({
  cwd: "./"
});

export default config.bot({
  token: cfg.config.discordToken,
  locations: {
    base: "dist", // replace with "src" if using bun
    commands: "commands"
  },
  intents: ["Guilds", "GuildMessages", "MessageContent"],
});
