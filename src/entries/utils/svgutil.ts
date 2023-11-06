// import sharp from "sharp";

// export async function svgToPng(inputSvg: string, width?: number, height?: number, fillHex?: string) {
// 	let workingSvg = inputSvg;
// 	if (fillHex) {
// 		workingSvg = workingSvg.replace('fill="context-fill"', `fill="${fillHex}"`);
// 	}
// 	const updatedSvgBuffer = Buffer.from(workingSvg);

// 	const sharpImage = sharp(updatedSvgBuffer);
// 	if (width && height) sharpImage.resize(width, height);
// 	const pngBuffer = await sharpImage.png().toBuffer();
// 	const pngBase64 = pngBuffer.toString("base64");
// 	return pngBase64;
// }
export function svgB64Colored(inputSvg: string, fillHex: string, addWidthHeight: boolean = false) {
	let coloredSVG = inputSvg.replace('fill="context-fill"', `fill="${fillHex}"`);
	if (addWidthHeight) {
		const vbResults = coloredSVG.match(/viewBox="(\d+) (\d+) (\d+) (\d+)"/);
		const width = vbResults ? vbResults[3] : "16";
		const height = vbResults ? vbResults[4] : "16";
		let vbIndex = coloredSVG.indexOf('viewBox="');
		if (coloredSVG.match(/width="\d+"/) == null)
			coloredSVG = coloredSVG.slice(0, vbIndex) + `width="${width}" ` + coloredSVG.slice(vbIndex);
		vbIndex = coloredSVG.indexOf('viewBox="');
		if (coloredSVG.match(/height="\d+"/) == null)
			coloredSVG = coloredSVG.slice(0, vbIndex) + `height="${height}" ` + coloredSVG.slice(vbIndex);
		console.log({ coloredSVG });
	}
	const svgBase64Raw = btoa(coloredSVG);
	const svgBase64 = `data:image/svg+xml;base64,${svgBase64Raw}`;
	return svgBase64;
}
