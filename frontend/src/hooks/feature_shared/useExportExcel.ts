import { toast } from '@/utils/states/state';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export const useExportExcel = () => {
    const [isLoadingData, setIsLoadingData] = useState(false);

    const exportToExcel = async (
        fetchData: () => Promise<any[]>,
        formatData: (data: any[]) => any[],
        fileNamePrefix: string
    ) => {
        try {
            setIsLoadingData(true);
            const data = await fetchData();
            if (!data || data.length === 0) {
                toast.value = {
                    ...toast.value,
                    message: 'No data available to export.',
                    type: 'error',
                };
                return;
            }

            const formattedData = formatData(data);

            // Create the Excel file
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

            // Generate a timestamped filename using server-adjusted time (NEVER rely on device clock)
            const { serverTimeOffset } = await import('@/utils/states/useAppStore').then(m => ({ serverTimeOffset: m.useAppStore.getState().serverTimeOffset }));
            const now = new Date(Date.now() + serverTimeOffset);
            const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
            const fileName = `${fileNamePrefix}_${timestamp}.xlsx`;

            // Save the file
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast.value = {
                ...toast.value,
                message: 'Error exporting data to Excel',
                type: 'error',
            };
        } finally {
            // Đảm bảo luôn kết thúc trạng thái tải
            setIsLoadingData(false);
        }
    };
    return {isLoadingData, exportToExcel}
}
