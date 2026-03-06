import { useMemo, useState } from "react";
import { useHrData } from "../hooks/useHrData";
import HrCreateEditModal from "../components/HrCreateEditModal";
import HrDeleteModal from "../components/HrDeleteModal";
import HrTable from "../components/HrTable";

export default function HrCreateTest() {
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

  const [activeTab, setActiveTab] = useState("table");
  const [openTabs, setOpenTabs] = useState([]);

  const handleOpenTab = (row) => {
    const testId = row?.testId ?? row?.TestId ?? row?.id ?? row?.Id;
    if (!testId) return;

    setOpenTabs((prev) => {
      const exists = prev.some((x) => x.key === testId);
      if (exists) return prev;

      return [
        ...prev,
        {
          key: testId,
          label: row?.applicantName ?? row?.ApplicantName ?? "Details",
          data: row,
        },
      ];
    });

    setActiveTab(testId);
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

  const activeRow = useMemo(
    () => openTabs.find((x) => x.key === activeTab)?.data || null,
    [openTabs, activeTab]
  );

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Ariel HR Test Generator
            </h1>
            <p className="text-sm text-blue-500">Create a candidate entry and generate a test.</p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center cursor-pointer rounded-xl bg-linear-to-r from-blue-400 to-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl transition hover:bg-blue-700"
          >
            + Create Test
          </button>
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
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={`rounded-t-xl px-4 py-2 text-sm font-medium transition ${
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
                className={`flex items-center gap-2 rounded-t-xl px-3 py-2 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-white text-blue-800 border border-b-white border-gray-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="cursor-pointer"
                >
                  {tab.label}
                </button>

                <button
                  type="button"
                  onClick={() => handleCloseTab(tab.key)}
                  className="cursor-pointer rounded-full px-1 text-xs text-red-500 hover:bg-red-100 hover:text-red-700"
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
          ) : activeRow ? (
            <div className="rounded-b-2xl rounded-tr-2xl border border-t-0 border-gray-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-blue-800">Candidate Details</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Details for the selected candidate test record.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("table")}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50"
                >
                  Back to Table
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Candidate</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {activeRow?.applicantName ?? activeRow?.ApplicantName ?? "-"}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {activeRow?.email ?? activeRow?.Email ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Level</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {activeRow?.level ?? activeRow?.Level ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</div>
                  <div className="mt-1 text-base font-semibold capitalize text-gray-900">
                    {activeRow?.status ?? activeRow?.Status ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Questions</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {activeRow?.totalQuestions ?? activeRow?.TotalQuestions ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Duration</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {activeRow?.durationMinutes ?? activeRow?.DurationMinutes ?? "-"} min
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Answered</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {activeRow?.answeredCount ?? activeRow?.AnsweredCount ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Correct</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {activeRow?.correctCount ?? activeRow?.CorrectCount ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Tech Stack</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(activeRow?.techStacks ?? activeRow?.TechStacks ?? []).map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}