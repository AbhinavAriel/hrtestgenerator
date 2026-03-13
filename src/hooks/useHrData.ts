import { useEffect, useMemo, useState, useCallback } from "react"
import toast from "react-hot-toast"

import {
  createHrTest,
  getHrMeta,
  getHrTests,
  getHrTestById,
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

      const paged = readPaged(res)

      if (paged) {
        setRows(paged.items.map(normalizeRow))
        setPage(paged.page)
        setTotalPages(paged.totalPages)
        return
      }

      if (Array.isArray(res)) {
        setRows(res.map(normalizeRow))
        setTotalPages(1)
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

      await createHrTest(payload)

      toast.success("Test created successfully")

      await loadTests(page)

    } catch (e: any) {

      toast.error(e?.message || "Operation failed")

    } finally {

      setSubmitting(false)

    }

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

  const techOptionsNormalized = useMemo(() => {
    return (meta.techStacks || [])
      .map((x: any) => ({
        id: String(x.id ?? x.Id),
        name: x.name ?? x.Name,
      }))
      .filter((x) => x.id && x.name)
  }, [meta.techStacks])

  return {
    form,
    setField,
    errors,
    submitting,
    rows,
    loadingTable,
    techOptionsNormalized,
    handleCreate,
    page,
    totalPages,
    loadTests,
  }
}