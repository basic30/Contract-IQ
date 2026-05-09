import type { AnalysisReport } from "@/types";

// In-memory store for analysis reports
// In production, this would be replaced with a proper database
const reportStore = new Map<string, AnalysisReport>();

export function saveReport(report: AnalysisReport): void {
  reportStore.set(report.id, report);
}

export function getReport(id: string): AnalysisReport | null {
  return reportStore.get(id) || null;
}

export function deleteReport(id: string): boolean {
  return reportStore.delete(id);
}

export function getAllReports(): AnalysisReport[] {
  return Array.from(reportStore.values());
}
