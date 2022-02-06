declare module "*.svg" {
	import React from "react";
	const content: React.SFC<React.SVGProps<SVGSVGElement>>;
	export default content;
}
declare module "parcel-svgtopng:*" {
	const content: string;
	export default content;
}
