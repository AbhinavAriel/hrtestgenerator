interface Props {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
}

export default function HrTablePagination({
  page,
  totalPages,
  loading,
  onPageChange,
}: Props) {
  return (
    <div className="flex justify-end gap-2 p-4 border-t">
      <button
        disabled={page <= 1 || loading}
        onClick={() => onPageChange?.(page - 1)}
      >
        Prev
      </button>

      <button
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange?.(page + 1)}
      >
        Next
      </button>
    </div>
  );
}