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
	}
	const svgBase64Raw = btoa(coloredSVG);
	const svgBase64 = `data:image/svg+xml;base64,${svgBase64Raw}`;
	return svgBase64;
}
