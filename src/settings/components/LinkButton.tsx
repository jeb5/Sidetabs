import React from "react";
import "./LinkButton.css";

export default function LinkButton({ onClick, icon, children, href }: { onClick?: () => void; icon?: JSX.Element; children: string; href?: string; }) {
	return <a className="link-button" href={href || "#"} onClick={onClick}>{icon}<span>{children}</span></a>;
}