import { createContext, useEffect, useState } from "react";

export const CollapsedContext = createContext(false);

export function CollapsedContextProvider(props: { children: React.ReactNode }) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		const onResize = () => {
			setIsCollapsed(window.innerWidth <= 36);
		};
		window.addEventListener("resize", onResize);
		onResize();
		return () => window.removeEventListener("resize", onResize);
	});

	return <CollapsedContext.Provider value={isCollapsed}>{props.children}</CollapsedContext.Provider>;
}
