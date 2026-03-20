import { useCallback, useRef, useState } from "react"
import toast from "react-hot-toast"
import { getHrTestReport } from "../api/hrApi"
import { HrReportTab } from "../types/hrTabs"

export function useHrTabs() {

  const [activeTab, setActiveTabState] = useState<string>(
    () => sessionStorage.getItem("hr_active_tab") || "table"
  )

  const [openTabs, setOpenTabsState] = useState<HrReportTab[]>(() => {
    const stored = sessionStorage.getItem("hr_open_tabs")
    return stored ? JSON.parse(stored) : []
  })

  const setActiveTab = useCallback((key: string) => {
    sessionStorage.setItem("hr_active_tab", key)
    setActiveTabState(key)
  }, [])

  const setOpenTabs = useCallback((updater: (prev: HrReportTab[]) => HrReportTab[]) => {
    setOpenTabsState((prev) => {
      const next = updater(prev)
      
      const toStore = next.map(({ key, label, report }) => ({ key, label, loading: false, report }))
      sessionStorage.setItem("hr_open_tabs", JSON.stringify(toStore))
      return next
    })
  }, [])

  const openTab = useCallback(async (row: any) => {

    const testId = row?.testId ?? row?.TestId ?? row?.id ?? row?.Id
    if (!testId) return

    const existing = openTabs.find((x) => x.key === testId)
    if (existing) {
      setActiveTab(testId)
      return
    }

    const label = row?.applicantName ?? row?.ApplicantName ?? "Details"

    setOpenTabsState((prev) => {
      const next = [...prev, { key: testId, label, loading: true, report: null }]
      sessionStorage.setItem("hr_open_tabs", JSON.stringify(next))
      return next
    })
    setActiveTab(testId)

    try {

      const res: any = await getHrTestReport(testId)
      
      const outer = res?.data ?? res
      const report = outer?.isSuccess !== undefined ? outer.data : outer

      setOpenTabs((prev) =>
        prev.map((tab) =>
          tab.key === testId
            ? { ...tab, loading: false, report }
            : tab
        )
      )

    } catch (e: any) {
      toast.error(e?.message || "Failed to load report")
      setOpenTabs((prev) =>
        prev.map((tab) =>
          tab.key === testId ? { ...tab, loading: false } : tab
        )
      )
    }

  }, [openTabs, setActiveTab, setOpenTabs])

  const closeTab = useCallback((tabKey: string) => {

    setOpenTabsState((prev) => {
      const next = prev.filter((x) => x.key !== tabKey)
      sessionStorage.setItem("hr_open_tabs", JSON.stringify(next))

      if (activeTab === tabKey) {
        const fallback = next.length ? next[next.length - 1].key : "table"
        sessionStorage.setItem("hr_active_tab", fallback)
        setActiveTabState(fallback)
      }

      return next
    })

  }, [activeTab])

  return {
    activeTab,
    setActiveTab,
    openTabs,
    openTab,
    closeTab,
  }
}