interface ReportStatCardProps {
  label: string
  value: string | number
  border: string
  bg: string
}

export function ReportStatCard({ label, value, border, bg }: ReportStatCardProps) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-3 shadow-md`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  )
}