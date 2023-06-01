import usePopupManager from "../src/PopupManager";
import React from "react";
import ReactDOM from "react-dom/client";

const TestPage = () => {
	const { PopupRenderer, popupsInfo } = usePopupManager({
		popup1: close => {
			return (
				<div className="popup1">
					This is alert 1<br />
					<button onClick={close}>close</button>
				</div>
			);
		},
		popup2: (close, testCallback: (message: String) => void) => {
			return (
				<div className="popup2">
					This is alert 2<br />
					<button onClick={() => testCallback("Test message")}>Send callback</button>
					<button onClick={close}>close</button>
				</div>
			);
		},
	});
	return (
		<div>
			<PopupRenderer />
			<button onClick={() => popupsInfo.popup1.trigger()}>Open popup 1</button>
			<button onClick={() => popupsInfo.popup2.trigger(message => alert(message))}>Open popup 2</button>
		</div>
	);
};

const root = ReactDOM.createRoot(document.getElementById("reactRoot")!);
root.render(
	<React.StrictMode>
		<TestPage />
	</React.StrictMode>
);

/*
TODO:
Part of the reason this was broken out into a sub-package was so that I could test the performance of the popup manager.
*/
