import React from "react";
import { ReactComponent as WARNING_ICON } from "../../../assets/icons/Warning.svg";
import "./WarningLabel.css";

export default function WarningLabel({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`warning-label${className ? " " + className : ""}`}>
      <WARNING_ICON />
      {children}
    </div>
  );
}
