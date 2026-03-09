import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  createHrTest,
  getHrMeta,
  getHrTests,
  getHrTestById,
  updateHrTest,
  deleteHrTest,
} from "../api/hrApi";
import { onlyDigits } from "../lib/hrUtils";

const DEFAULT_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  totalQuestions: "10",
  durationMinutes: "20",
  level: "Beginner",
  techStackIds: [],
};

const normalizeRow = (r) => {
  if (!r || typeof r !== "object") return r;

  return {
    serialNo: r.serialNo ?? r.SerialNo ?? null,

    testId: r.testId ?? r.TestId ?? r.id ?? r.Id ?? null,
    applicantId: r.applicantId ?? r.ApplicantId ?? null,
    applicantName: r.applicantName ?? r.ApplicantName ?? r.fullName ?? r.FullName ?? null,
    email: r.email ?? r.Email ?? null,
    phoneNumber: r.phoneNumber ?? r.PhoneNumber ?? null,

    level: r.level ?? r.Level ?? null,
    totalQuestions: r.totalQuestions ?? r.TotalQuestions ?? null,
    durationMinutes: r.durationMinutes ?? r.DurationMinutes ?? null,
    techStacks: r.techStacks ?? r.TechStacks ?? r.techStack ?? r.TechStack ?? [],

    status: r.status ?? r.Status ?? "Created",
    answeredCount: r.answeredCount ?? r.AnsweredCount ?? 0,
    correctCount: r.correctCount ?? r.CorrectCount ?? 0,

    createdAtUtc: r.createdAtUtc ?? r.CreatedAtUtc ?? r.createdAt ?? r.CreatedAt ?? null,
    submittedAtUtc: r.submittedAtUtc ?? r.SubmittedAtUtc ?? null,
    testToken: r.testToken ?? r.TestToken ?? null,
    expiresAtUtc: r.expiresAtUtc ?? r.ExpiresAtUtc ?? null,
  };
};

const readPaged = (res) => {
  if (!res || typeof res !== "object") return null;

  const items = res.items ?? res.Items;
  if (!Array.isArray(items)) return null;

  const totalCount = res.totalCount ?? res.TotalCount ?? 0;
  const page = res.page ?? res.Page ?? 1;
  const pageSize = res.pageSize ?? res.PageSize ?? items.length ?? 10;
  const totalPages =
    res.totalPages ??
    res.TotalPages ??
    (pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1);

  return { items, totalCount, page, pageSize, totalPages };
};

export function useHrData() {
  const [form, setFormState] = useState(DEFAULT_FORM);
  const [meta, setMeta] = useState({ levels: [], techStacks: [] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [loadingTable, setLoadingTable] = useState(false);
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [editRow, setEditRow] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  const setField = (key, value) => {
    setFormState((p) => ({ ...p, [key]: value }));
    setErrors((p) => {
      const c = { ...p };
      delete c[key];
      return c;
    });
  };

  const resetForm = (levels = meta.levels) => {
    const defaultLevel =
      (Array.isArray(levels) && levels.length ? String(levels[0]) : "Beginner") || "Beginner";
    setFormState({ ...DEFAULT_FORM, level: defaultLevel });
    setErrors({});
  };

  const validate = () => {
    const next = {};
    const phone = onlyDigits(form.phoneNumber);
    const tq = Number(form.totalQuestions);
    const dm = Number(form.durationMinutes);

    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";

    if (!form.email.trim()) next.email = "Email is required";

    if (!phone) next.phoneNumber = "Phone number is required";
    else if (phone.length !== 10) next.phoneNumber = "Enter a valid 10-digit phone number";

    if (!Number.isFinite(tq) || tq < 1 || tq > 200)
      next.totalQuestions = "Total questions must be between 1 and 200";

    if (!Number.isFinite(dm) || dm < 1 || dm > 240)
      next.durationMinutes = "Duration must be between 1 and 240 minutes";

    if (!form.level) next.level = "Level is required";
    if (!form.techStackIds?.length) next.techStackIds = "Select at least 1 tech stack";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const techOptionsNormalized = useMemo(() => {
    return (meta.techStacks || [])
      .map((x) => ({
        id: String(x.id ?? x.Id),
        name: x.name ?? x.Name,
      }))
      .filter((x) => x.id && x.name);
  }, [meta.techStacks]);

  const mapTechNamesToIds = (names = []) => {
    const nameSet = new Set((names || []).map((n) => String(n).trim().toLowerCase()));
    return techOptionsNormalized
      .filter((t) => nameSet.has(String(t.name).trim().toLowerCase()))
      .map((t) => t.id);
  };

  const loadTests = useCallback(
    async (targetPage = 1) => {
      setLoadingTable(true);
      try {
        const res = await getHrTests({ page: targetPage, pageSize });

        const paged = readPaged(res);
        if (paged) {
          setRows(paged.items.map(normalizeRow));
          setTotalCount(paged.totalCount);
          setPage(paged.page);
          setTotalPages(paged.totalPages);
          return;
        }

        if (Array.isArray(res)) {
          setRows(res.map(normalizeRow));
          setTotalCount(res.length);
          setPage(targetPage);
          setTotalPages(1);
          return;
        }

        console.warn("Unexpected /hr/tests response:", res);
        setRows([]);
        setTotalCount(0);
        setPage(targetPage);
        setTotalPages(1);
      } catch (e) {
        toast.error(e?.message || "Failed to load tests");
      } finally {
        setLoadingTable(false);
      }
    },
    [pageSize]
  );

  const goToPage = useCallback(
    async (nextPage) => {
      if (loadingTable) return;
      if (nextPage < 1 || nextPage > totalPages) return;
      await loadTests(nextPage);
    },
    [loadingTable, totalPages, loadTests]
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    const normalizedEmail = form.email.trim().toLowerCase();

    const payload = {
      fullName: `${form.firstName}`.trim() + " " + `${form.lastName}`.trim(),
      email: normalizedEmail,
      phoneNumber: onlyDigits(form.phoneNumber),
      totalQuestions: Number(form.totalQuestions),
      durationMinutes: Number(form.durationMinutes),
      level: form.level,
      techStackIds: (form.techStackIds || []).map(String),
    };

    try {
      setSubmitting(true);

      if (editRow?.testId) {
        await updateHrTest(editRow.testId, payload);
        toast.success("Test updated successfully.");
      } else {
        await createHrTest(payload);
        toast.success("Test created successfully.");
      }

      // ✅ reload current page from server truth
      await loadTests(page);

      resetForm();
      setEditRow(null);
      setOpenCreate(false);
    } catch (err) {
      toast.error(err?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (row) => {
    try {
      setSubmitting(true);
      const nr = normalizeRow(row);
      setEditRow(nr);

      const detail = await getHrTestById(nr.testId);

      const applicant = detail?.applicant ?? detail?.Applicant ?? null;
      const test = detail?.test ?? detail?.Test ?? null;

      const fullName = applicant?.fullName ?? applicant?.FullName ?? "";
      const parts = String(fullName).trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const techNames =
        detail?.techStacks ??
        detail?.TechStacks ??
        test?.techStacks ??
        test?.TechStacks ??
        [];

      const techIds = mapTechNamesToIds(techNames);

      setFormState({
        firstName,
        lastName,
        email: applicant?.email ?? applicant?.Email ?? "",
        phoneNumber: applicant?.phoneNumber ?? applicant?.PhoneNumber ?? "",
        totalQuestions: String(test?.totalQuestions ?? test?.TotalQuestions ?? "10"),
        durationMinutes: String(test?.durationMinutes ?? test?.DurationMinutes ?? "20"),
        level: test?.level ?? test?.Level ?? "Beginner",
        techStackIds: techIds,
      });

      setErrors({});
      setOpenCreate(true);
    } catch (err) {
      toast.error(err?.message || "Unable to load test details.");
      setEditRow(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteRow(normalizeRow(row));
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteRow?.testId) return;

    try {
      setSubmitting(true);
      await deleteHrTest(deleteRow.testId);
      toast.success("Test deleted successfully.");

      // ✅ if last item deleted on page, fallback to previous page
      const nextPage = rows.length <= 1 && page > 1 ? page - 1 : page;
      await loadTests(nextPage);

      setOpenDelete(false);
      setDeleteRow(null);
    } catch (err) {
      toast.error(err?.message || "Unable to delete test.");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditRow(null);
    setErrors({});
    resetForm();
    setOpenCreate(true);
  };

  const closeCreateModal = () => {
    setOpenCreate(false);
    setEditRow(null);
    setErrors({});
    resetForm();
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const m = await getHrMeta();
        if (!mounted) return;

        setMeta({
          levels: m?.levels ?? m?.Levels ?? [],
          techStacks: m?.techStacks ?? m?.TechStacks ?? [],
        });

        await loadTests(1);
      } catch (e) {
        toast.error(e?.message || "Failed to load tests/meta");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadTests]);

  return {
    form,
    setField,
    errors,
    submitting,
    meta,
    techOptionsNormalized,

    rows,
    loadingTable,

    editRow,
    openCreate,
    openCreateModal,
    closeCreateModal,

    openDelete,
    deleteRow,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    confirmDelete,
    setOpenDelete,

    page,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
  };
}