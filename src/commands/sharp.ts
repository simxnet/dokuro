import {
  Declare,
  Command,
  type CommandContext,
  createStringOption,
  Options,
  AttachmentBuilder,
} from "seyfert";
import { evalSharp } from "../lib/evalSharp";

const options = {
  code: createStringOption({
    description: "code to eval",
    required: true,
  }),
};

@Declare({
  name: "sharp",
  description: "evaluate sharp code",
})
@Options(options)
export default class SharpCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    await ctx.deferReply();

    const code = ctx.options.code;

    const { image, text, cpuTime, format } = await evalSharp(code, {
      goat: "simxnet",
      authorAvatar: ctx.author.avatarURL({
        extension: "png",
        forceStatic: true,
      }),
      authorUsername: ctx.author.username,
    });

    const messages = [];

    if (!image) messages.push("No image returned");
    if (text) messages.push(text);
    if (cpuTime) messages.push(`${cpuTime}ms`);

    await ctx.editOrReply({
      content: messages.join("\n"),
      files: image
        ? [
            new AttachmentBuilder()
              .setFile("buffer", image)
              .setName(`eval.${format?.toLowerCase() ?? "png"}`),
          ]
        : [],
    });
  }

  async onRunError(context: CommandContext, error: unknown) {
    context.client.logger.fatal(error);
    await context.editOrReply({
      content: error instanceof Error ? error.message : `Error: ${error}`,
    });
  }
}
