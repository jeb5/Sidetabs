import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type CheckBoxOptionProps = React.InputHTMLAttributes<HTMLInputElement> & {
	formRegister: UseFormRegisterReturn;
	children: React.ReactNode;
};

export const CheckBoxOption = (props: CheckBoxOptionProps) => {
	const { formRegister, children, title, ...rest } = props;
	return (
		<div className="checkbox-option option-field" title={title}>
			<label>
				<input {...rest} type="checkbox" {...props.formRegister} /> {props.children}
			</label>
		</div>
	);
};
