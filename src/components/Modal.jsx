import { useEffect } from "react";
import { classNames } from "../lib/hrUtils";

export default function Modal({ open, title, onClose, children, disableClose }) {
    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    if (!open) return null;

    const onBackdrop = () => {
        if (disableClose) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onBackdrop} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[calc(100vh-2rem)] flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={disableClose}
                            className={classNames(
                                "rounded-lg border border-gray-300 cursor-pointer shadow-md px-2 py-1 text-sm",
                                disableClose ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"
                            )}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="px-6 py-5 pt-0 overflow-y-auto create-test-modal">{children}</div>
                </div>
            </div>
        </div>
    );
}
