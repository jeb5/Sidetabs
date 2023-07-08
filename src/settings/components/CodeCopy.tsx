import React from 'react';
import "./CodeCopy.css";
import LinkButton from '../../shared-components/LinkButton';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export default function CodeCopy({ text, className }: { text: string, className?: string }) {

	const [copying, setCopying] = React.useState(false);

	return (
		<div className={`code-copy ${copying ? "copying " : ""}${className}`}>
			<SyntaxHighlighter language="css" style={nightOwl} wrapLines customStyle={{ padding: "15px" }}>{text}</SyntaxHighlighter>
			<LinkButton onClick={async () => {
				if (copying) return;
				await navigator.clipboard.writeText(text)
				setCopying(true);
				setTimeout(() => setCopying(false), 2000);
			}}>{copying ? "Copied!" : "Copy Text"}</LinkButton>
		</div>
	);
}