import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export const RadioOption = (props: {
	options: { value: string; label: string }[];
	formRegister: UseFormRegisterReturn;
}) => {
	return (
		<div className="radio-option option-field">
			{props.options.map(option => (
				<div
					className="radio-option-pair"
					key={option.value}
					style={{
						margin: "7px 0px",
					}}>
					<label>
						<input type="radio" {...props.formRegister} value={option.value} /> {option.label}
					</label>
				</div>
			))}
		</div>
	);
};
