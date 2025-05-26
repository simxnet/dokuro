import { Image, Frame, GIF } from "imagescript";
import { ofetch } from "ofetch";
import { inspect } from "util";
import { runInNewContext } from "vm";

type Serializable = string | number | boolean;

enum Format {
  PNG = "png",
  GIF = "gif",
}

interface Output {
  image?: Buffer;
  text?: string;
  cpuTime?: number;
  format?: Format;
}

export async function evalImagescript(
  script: string,
  inject: { [key: string]: Serializable },
): Promise<Output> {
  let text = "";
  const _console = {
    log: (arg: string) => (text += String(arg) + "\n"),
  };

  let result: Uint8Array | undefined;
  const scriptToExecute = `(async() => {
    ${script}
    const __typeofImage = typeof(image);
    if(__typeofImage === 'undefined') {
        return undefined;
    } else {
        // Expecting image to be an already encoded Uint8Array
        return image;
    }
})()`;
  const start = Date.now();
  try {
    result = await runInNewContext(
      scriptToExecute,
      {
        Image,
        Frame,
        GIF,
        _inspect: inspect,
        console: _console,
        fetch: ofetch.native,
        ...inject,
      },
      { timeout: 5000 },
    );
  } catch (e) {
    throw e;
  }

  if (result === undefined && (!text || text.trim() === ""))
    throw new Error(
      "the script produced no output (define `image` as an encoded Uint8Array or log something with `console.log()`)",
    );
  if (result instanceof Promise) await result;

  text = text.slice(0, 5000);

  let output: Output = {
    image: undefined,
    text,
    cpuTime: Date.now() - start,
    format: Format.PNG, 
  };
  
  if (result) {
    output.image = Buffer.from(result);
  }

  return output;
}
