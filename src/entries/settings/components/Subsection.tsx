import React, { ReactElement } from "react";
import EXPERIMENTS_ICON from "../../../assets/icons/Experiments.svg?react";
import "./Subsection.css";

export default function Subsection({
	children,
	title,
	icon,
	className,
	experimental,
}: {
	children: React.ReactNode;
	title: string;
	icon?: ReactElement;
	className?: string;
	experimental?: boolean;
}) {
	return (
		<div className={`subsection${className ? " " + className : ""}`}>
			<div className="subsection-title">
				<span className="subsection-main-label">
					{icon}
					{title}
				</span>
				{experimental && (
					<span className="subsection-experimental-label">
						<EXPERIMENTS_ICON />
						Experimental
					</span>
				)}
			</div>
			<div className="subsection-content">{children}</div>
		</div>
	);
}
