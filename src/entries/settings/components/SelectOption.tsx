import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import "./SelectOption.css"
import "./Option.css";

type SelectOptionProps = React.InputHTMLAttributes<HTMLInputElement> & {
	formRegister: UseFormRegisterReturn;
	children: React.ReactNode;
	items: { value: any; label: string }[];
	disabled?: boolean;
	indentLevel?: number;
};

export const SelectOption = ({ formRegister, children, items, disabled, title, indentLevel }: SelectOptionProps) => {
	return (
		<div
			className={`select-option option-field${disabled ? " disabled" : ""}`}
			title={title}
			style={{ marginLeft: (indentLevel ?? 0) * 30 }}
		>
			<label>
				{children}
				<select {...formRegister} disabled={disabled}>
					{items.map((item) => (
						<option key={item.value} value={item.value}>
							{item.label}
						</option>
					))}
				</select>
			</label>
		</div>
	);
};
