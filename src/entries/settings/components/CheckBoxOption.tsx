import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import "./CheckBoxOption.css";
import "./Option.css";

type CheckBoxOptionProps = React.InputHTMLAttributes<HTMLInputElement> & {
	formRegister: UseFormRegisterReturn;
	children: React.ReactNode;
	indentLevel?: number;
};

export const CheckBoxOption = (props: CheckBoxOptionProps) => {
	const { formRegister, children, title, indentLevel, ...rest } = props;
	return (
		<div
			className={`checkbox-option option-field${props.disabled ? " checkbox-option-disabled" : ""}`}
			title={title}
			style={{ marginLeft: (props.indentLevel ?? 0) * 30 }}
		>
			<div className="option-holder">
				<input {...rest} type="checkbox" {...props.formRegister} />
				<label>{props.children}</label>
			</div>
		</div>
	);
};
