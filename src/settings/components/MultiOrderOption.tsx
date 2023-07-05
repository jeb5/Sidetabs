import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import DragAndDrop from "react-vertical-dnd";
import "./MultiOrderOption.css";
import REORDER_ICON from "parcel-svg:../../assets/icons/Drag Handles.svg";

const arrWithReposition = (arr: any[], from: number, to: number) => {
	const result = [...arr];
	const [removed] = result.splice(from, 1);
	result.splice(to, 0, removed);
	return result;
};

export const MultiOrderOption = <T,>(props: {
	availableOptionLabels: { [name: string]: string };
	controlForm: Control;
	name: string;
	availableLabel: string;
	currentLabel: string;
}) => {
	const [selectedItem, setSelectedItem] = useState<string | null>(null);

	return (
		<Controller
			control={props.controlForm}
			name={props.name}
			render={({
				field: { onChange, value },
			}: {
				field: { onChange: (newState: string[]) => void; value: string[] };
			}) => (
				<div className="multi-order-option option-field" onClick={() => setSelectedItem(null)}>
					<div className="multi-order-available multi-order-options">
						<div className="multi-order-label">{props.availableLabel}</div>
						{Object.keys(props.availableOptionLabels)
							.filter(optionName => !value.includes(optionName))
							.map(optionName => (
								<div
									className={`multi-order-item${selectedItem === "a/" + optionName ? " multi-order-item-selected" : ""
										}`}
									key={optionName}
									onClick={event => {
										event.stopPropagation();
										setSelectedItem("a/" + optionName);
									}}>
									<div className="multi-order-item-icon"></div>
									<div className="multi-order-item-label">{props.availableOptionLabels[optionName]}</div>
								</div>
							))}
					</div>
					<div className="multi-order-centre">
						<button
							className="multi-order-button"
							disabled={selectedItem === null}
							onClick={() => {
								if (selectedItem === null) return;
								setSelectedItem(null);
								const actualItem = selectedItem.split("/")[1];
								if (selectedItem.startsWith("a/")) {
									onChange([...value, actualItem]);
								} else {
									onChange(value.filter(item => item !== actualItem));
								}
							}}>
							{selectedItem?.startsWith("a/") ? ">" : "<"}
						</button>
					</div>
					<div className="multi-order-current multi-order-options">
						<div className="multi-order-label">{props.currentLabel}</div>
						<DragAndDrop
							items={value.map(value => ({ name: value, label: props.availableOptionLabels[value], id: value }))}
							onDragEnd={(from, to) => {
								onChange(arrWithReposition(value, from, to));
							}}
							onDragStart={(item, dragEvent) => { }}
							render={items => (
								<>
									{items.map(([option, dragProps, isDragging]) => (
										<div
											className={`multi-order-item${selectedItem === "c/" + option.name ? " multi-order-item-selected" : ""
												}${isDragging ? " multi-order-item-dragging" : ""}`}
											{...dragProps}
											key={option.name}
											onClick={event => {
												event.stopPropagation();
												setSelectedItem("c/" + option.name);
											}}>
											<div className="multi-order-item-icon">
												<REORDER_ICON />
											</div>
											<div className="multi-order-item-label">{option.label}</div>
										</div>
									))}
								</>
							)}
						/>
					</div>
				</div>
			)}
		/>
	);
};
