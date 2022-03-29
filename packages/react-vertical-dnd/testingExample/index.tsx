import React, { useDebugValue, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import DragAndDrop, { arrWithReposition } from "../src/reactDragAndDrop";

const newElement = () => ({
	id: `item-${Math.floor(Math.random() * 1e15)}`,
	value: Math.floor(Math.random() * 1e15),
	color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
	height: 30 + Math.floor(Math.random() * 50),
});

const TestingExample = () => {
	const [state, setState] = React.useState(new Array(5).fill("").map(() => newElement()));
	useEffect(() => {
		document.addEventListener("keydown", event => {
			if (event.key == "i") {
				setInterval(() => {
					setState(state => [newElement(), ...state]);
				}, 5000);
			}
		});
	}, []);
	const handleDragEnd = (fromIndex: number, toIndex: number) => {
		setState(arrWithReposition(state, fromIndex, toIndex));
	};
	return (
		<div className="listContainer">
			<DragAndDrop
				items={state}
				onDragEnd={handleDragEnd}
				render={items => (
					<>
						{items.map(([item, dragProps, itemIsDragging]) => (
							<div
								key={item.id}
								{...dragProps}
								style={{ ...dragProps.style, height: item.height, backgroundColor: item.color }}
								className={`draggable${itemIsDragging ? " dragging" : ""}`}>
								{item.value}
							</div>
						))}
					</>
				)}
			/>
		</div>
	);
};

ReactDOM.render(
	<React.StrictMode>
		<TestingExample />
	</React.StrictMode>,
	document.getElementById("reactRoot")
);
