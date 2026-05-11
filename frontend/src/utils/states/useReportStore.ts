import { create } from 'zustand';

interface ReportCache {
    data: any[];
    fromDate: string;
    toDate: string;
}

interface ReportStoreState {
    /** Cached report data keyed by report type (e.g. 'Moisture_Report', 'Inspection_Report', 'CTQ_Report') */
    reports: Record<string, ReportCache>;

    /** Set cached data for a specific report */
    setReportData: (key: string, data: any[], fromDate: string, toDate: string) => void;

    /** Update date range for a specific report */
    setReportDates: (key: string, fromDate: string, toDate: string) => void;

    /** Clear a specific report cache */
    clearReport: (key: string) => void;

    /** Clear all report caches */
    clearAllReports: () => void;
}

export const useReportStore = create<ReportStoreState>((set) => ({
    reports: {},

    setReportData: (key, data, fromDate, toDate) => set((state) => ({
        reports: {
            ...state.reports,
            [key]: { data, fromDate, toDate },
        },
    })),

    setReportDates: (key, fromDate, toDate) => set((state) => ({
        reports: {
            ...state.reports,
            [key]: { ...(state.reports[key] || { data: [] }), fromDate, toDate },
        },
    })),

    clearReport: (key) => set((state) => {
        const { [key]: _, ...rest } = state.reports;
        return { reports: rest };
    }),

    clearAllReports: () => set({ reports: {} }),
}));
