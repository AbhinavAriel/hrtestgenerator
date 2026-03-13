import { RowData } from "../../types/hrTable";

interface Props {
  row: RowData;
  onEdit?: (row: RowData) => void;
  onDelete?: (row: RowData) => void;
  onPreview?: (id?: number | string) => void;
}

export default function HrTableRow({ row, onEdit, onDelete, onPreview }: Props) {
  const isSubmitted = row.status?.toLowerCase() === "submitted";

  return (
    <tr className="hover:bg-gray-100 text-center">
      <td className="p-3">{row.serialNo}</td>

      <td className="p-3">
        <div className="font-semibold">{row.applicantName}</div>
        <div className="text-xs text-gray-500">{row.email}</div>
      </td>

      <td className="p-3">{row.level}</td>

      <td className="p-3">{row.totalQuestions}</td>

      <td className="p-3">{row.durationMinutes} min</td>

      <td className="p-3">{row.status}</td>

      <td className="p-3">{isSubmitted ? row.answeredCount : "-"}</td>

      <td className="p-3">{isSubmitted ? row.correctCount : "-"}</td>

      <td className="p-3 flex justify-end gap-2">
        <button onClick={() => onEdit?.(row)}>Edit</button>
        <button onClick={() => onDelete?.(row)}>Delete</button>

        {isSubmitted && (
          <button onClick={() => onPreview?.(row.testId)}>View</button>
        )}
      </td>
    </tr>
  );
}