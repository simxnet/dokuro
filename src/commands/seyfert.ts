import { ofetch } from 'ofetch';
import { Declare, Command, type CommandContext, createAttachmentOption, Options, AttachmentBuilder } from 'seyfert';
import sharp from 'sharp';

const options = {
  image: createAttachmentOption({
    description: "image to overlay",
    required: true
  })
}

@Declare({
  name: 'seyfert',
  description: 'overlay seyfert layout to any banner'
})
@Options(options)
export default class SeyfertCommand extends Command {
  #asset = process.cwd() + "/assets/seyfert.png"

  async run(ctx: CommandContext<typeof options>) {
    await ctx.deferReply();

    const image = ctx.options.image;

    if (!image.contentType?.startsWith("image/")) throw new Error("only static images (and gifs)")

    const imageBuffer = await ofetch<ArrayBuffer, "arrayBuffer">(image.proxyUrl, { responseType: "arrayBuffer" });

    const overlay = await this.overlayLayout(imageBuffer);

    const attachment = new AttachmentBuilder()
      .setName("overlay.png")
      .setFile("buffer", overlay)

    await ctx.editOrReply({
      content: "ok bro",
      files: [attachment]
    })
  }

  async overlayLayout(target: ArrayBuffer) {
    const overlay = sharp(this.#asset);
    const base = sharp(target);

    const { width, height } = await base.metadata()

    overlay.resize(width, height)

    base.composite([
      {
        input: await overlay.toBuffer()
      }
    ])

    return base.png().toBuffer()
  }
}
