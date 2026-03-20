import { useEffect, useMemo, useState, useCallback } from "react"
import toast from "react-hot-toast"

import {
  createHrTest,
  getHrMeta,
  getHrTests,
  updateHrTest,
  deleteHrTest,
} from "../api/hrApi"

import { onlyDigits } from "../lib/hrUtils"
import { normalizeRow } from "../lib/hrNormalizer"
import { readPaged } from "../lib/readPaged"
import { DEFAULT_FORM } from "../constants/hrConstants"

import { HrForm, HrMeta, HrRow, FormErrors } from "../types/hr"

export function useHrData() {

  const [form, setForm] = useState<HrForm>(DEFAULT_FORM)
  const [meta, setMeta] = useState<HrMeta>({ levels: [], techStacks: [] })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const [rows, setRows] = useState<HrRow[]>([])
  const [loadingTable, setLoadingTable] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [editRow, setEditRow] = useState<HrRow | null>(null)

  const [openCreate, setOpenCreate] = useState(false)

  const [openDelete, setOpenDelete] = useState(false)
  const [deleteRow, setDeleteRow] = useState<HrRow | null>(null)

  const setField = (key: keyof HrForm, value: any) => {
    setForm((p) => ({ ...p, [key]: value }))
  }

  const validate = () => {

    const next: FormErrors = {}
    const phone = onlyDigits(form.phoneNumber)

    if (!form.firstName.trim()) next.firstName = "First name required"
    if (!form.lastName.trim()) next.lastName = "Last name required"
    if (!form.email.trim()) next.email = "Email required"

    if (!phone) next.phoneNumber = "Phone required"
    else if (phone.length !== 10)
      next.phoneNumber = "Enter valid 10 digit phone"

    setErrors(next)

    return Object.keys(next).length === 0
  }

  const loadTests = useCallback(async (targetPage = 1) => {

    setLoadingTable(true)

    try {

      const res = await getHrTests({
        page: targetPage,
        pageSize,
      })

      const paged = readPaged(res?.data ?? res)

      if (paged) {
        setRows(paged.items.map(normalizeRow))
        setPage(paged.page)
        setTotalPages(paged.totalPages)
        setTotalCount(paged.totalCount ?? 0)
        return
      }

      if (Array.isArray(res)) {
        setRows(res.map(normalizeRow))
        setTotalPages(1)
        setTotalCount(res.length)
      }

    } catch (e: any) {

      toast.error(e?.message || "Failed to load tests")

    } finally {

      setLoadingTable(false)

    }

  }, [pageSize])

  const handleCreate = async (e: React.FormEvent) => {

    e.preventDefault()

    if (submitting || !validate()) return

    try {

      setSubmitting(true)

      const payload = {
        fullName: `${form.firstName} ${form.lastName}`,
        email: form.email.trim().toLowerCase(),
        phoneNumber: onlyDigits(form.phoneNumber),
        totalQuestions: Number(form.totalQuestions),
        durationMinutes: Number(form.durationMinutes),
        level: form.level,
        techStackIds: form.techStackIds,
      }

      if (editRow?.testId) {

        await updateHrTest(String(editRow.testId), payload)
        toast.success("Test updated successfully")

      } else {

        await createHrTest(payload)
        toast.success("Test created successfully")

      }

      setOpenCreate(false)

      await loadTests(page)

    } catch (e: any) {

      toast.error(e?.message || "Operation failed")

    } finally {

      setSubmitting(false)

    }

  }

  const openCreateModal = () => {

    setEditRow(null)
    setForm(DEFAULT_FORM)
    setErrors({})
    setOpenCreate(true)

  }

  const closeCreateModal = () => {
    setOpenCreate(false)
  }

  const handleEdit = (row: HrRow) => {

    setEditRow(row)

    const names = (row.applicantName || "").split(" ")

    // ✅ FIX: map tech stack names → GUIDs using techOptionsNormalized
    const resolvedTechIds = (row.techStacks || [])
      .map((name) => {
        const match = techOptionsNormalized.find(
          (o) => o.label.toLowerCase() === String(name).toLowerCase()
        )
        return match?.value ?? ""
      })
      .filter(Boolean)

    setForm({
      ...DEFAULT_FORM,
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",   
      email: row.email || "",
      phoneNumber: row.phoneNumber || "",
      totalQuestions: String(row.totalQuestions || ""),
      durationMinutes: String(row.durationMinutes || ""),
      level: row.level || "",
      techStackIds: resolvedTechIds,           
    })

    setOpenCreate(true)

  }

  const handleDeleteClick = (row: HrRow) => {
    setDeleteRow(row)
    setOpenDelete(true)
  }

  const confirmDelete = async () => {

    if (!deleteRow) return

    try {

      setSubmitting(true)

      await deleteHrTest(String(deleteRow.testId))

      toast.success("Test deleted")

      setOpenDelete(false)

      await loadTests(page)

    } catch (e: any) {

      toast.error(e?.message || "Delete failed")

    } finally {

      setSubmitting(false)

    }

  }

  const goToPage = (p: number) => {

    if (p === page) return

    loadTests(p)

  }

  useEffect(() => {

    async function loadMeta() {

      try {

        const m = await getHrMeta()

        setMeta({
          levels: m?.levels ?? [],
          techStacks: m?.techStacks ?? [],
        })

        await loadTests(1)

      } catch (e: any) {

        toast.error(e?.message || "Failed loading meta")

      }

    }

    loadMeta()

  }, [loadTests])

  /**
   * FIXED: Normalize tech stack options
   * MultiSelectDropdown expects { value, label }
   */
  const techOptionsNormalized = useMemo(() => {
    return (meta.techStacks || [])
      .map((x: any) => ({
        value: String(x.id ?? x.Id ?? ""),
        label: String(x.name ?? x.Name ?? ""),
      }))
      .filter((x) => x.value && x.label)
  }, [meta.techStacks])

  return {
    form,
    setField,
    errors,
    submitting,

    meta,

    rows,
    loadingTable,

    editRow,

    openCreate,
    openCreateModal,
    closeCreateModal,

    openDelete,
    deleteRow,
    setOpenDelete,

    handleCreate,
    handleEdit,
    handleDeleteClick,
    confirmDelete,

    techOptionsNormalized,

    page,
    totalPages,
    totalCount,
    pageSize,

    goToPage,

    loadTests,
  }
}