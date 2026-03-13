import { HrTableProps } from "../../types/hrTable";
import { useTableDrag } from "../../hooks/useTableDrag";
import HrTableRow from "./HrTableRow";
import HrTablePagination from "./HrTablePagination";

export default function HrTable({
  rows = [],
  page = 1,
  totalPages = 1,
  loadingTable,
  onEdit,
  onDelete,
  onPageChange,
}: HrTableProps) {
  const {
    scrollRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    stopDrag,
  } = useTableDrag();

  return (
    <div className="border rounded-xl bg-white">

      <div
        ref={scrollRef}
        className={`overflow-x-auto ${isDragging ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-center">
              <th>S.No</th>
              <th>Candidate</th>
              <th>Level</th>
              <th>Questions</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Answered</th>
              <th>Correct</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <HrTableRow
                key={row.testId}
                row={row}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      <HrTablePagination
        page={page}
        totalPages={totalPages}
        loading={loadingTable}
        onPageChange={onPageChange}
      />
    </div>
  );
}