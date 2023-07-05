import React from "react";
import WARNING_ICON from "parcel-svg:../../assets/icons/Warning.svg";
import "./WarningLabel.css";

export default function WarningLabel({ children, className }: { children: string, className?: string }) {
	return (
		<div className={`warning-label${className ? " " + className : ""}`}>
			<WARNING_ICON />
			{children}
		</div>
	);
}