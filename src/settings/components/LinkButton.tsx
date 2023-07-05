import React, { AnchorHTMLAttributes } from "react";
import "./LinkButton.css";

export default function LinkButton({ onClick, icon, children, href, ...rest }: { onClick?: () => void; icon?: JSX.Element; children: string; href?: string; rest?: AnchorHTMLAttributes<HTMLAnchorElement> }) {
	return <a className="link-button" {...rest} href={href || "#"} onClick={onClick}>{icon}<span>{children}</span></a>;
}