import { ofetch } from 'ofetch';
import { Declare, Options, Command, type CommandContext, createAttachmentOption, AttachmentBuilder } from 'seyfert';
import sharp from 'sharp';

const options = {
  attachment: createAttachmentOption({
    description: "Image attachment",
    required: true
  })
}

// fuck g4
// also, idk this code is some random bs
// gif support is broken, took 5 hours to find out
@Declare({
  name: 'speech',
  description: 'G4 negro'
})
@Options(options)
export default class SpeechCommand extends Command {
  #asset = process.cwd() + "/assets/speech.jpg"

  async run(ctx: CommandContext<typeof options>) {
    await ctx.deferReply();

    const attachment = ctx.options.attachment;

    if (!attachment.contentType?.startsWith("image/"))
      throw new Error("Image needs a static content type")

    console.time("Speech")

    const ext = attachment.contentType?.split("image/")[1]

    const attachmentBuffer = await ofetch<ArrayBuffer, "arrayBuffer">(attachment.proxyUrl, { responseType: "arrayBuffer" });

    const { data, info } = await this.renderSpeechBalloon(attachmentBuffer);
    const finalAttachment = new AttachmentBuilder()
      .setName(`speech.${ext}`)
      .setFile("buffer", data)

    console.timeEnd("Speech")

    await ctx.editOrReply({
      content: `${info.width}x${info.height} | image/${info.format} | ${info.pages} frames`,
      files: [finalAttachment]
    });
  }

  async renderSpeechBalloon(target: ArrayBuffer) {
    const baseImage = sharp(target, { animated: true })
    const speechImage = sharp(this.#asset)

    const {
      height: speechHeight
    } = await speechImage.metadata()

    const extendedBaseImage = baseImage.extend({ top: speechHeight, background: { r: 0, g: 0, b: 0, alpha: 0 } });

    const {
      width: imageWidth,
      height: _imageHeight,
      format: imageFormat
    } = await sharp(await extendedBaseImage.toBuffer()).metadata();

    const resizedSpeechImage = await speechImage
      .resize(imageWidth, speechHeight)
      .toBuffer();

    extendedBaseImage.composite([
      {
        input: resizedSpeechImage,
        gravity: "north",
        tile: imageFormat === sharp.format.gif.id ? true : false
      }
    ])

    const result = await extendedBaseImage[imageFormat === sharp.format.gif.id ? "gif" : "png"]().toBuffer({ resolveWithObject: true });

    return result
  }
}

