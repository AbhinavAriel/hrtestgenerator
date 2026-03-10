import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useHrData } from "../hooks/useHrData";
import { getHrTestReport } from "../api/hrApi";
import HrCreateEditModal from "../components/HrCreateEditModal";
import HrDeleteModal from "../components/HrDeleteModal";
import HrTable from "../components/HrTable";
import HrTestReportView from "../components/HrTestReportView";
import { clearAdminSession } from "../lib/adminAuth";

export default function HrCreateTest() {
  const navigate = useNavigate();

  const {
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
  } = useHrData();

  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("hr_active_tab") || "table";
  });

  const [openTabs, setOpenTabs] = useState(() => {
    const stored = sessionStorage.getItem("hr_open_tabs");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    sessionStorage.setItem("hr_open_tabs", JSON.stringify(openTabs));
  }, [openTabs]);

  useEffect(() => {
    sessionStorage.setItem("hr_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const reloadReports = async () => {
      for (const tab of openTabs) {
        if (!tab.report) {
          try {
            const report = await getHrTestReport(tab.key);

            setOpenTabs((prev) =>
              prev.map((t) =>
                t.key === tab.key
                  ? { ...t, report, loading: false }
                  : t
              )
            );
          } catch {
            console.error("Failed to reload report");
          }
        }
      }
    };

    if (openTabs.length) reloadReports();
  }, []);

  const handleOpenTab = async (row) => {
    const testId = row?.testId ?? row?.TestId ?? row?.id ?? row?.Id;
    if (!testId) return;

    const existing = openTabs.find((x) => x.key === testId);
    if (existing) {
      setActiveTab(testId);
      return;
    }

    const label = row?.applicantName ?? row?.ApplicantName ?? "Details";

    setOpenTabs((prev) => [
      ...prev,
      {
        key: testId,
        label,
        loading: true,
        report: null,
      },
    ]);

    setActiveTab(testId);

    try {
      const report = await getHrTestReport(testId);

      setOpenTabs((prev) =>
        prev.map((tab) =>
          tab.key === testId
            ? { ...tab, loading: false, report }
            : tab
        )
      );
    } catch (e) {
      toast.error(e?.message || "Failed to load report");
    }
  };

  const handleCloseTab = (tabKey) => {
    setOpenTabs((prev) => {
      const next = prev.filter((x) => x.key !== tabKey);

      if (activeTab === tabKey) {
        setActiveTab(next.length ? next[next.length - 1].key : "table");
      }

      return next;
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("hr_open_tabs");
    sessionStorage.removeItem("hr_active_tab");
    clearAdminSession();
    navigate("/admin-login", { replace: true });
  };

  const activeTabData = useMemo(
    () => openTabs.find((x) => x.key === activeTab) || null,
    [openTabs, activeTab]
  );

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="flex flex-col gap-3 lg:flex-row sm:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Ariel HR Test Generator
            </h1>
            <p className="text-sm text-blue-500">
              Create a candidate entry and generate a test.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center cursor-pointer rounded-xl border border-red-200 bg-red-100 px-5 py-2.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-200"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/questions/create")}
              className="inline-flex items-center justify-center cursor-pointer rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              + Create Question
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center cursor-pointer rounded-xl bg-linear-to-r from-blue-400 to-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl transition hover:bg-blue-700"
            >
              + Create Test
            </button>
          </div>
        </header>

        <HrCreateEditModal
          open={openCreate}
          onClose={closeCreateModal}
          form={form}
          setField={setField}
          errors={errors}
          submitting={submitting}
          editRow={editRow}
          meta={meta}
          techOptionsNormalized={meta?.techStacks || []}
          onSubmit={handleCreate}
        />

        <HrDeleteModal
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          onConfirm={confirmDelete}
          deleteRow={deleteRow}
          submitting={submitting}
        />

        <div className="mt-8">
          <div className="flex flex-wrap items-end gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={`rounded-t-xl px-4 py-2 text-sm font-medium transition cursor-pointer ${
                activeTab === "table"
                  ? "bg-white text-blue-800 border border-b-white border-gray-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Created Tests
            </button>

            {openTabs.map((tab) => (
              <div
                key={tab.key}
                className={`flex items-center gap-2 cursor-pointer rounded-t-xl px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-white text-blue-800 border cursor-pointer border-b-white border-gray-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <button
                  type="button" className="cursor-pointer"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>

                <button
                  type="button"
                  onClick={() => handleCloseTab(tab.key)}
                  className="rounded-full px-1 text-xs text-red-500 cursor-pointer hover:font-semibold hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {activeTab === "table" ? (
            <HrTable
              rows={rows}
              loadingTable={loadingTable}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onOpenTab={handleOpenTab}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={goToPage}
            />
          ) : (
            <HrTestReportView
              report={activeTabData?.report}
              loading={activeTabData?.loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}