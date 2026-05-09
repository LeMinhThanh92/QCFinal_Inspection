import { useReportData } from '@/hooks/feature_shared/useReportData';
import { getInspectionReport_api } from '@/network/urls/inspection_api';
import { ReportPage } from './components/ReportPage';

export const PageInspectionReport = () => {
    const report = useReportData({
        fetchApi: getInspectionReport_api,
        exportFilePrefix: 'Inspection_Report',
    });

    return <ReportPage title="Inspection Report" report={report} />;
};
