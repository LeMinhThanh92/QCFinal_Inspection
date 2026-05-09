import { useReportData } from '@/hooks/feature_shared/useReportData';
import { getCtqReport_api } from '@/network/urls/inspection_api';
import { ReportPage } from './components/ReportPage';

export const PageCtqReport = () => {
    const report = useReportData({
        fetchApi: getCtqReport_api,
        exportFilePrefix: 'CTQ_Report',
    });

    return <ReportPage title="CTQ Report" report={report} />;
};
