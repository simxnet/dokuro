import { Declare, Command, type CommandContext, createStringOption, OKFunction, Options, AttachmentBuilder } from 'seyfert';
import { createRegExp, exactly, anyOf, maybe, oneOrMore, charNotIn, letter, digit } from 'magic-regexp'
import { ofetch } from 'ofetch';
import { imageMeta } from "image-meta";

const imageUrlRegex = createRegExp(
  anyOf('http', 'https'),
  exactly('://'),
  oneOrMore(anyOf(letter, digit, exactly('.'), exactly('-'))),
  maybe(exactly('/'), oneOrMore(charNotIn('?#'))),
  exactly('.'),
  anyOf('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'),
  maybe(exactly('?'), oneOrMore(charNotIn('#'))),
  maybe(exactly('#'), oneOrMore(charNotIn(' ')))
);

const options = {
  image: createStringOption({
    description: "image to manipulate (link)",
    required: true,
    value: (data, ok: OKFunction<string>, stop) => {
      if (imageUrlRegex.test(data.value)) {
        return ok(data.value)
      } else {
        return stop("Invalid image url :P")
      }
    }
  }),
  operations: createStringOption({
    description: "operations to perform",
    required: false
  })
}

@Declare({
  name: 'ipx',
  description: 'ipx eval'
})
@Options(options)
export default class IPXCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const image = await ofetch<ArrayBuffer, "arrayBuffer">(`http://localhost:3000/${ctx.options.operations ?? "_"}/${ctx.options.image}`, {
      responseType: "arrayBuffer",
    })

    const buffer = Buffer.from(image);
    const { type } = imageMeta(buffer)

    const attachment = new AttachmentBuilder()
      .setName(`ipx.${type}`)
      .setFile("buffer", buffer)

    await ctx.editOrReply({
      content: "there u go bruda",
      files: [attachment]
    });
  }

  async onRunError(context: CommandContext, error: unknown) {
    context.client.logger.fatal(error);

    await context.editOrReply({
      content: error instanceof Error ? error.message : `Error: ${error}`
    });
  }
}

