import sharp from "sharp";
import { ofetch } from "ofetch";
import { inspect } from "util";
import { runInNewContext } from "vm";

type Serializable = string | number | boolean;

enum Format {
  PNG = "png",
  JPEG = "jpeg",
  WEBP = "webp",
  AVIF = "avif",
}

interface Output {
  image?: Buffer;
  text?: string;
  cpuTime?: number;
  format?: Format;
}

export async function evalSharp(
  script: string,
  inject: { [key: string]: Serializable },
): Promise<Output> {
  let text = "";
  const _console = {
    log: (arg: any) => (text += String(arg) + "\n"),
  };

  const context = {
    sharp,
    fetch: ofetch.native,
    console: _console,
    _inspect: inspect,
    Buffer,
    ...inject,
  };

  // Wrap the script into an async IIFE returning a Promise
  const wrappedScript = `
    (async () => {
      ${script}

      return typeof image !== 'undefined' ? await image.toBuffer() : undefined;
    })();
  `;

  const start = Date.now();
  let result: any;

  try {
    // runInNewContext returns the Promise from the async IIFE
    const promise = runInNewContext(wrappedScript, context, { timeout: 5000 });

    if (!(promise && typeof promise.then === "function")) {
      throw new Error("Script did not return a Promise");
    }

    result = await promise;
  } catch (e) {
    throw new Error("Script execution failed: " + e);
  }

  text = text.slice(0, 5000);

  if (!result && (!text || text.trim() === "")) {
    throw new Error(
      "The script produced no output (return a Sharp instance or log something)",
    );
  }

  let imageBuffer: Buffer | undefined;

  if (result?.toBuffer && typeof result.toBuffer === "function") {
    imageBuffer = await result.toBuffer();
  }

  const output: Output = {
    image: imageBuffer,
    text,
    cpuTime: Date.now() - start,
    format: imageBuffer ? detectFormat(imageBuffer) : undefined,
  };

  return output;
}

function detectFormat(buffer: Buffer): Format | undefined {
  const sig = buffer.subarray(0, 4).toString("hex");
  if (sig.startsWith("89504e47")) return Format.PNG; // PNG
  if (sig.startsWith("ffd8")) return Format.JPEG;    // JPEG
  if (sig.startsWith("52494646")) return Format.WEBP; // WEBP (RIFF)
  if (sig.startsWith("000000")) return Format.AVIF;   // AVIF (not very reliable, but placeholder)
  return undefined;
}

