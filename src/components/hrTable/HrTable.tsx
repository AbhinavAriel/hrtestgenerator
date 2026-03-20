import toast from "react-hot-toast";
import { HrTableProps } from "../../types/hrTable";
import { useTableDrag } from "../../hooks/useTableDrag";
import HrTableRow from "./HrTableRow";
import HrTablePagination from "./HrTablePagination";

export default function HrTable({
  rows = [],
  page = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 0,
  loadingTable,
  onEdit,
  onDelete,
  onOpenTab,
  onPageChange,
}: HrTableProps) {
  const { scrollRef, isDragging, handleMouseDown, handleMouseMove, stopDrag } =
    useTableDrag();

  const handleRowClick = (row: typeof rows[0]) => {
    const status = String(row?.status ?? "").trim().toLowerCase();
    if (status !== "submitted") {
      toast("This test has not been submitted yet.", { icon: "ℹ️" });
      return;
    }
    onOpenTab?.(row);
  };

  return (
    <div className="rounded-2xl rounded-tl-none border border-gray-200 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-blue-800">Created Tests</h2>
        <div className="text-sm text-gray-600">
          {loadingTable ? "Loading..." : `${totalCount} record(s)`}
        </div>
      </div>

      {/* Scrollable table */}
      <div
        ref={scrollRef}
        className={`overflow-x-auto custom-scroll ${isDragging ? "cursor-grabbing select-none" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-blue-800">
            <tr className="border-b border-gray-300 text-center">
              <th className="px-3 py-3">S.No</th>
              <th className="px-6 py-3">Candidate</th>
              <th className="px-6 py-3">Level</th>
              <th className="px-6 py-3">Questions</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Answered</th>
              <th className="px-6 py-3">Correct</th>
              <th className="px-6 py-3">Result</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && !loadingTable && (
              <tr>
                <td className="px-6 py-8 text-gray-500" colSpan={11}>
                  No tests yet.
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <HrTableRow
                key={row.testId}
                row={row}
                onEdit={onEdit}
                onDelete={onDelete}
                onRowClick={handleRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <HrTablePagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        loading={loadingTable}
        onPageChange={onPageChange}
      />

    </div>
  );
}