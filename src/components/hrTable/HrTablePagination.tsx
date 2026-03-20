interface Props {
  page: number;
  totalPages: number;
  pageSize?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
}

export default function HrTablePagination({
  page,
  totalPages,
  pageSize = 10,
  loading,
  onPageChange,
}: Props) {
  const safePageChange = (next: number) => {
    if (!onPageChange || loading) return;
    if (next < 1 || next > totalPages) return;
    onPageChange(next);
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
      <div className="text-xs text-gray-600">
        Page <span className="font-medium text-black">{page}</span> of{" "}
        <span className="font-medium text-black">{totalPages}</span> • Showing{" "}
        <span className="font-medium text-black">{pageSize}</span> per page
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => safePageChange(page - 1)}
          className="rounded-lg border border-gray-200 px-3 cursor-pointer disabled:cursor-default py-1.5 text-sm disabled:opacity-50"
        >
          Prev
        </button>

        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => safePageChange(page + 1)}
          className="rounded-lg border border-gray-200 px-3 cursor-pointer disabled:cursor-default py-1.5 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}