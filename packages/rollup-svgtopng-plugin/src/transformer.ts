import path from "path";
import fs from "fs-extra";
import type { Plugin } from "rollup";
import sharp from "sharp";
import md5 from "md5";
import Color from "color";
import queryString from "query-string";

//BUG: This plugin is incompatible with vite watch mode, which doesn't support emitting files
//TODO: Add support for vite watch mode using pattern in https://github.com/JonasKruckenberg/imagetools/blob/main/packages/vite/src/index.ts#L165
// (Make this a Vite-specific plugin, and serve files instead of emmiting them while in watch mode)

const PREFIX = "svgpng:";
const RESOLVED_PREFIX = "\0" + PREFIX; // To prevent other plugins from trying to load this id

//Imports are of the form: "svgpng:./path/to/file.svg?width=100&height=100&fillColor=red"

export default function svgtopng(): Plugin {
  return {
    name: "svgtopng",
    resolveId: {
      order: "pre",
      handler(source, importer) {
        if (source.startsWith(PREFIX)) {
          // const idTrimmed = id.slice(PREFIX.length);
          // const newPath = importer
          //   ? path.resolve(path.dirname(importer), idTrimmed)
          //   : idTrimmed;
          // return `${SECOND_PREFIX}${newPath}`;
          // // Equivalent to:
          return this.resolve(source.slice(PREFIX.length), importer).then(
            (resolvedId) =>
              resolvedId ? RESOLVED_PREFIX + resolvedId.id : null
          );
        }
        return null; // other ids should be handled as usually
      },
    },
    load: {
      order: "pre",
      async handler(id) {
        if (!id.startsWith(RESOLVED_PREFIX)) {
          return null;
        }
        const svgUrl = id.slice(RESOLVED_PREFIX.length);
        const [svgPath, svgQueryString] = svgUrl.split("?");
        const svgQueryParams = queryString.parse(svgQueryString || "");

        const imageWidth = svgQueryParams
          ? parseInt(svgQueryParams.width as string)
          : null;
        const imageHeight = svgQueryParams
          ? parseInt(svgQueryParams.height as string)
          : null;

        if (imageWidth ? !imageHeight : imageHeight) {
          //xor
          return this.error(
            "ERROR: svgpng: width and height must both be specified, or neither"
          );
        }

        const fill = svgQueryParams.fillColor
          ? Color(svgQueryParams.fillColor as string)
          : null;

        const svgBuffer = await fs.readFile(svgPath);

        let svgString = svgBuffer.toString();
        if (fill) {
          svgString = svgString.replace(
            'fill="context-fill"',
            `fill="${fill.hex()}"`
          );
        }

        const updatedSvgBuffer = Buffer.from(svgString);

        const sharpImage = sharp(updatedSvgBuffer);
        if (imageWidth && imageHeight)
          sharpImage.resize(imageWidth, imageHeight);
        const pngBuffer = await sharpImage.png().toBuffer();
        const pngName = `${path.basename(svgPath, ".svg")}-${md5(svgPath).slice(
          0,
          5
        )}.png`;

        const referenceId = this.emitFile({
          type: "asset",
          name: pngName,
          needsCodeReference: true,
          source: pngBuffer,
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      },
    },
  };
}
