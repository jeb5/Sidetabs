declare module "*.svg" {
	import React from "react";
	const content: React.SFC<React.SVGProps<SVGSVGElement>>;
	export default content;
}
