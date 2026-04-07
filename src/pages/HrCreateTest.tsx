import { useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useHrData } from "../hooks/useHrData"
import { useHrTabs } from "../hooks/useHrTabs"
import HrCreateEditModal from "../components/HrCreateEditModal"
import HrDeleteModal from "../components/HrDeleteModal"
import HrTable from "../components/hrTable/HrTable"
import HrTestReportView from "../components/HrTestReportView"
import { logoutAdmin } from "../lib/adminAuth"

export default function HrCreateTest() {

  const navigate = useNavigate()

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
    loadTests,
  } = useHrData()

  const {
    activeTab,
    setActiveTab,
    openTabs,
    openTab,
    closeTab,
    updateTabReport,
  } = useHrTabs()

  const handleLogout = () => {
    sessionStorage.removeItem("hr_open_tabs")
    sessionStorage.removeItem("hr_active_tab")
    logoutAdmin()
    navigate("/admin-login", { replace: true })
  }

  const activeTabData = useMemo(
    () => openTabs.find((x) => x.key === activeTab) || null,
    [openTabs, activeTab]
  )

  /**
   * Called by HrTestReportView after the admin successfully cancels a result.
   *
   * Two things must happen in sync:
   *   1. Patch the tab's cached report so the tab badge/banner updates immediately
   *      without needing a re-fetch.
   *   2. Reload the current table page so the "Result" column in the row reflects
   *      the new "Cancelled" / rejected state right away.
   */
  const handleCancelResult = useCallback(async (testId: string, reason: string) => {
    // 1. Patch the in-memory tab report — isRejected + cancellationReason
    updateTabReport(testId, {
      isRejected: true,
      IsRejected: true,
      cancellationReason: reason,
      CancellationReason: reason,
    })

    // 2. Re-fetch the current table page to update the row's Result badge
    await loadTests(page)
  }, [updateTabReport, loadTests, page])

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* HEADER */}
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
              onClick={handleLogout}
              className="rounded-xl border cursor-pointer border-red-200 bg-red-100 px-5 py-2.5 text-sm text-red-700 hover:bg-red-200"
            >
              Logout
            </button>

            <button
              onClick={() => navigate("/admin/questions/create")}
              className="rounded-xl border cursor-pointer border-blue-200 bg-white px-5 py-2.5 text-sm text-blue-700 hover:bg-blue-50"
            >
              + Create Question
            </button>

            <button
              onClick={openCreateModal}
              className="rounded-xl cursor-pointer bg-linear-to-r from-blue-400 to-blue-900 px-5 py-2.5 text-sm text-white"
            >
              + Create Test
            </button>

          </div>

        </header>

        {/* MODALS */}

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

        {/* TABS */}

        <div className="mt-8">

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() => setActiveTab("table")}
              className={`rounded-t-xl px-4 py-2 text-sm cursor-pointer ${
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
                className={`flex items-center gap-2 rounded-t-xl px-3 py-2 text-sm cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-white text-blue-800 border border-b-white border-gray-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <button onClick={() => setActiveTab(tab.key)} className="cursor-pointer">
                  {tab.label}
                </button>

                <button
                  onClick={() => closeTab(tab.key)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
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
              onOpenTab={openTab}
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
              onCancelResult={handleCancelResult}
            />

          )}

        </div>

      </div>
    </div>
  )
}