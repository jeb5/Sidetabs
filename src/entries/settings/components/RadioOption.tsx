import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import "./Option.css";

export const RadioOption = (props: { options: { value: string; label: string }[]; formRegister: UseFormRegisterReturn }) => {
	return (
		<div className="radio-option option-field">
			{props.options.map((option) => (
				<div
					className="radio-option-pair"
					key={option.value}
					style={{
						margin: "7px 0px",
					}}
				>
					<div className="option-holder">
						<input type="radio" {...props.formRegister} value={option.value} />
						<label>{option.label}</label>
					</div>
				</div>
			))}
		</div>
	);
};
