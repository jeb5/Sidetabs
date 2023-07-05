import React from "react";
import "./Dialog.css"

export default function Dialog({ children, open, dismissCallback }: { children: React.ReactNode, open: boolean, dismissCallback: () => void }) {
	const dialogRef = React.useRef<HTMLDialogElement>(null);

	React.useEffect(() => {
		if (open) dialogRef.current?.showModal();
		else dialogRef.current?.close();
	}, [open, dialogRef.current]);

	return (
		<dialog ref={dialogRef} onClick={dismissCallback}>
			<div className="dialog-content" onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</dialog>
	);
}