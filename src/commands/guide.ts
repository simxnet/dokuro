import { Declare, Command, type CommandContext } from "seyfert";
import { readFile } from "node:fs/promises"

@Declare({
  name: "guide",
  description: "guide to eval image manipulation",
})
export default class GuideCommand extends Command {
  async run(ctx: CommandContext) {
    const guideContent = await readFile(process.cwd() + "/GUIDE.md");

    await ctx.write({
      content: guideContent.toString()
    });
  }
}
