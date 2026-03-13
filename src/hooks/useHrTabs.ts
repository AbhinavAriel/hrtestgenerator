import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { getHrTestReport } from "../api/hrApi"
import { HrReportTab } from "../types/hrTabs"

export function useHrTabs() {

  const [activeTab, setActiveTab] = useState<string>(() =>
    sessionStorage.getItem("hr_active_tab") || "table"
  )

  const [openTabs, setOpenTabs] = useState<HrReportTab[]>(() => {
    const stored = sessionStorage.getItem("hr_open_tabs")
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    sessionStorage.setItem("hr_open_tabs", JSON.stringify(openTabs))
  }, [openTabs])

  useEffect(() => {
    sessionStorage.setItem("hr_active_tab", activeTab)
  }, [activeTab])

  const openTab = async (row: any) => {

    const testId =
      row?.testId ?? row?.TestId ?? row?.id ?? row?.Id

    if (!testId) return

    const existing = openTabs.find((x) => x.key === testId)

    if (existing) {
      setActiveTab(testId)
      return
    }

    const label =
      row?.applicantName ?? row?.ApplicantName ?? "Details"

    setOpenTabs((prev) => [
      ...prev,
      { key: testId, label, loading: true, report: null }
    ])

    setActiveTab(testId)

    try {

      const report = await getHrTestReport(testId)

      setOpenTabs((prev) =>
        prev.map((tab) =>
          tab.key === testId
            ? { ...tab, loading: false, report }
            : tab
        )
      )

    } catch (e: any) {
      toast.error(e?.message || "Failed to load report")
    }
  }

  const closeTab = (tabKey: string) => {

    setOpenTabs((prev) => {
      const next = prev.filter((x) => x.key !== tabKey)

      if (activeTab === tabKey) {
        setActiveTab(next.length ? next[next.length - 1].key : "table")
      }

      return next
    })
  }

  return {
    activeTab,
    setActiveTab,
    openTabs,
    openTab,
    closeTab
  }
}