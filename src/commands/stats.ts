import { Declare, Command, type CommandContext } from "seyfert";
import sharp from "sharp";

@Declare({
  name: "stats",
  description: "stats for dokuro",
})
export default class StatsCommand extends Command {
  async run(ctx: CommandContext) {
    const ping = ctx.client.gateway.latency;
    const memoryUsage = process.memoryUsage().rss / 1024 / 1024;

    await ctx.editOrReply({
      content: `${ping}ms\n${memoryUsage.toFixed(2)}mb used\nsharp v${sharp.versions.sharp} (vips v${sharp.versions.vips})`,
    });
  }
}
