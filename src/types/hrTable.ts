export interface RowData {
  testId?: number | string;
  serialNo?: number;

  applicantName?: string;
  email?: string;

  level?: string;
  totalQuestions?: number;
  durationMinutes?: number;

  techStacks?: string[];

  status?: string;

  answeredCount?: number;
  correctCount?: number;
  scorePercentage?: number;
  isPassed?: boolean;
  isRejected?: boolean;
  cancellationReason?: string | null;

  testToken?: string;
}

export interface HrTableProps {
  rows?: RowData[];
  loadingTable?: boolean;

  onEdit?: (row: RowData) => void;
  onDelete?: (row: RowData) => void;
  onOpenTab?: (row: RowData) => void;

  page?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;

  onPageChange?: (page: number) => void;
}