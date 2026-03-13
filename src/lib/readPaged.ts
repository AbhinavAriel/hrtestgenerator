export const readPaged = (res: any) => {

  if (!res || typeof res !== "object") return null

  const items = res.items ?? res.Items
  if (!Array.isArray(items)) return null

  const totalCount = res.totalCount ?? res.TotalCount ?? 0
  const page = res.page ?? res.Page ?? 1
  const pageSize = res.pageSize ?? res.PageSize ?? items.length ?? 10

  const totalPages =
    res.totalPages ??
    res.TotalPages ??
    Math.ceil(totalCount / pageSize)

  return { items, totalCount, page, pageSize, totalPages }
}