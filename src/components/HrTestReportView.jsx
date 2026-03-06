export default function HrTestReportView({ report, loading = false }) {
  if (loading) {
    return <div className="p-6 text-gray-600">Loading report...</div>;
  }

  if (!report) {
    return <div className="p-6 text-gray-600">No report found.</div>;
  }

  const questions = report.questions ?? report.Questions ?? [];
  const techStacks = report.techStacks ?? report.TechStacks ?? [];

  return (
    <div className="rounded-b-2xl rounded-tr-2xl border border-t-0 border-gray-200 bg-white p-6 shadow-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Test Preview</h1>
            <p className="text-sm text-gray-600">
              TestId: <span className="font-mono">{report.testId ?? report.TestId}</span>
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize">
            {report.status ?? report.Status ?? "-"}
          </span>
        </div>

        <div className="grid grid-cols-4 mt-4 gap-3">
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-3 shadow-md ">
              <div className="text-xs text-gray-500">Total Questions</div>
              <div className="text-lg font-bold text-gray-900">
                {report.totalQuestions ?? report.TotalQuestions ?? 0}
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 shadow-md">
              <div className="text-xs text-gray-500">Duration</div>
              <div className="text-lg font-bold text-gray-900">
                {report.durationMinutes ?? report.DurationMinutes ?? 0} min
              </div>
            </div>

            <div className="rounded-xl border border-red-100 bg-red-50 p-3 shadow-md">
              <div className="text-xs text-gray-500">Answered</div>
              <div className="text-lg font-bold text-gray-900">
                {report.answeredCount ?? report.AnsweredCount ?? 0}
              </div>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50 p-3 shadow-md">
              <div className="text-xs text-gray-500">Correct</div>
              <div className="text-lg font-bold text-gray-900">
                {report.correctCount ?? report.CorrectCount ?? 0}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 ">
            <div>
              <div className="text-sm text-gray-800 mb-2">Candidate</div>
              <div className="grid grid-cols-3 w-full">
                <div className="">
                  <div className="text-xs text-gray-500">name</div>
                  <div className="font-semibold text-sm text-gray-900">
                    {report.applicantName ?? report.ApplicantName}
                  </div>
                </div>
                <div className="">
                  <div className="text-xs text-gray-500">email</div>
                  <div className="text-sm font-semibold text-gray-900">{report.email ?? report.Email}</div>
                </div>
                <div className="">
                  <div className="text-xs text-gray-500">phone</div>
                  <div className="text-sm font-semibold text-gray-900">{report.phoneNumber ?? report.PhoneNumber}</div>
                </div>
              </div>
            </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {techStacks.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            No questions found for this test.
          </div>
        ) : (
          questions.map((q) => {
            const questionId = q.questionId ?? q.QuestionId;
            const order = q.order ?? q.Order;
            const text = q.text ?? q.Text;
            const selectedId = q.selectedOptionId ?? q.SelectedOptionId;
            const selectedOptionText = q.selectedOptionText ?? q.SelectedOptionText;
            const correctId = q.correctOptionId ?? q.CorrectOptionId;
            const correctOptionText = q.correctOptionText ?? q.CorrectOptionText;
            const isCorrect = q.isCorrect ?? q.IsCorrect;
            const options = q.options ?? q.Options ?? [];

            return (
              <div key={questionId} className="rounded-xl border p-4 mb-4 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Question {order}</h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedId ? (isCorrect ? "correct" : "wrong") : "skipped"}
                  </span>
                </div>

                <p className="mt-2 text-gray-800">{text}</p>

                <div className="mt-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Selected: </span>
                    <span className={selectedId ? "text-gray-900" : "text-gray-500"}>
                      {selectedOptionText || "Not answered"}
                    </span>
                  </div>

                  <div className="mt-1">
                    <span className="font-semibold text-gray-700">Correct: </span>
                    <span className="text-gray-900">{correctOptionText || "-"}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {options.map((opt) => {
                    const optId = opt.id ?? opt.Id;
                    const optText = opt.text ?? opt.Text;

                    const isSelected = selectedId && optId === selectedId;
                    const isCorrectOpt = correctId && optId === correctId;

                    return (
                      <div
                        key={optId}
                        className={`rounded-lg border px-4 py-2 text-sm flex items-center justify-between
                          ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                          ${isCorrectOpt ? "border-green-500" : ""}`}
                      >
                        <span className="text-gray-800">{optText}</span>

                        <div className="flex gap-2">
                          {isSelected && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              Selected
                            </span>
                          )}
                          {isCorrectOpt && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Correct
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}