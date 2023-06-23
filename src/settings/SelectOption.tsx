import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import "./SelectOption.css"

type SelectOptionProps = React.InputHTMLAttributes<HTMLInputElement> & {
	formRegister: UseFormRegisterReturn;
	children: React.ReactNode;
	items: { value: any, label: string }[];
	disabled?: boolean;
};

export const SelectOption = ({ formRegister, children, items, disabled, title }: SelectOptionProps) => {
	return (
		<div className={`select-option option-field${disabled ? " disabled" : ""}`} title={title}>
			<label>
				{children}
				<select {...formRegister} disabled={disabled}>
					{items.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
				</select>
			</label>
		</div>
	);
};
