import React from "react";
import "./CodeCopy.css";
import LinkButton from "./LinkButton";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";

SyntaxHighlighter.registerLanguage("javascript", js);

export default function CodeCopy({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copying, setCopying] = React.useState(false);

  return (
    <div className={`code-copy ${copying ? "copying " : ""}${className}`}>
      <SyntaxHighlighter
        language="css"
        style={nightOwl}
        wrapLines
        customStyle={{ padding: "15px" }}
      >
        {text}
      </SyntaxHighlighter>
      <LinkButton
        onClick={async () => {
          if (copying) return;
          await navigator.clipboard.writeText(text);
          setCopying(true);
          setTimeout(() => setCopying(false), 2000);
        }}
      >
        {copying ? "Copied!" : "Copy Text"}
      </LinkButton>
    </div>
  );
}
