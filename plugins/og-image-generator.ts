import {
  type Canvas,
  GlobalFonts,
  type Image,
  type SKRSContext2D,
  createCanvas,
} from "@napi-rs/canvas";

export type ImageSize = {
  width: number;
  height: number;
};

export type FontProps = {
  path: string;
  family: string;
  size: number;
};

export type TextStyle = {
  lineHeight: number;
  padding: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
};

export class OgImageGenerator {
  private readonly width: number;
  private readonly height: number;
  private canvas: Canvas;

  constructor(size: ImageSize, fontProps: FontProps) {
    this.width = size.width;
    this.height = size.height;
    GlobalFonts.registerFromPath(fontProps.path, fontProps.family);

    this.canvas = createCanvas(this.width, this.height);
    const context = this.canvas.getContext("2d");
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${fontProps.size}px ${fontProps.family}`;
  }

  public generatePNG(text: string, bgImage: Image, style: TextStyle): Buffer {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.width, this.height);
    context.drawImage(bgImage, 0, 0, this.width, this.height);

    writeText({
      context: context,
      text: text,
      width: this.width,
      height: this.height,
      style: style,
    });
    return this.canvas.toBuffer("image/png");
  }
}

function writeText({
  context,
  text,
  width,
  height,
  style,
}: {
  context: SKRSContext2D;
  text: string;
  width: number;
  height: number;
  style: TextStyle;
}): void {
  const maxWidth = width - (style.padding.left + style.padding.right);
  const textHight = textSize(context, text).height * style.lineHeight;
  const lines = splitLine(context, text, maxWidth);

  const x = style.padding.left + maxWidth / 2;
  let y = (() => {
    const area = height - (style.padding.top + style.padding.bottom);
    const use = lines.length * textHight;
    if (area - use < 0) {
      throw new Error(`There are not enough area to draw text: ${text}`);
    }
    const offset = (textHight / 2) * (lines.length - 1);
    return style.padding.top + area / 2 - offset;
  })();

  for (const line of lines) {
    context.fillText(line, x, y);
    y += textHight;
  }
}

function textSize(
  context: SKRSContext2D,
  text: string,
): { width: number; height: number } {
  const measure = context.measureText(text);
  const width = measure.width;
  const height =
    measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
  return { width, height };
}

function splitLine(
  context: SKRSContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const splitWord = (text: string) => {
    const isEnChar = (char: string) => {
      if (char.length !== 1) {
        throw Error(`char length must be 1. length is ${char}`);
      }
      return /[A-z]|_|\$|<|>/.test(char);
    };

    const ret = [""];
    for (const now of text) {
      const prev = ret[ret.length - 1].slice(-1);
      if (prev === "" || (isEnChar(prev) && isEnChar(now))) {
        ret[ret.length - 1] += now;
        continue;
      }
      ret.push(now);
    }
    return ret;
  };

  const ret = [""];
  for (const now of splitWord(text)) {
    const next = ret[ret.length - 1] + now;
    if (textSize(context, next).width > maxWidth) {
      ret.push(now);
    } else {
      ret[ret.length - 1] += now;
    }
  }
  return ret;
}
