import React from "react";
import "./Dialog.css"

export default function Dialog({ children, open, dismissCallback }: { children: React.ReactNode, open: boolean, dismissCallback: () => void }) {
	const dialogRef = React.useRef<HTMLDialogElement | null>(null);
	const [refActive, setRefActive] = React.useState(false);

	React.useEffect(() => {
		if (!refActive) return;
		if (open) dialogRef.current?.showModal();
		else dialogRef.current?.close();
	}, [open, refActive]);

	return (
		<dialog ref={(node) => { dialogRef.current = node; setRefActive(node != null) }} onClick={dismissCallback}>
			<div className="dialog-content" onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</dialog>
	);
}