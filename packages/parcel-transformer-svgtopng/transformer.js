const { Transformer } = require("@parcel/plugin");
const sharp = require("sharp");
const Color = require("color");

module.exports = new Transformer({
	async transform({ asset, logger }) {
		let buffer = await asset.getBuffer();
		const width = Number(asset.query.get("width"));
		const height = Number(asset.query.get("height"));
		const fillColor = Color(asset.query.get("fillColor")).hex();

		const processedSvgString = String(buffer).replace('fill="context-fill"', `fill="${fillColor}"`);
		let transformedBuffer;
		try {
			transformedBuffer = await sharp(Buffer.from(processedSvgString), { density: (Math.max(width, height) * 72) / 16 })
				.resize(width, height)
				.png()
				.toBuffer();
		} catch (error) {
			logger.error({
				message: `Error while transforming svg to png: ${error.name} - ${error.message}`,
				origin: asset.filePath,
			});
		}

		asset.setBuffer(transformedBuffer);
		asset.type = "png";

		return [asset];
	},
});
