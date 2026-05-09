import { useState } from 'react';
import { useAppStore } from '@/utils/states/useAppStore';
import { useExportExcel } from '@/hooks/feature_shared/useExportExcel';
import { toast } from '@/utils/states/state';

/**
 * Formats ISO datetime strings (e.g. "2026-05-05T07:43:05.810") in all fields 
 * of each row to local timezone "yyyy-mm-dd hh:mm:ss" format.
 */
const formatDateFields = (rows: any[]): any[] => {
    return rows.map(row => {
        const newRow = { ...row };
        Object.keys(newRow).forEach(key => {
            const val = newRow[key];
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                const d = new Date(val);
                if (!isNaN(d.getTime())) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const hh = String(d.getHours()).padStart(2, '0');
                    const min = String(d.getMinutes()).padStart(2, '0');
                    const ss = String(d.getSeconds()).padStart(2, '0');
                    newRow[key] = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
                }
            }
        });
        return newRow;
    });
};

/**
 * Adds 1 day to a date string (yyyy-mm-dd) and returns the new date string.
 * Handles month/year boundaries correctly via JS Date.
 */
const addOneDay = (dateStr: string): string => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

interface UseReportDataOptions {
    /** The API function to call: (factory, fromDate, toDate) => Promise<any[]> */
    fetchApi: (factory: string, fromDate: string, toDate: string) => Promise<any>;
    /** Prefix for the exported Excel filename */
    exportFilePrefix: string;
}

/**
 * Shared hook that manages report state, data fetching, date formatting, and Excel export.
 * Used by all report pages (Moisture, Inspection, CTQ, etc.).
 */
export const useReportData = ({ fetchApi, exportFilePrefix }: UseReportDataOptions) => {
    const factory = useAppStore(state => state.factory);

    const today = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const { isLoadingData: isExporting, exportToExcel } = useExportExcel();

    const handleLoadData = async (t: any) => {
        if (!fromDate || !toDate) {
            toast.value = { ...toast.value, message: 'Please select From Date and To Date', type: 'warning' };
            return;
        }
        setLoading(true);
        try {
            const apiToDate = addOneDay(toDate);
            const res = await fetchApi(factory, fromDate, apiToDate);
            let formattedData = Array.isArray(res) ? res : [];
            formattedData = formatDateFields(formattedData);
            setData(formattedData);
            if (res && res.length === 0) {
                toast.value = { ...toast.value, message: t.common.noData, type: 'info' };
            }
        } catch (error) {
            console.error(error);
            toast.value = { ...toast.value, message: t.common.loadFailed, type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        exportToExcel(
            async () => data,
            (d) => d,
            `${exportFilePrefix}_${factory}`
        );
    };

    const columns = data.length > 0
        ? Object.keys(data[0]).map(key => ({
            field: key,
            headerName: key,
            minWidth: 150,
            flex: 1,
        }))
        : [];

    return {
        fromDate, setFromDate,
        toDate, setToDate,
        data, loading,
        isExporting,
        columns,
        handleLoadData,
        handleExport,
    };
};
