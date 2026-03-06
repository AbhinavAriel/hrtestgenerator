import Modal from "./Modal";

export default function HrDeleteModal({ open, onClose, onConfirm, deleteRow, submitting }) {
    const candidateName =
        deleteRow?.applicantName ??
        deleteRow?.ApplicantName ??
        deleteRow?.fullName ??
        deleteRow?.FullName ??
        "";

    return (
        <Modal
            open={open}
            title="Confirm Delete"
            onClose={onClose}
            disableClose={submitting}
            subtitle=""
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-700">
                    Are you sure you want to delete this test for{" "}
                    <span className="font-semibold">{candidateName || "-"}</span>?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border cursor-pointer px-4 py-2 text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="rounded-xl bg-red-600 cursor-pointer px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {submitting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}