import { useReportData } from '@/hooks/feature_shared/useReportData';
import { getMoistureReport_api } from '@/network/urls/inspection_api';
import { ReportPage } from './components/ReportPage';

export const PageMoistureReport = () => {
    const report = useReportData({
        fetchApi: getMoistureReport_api,
        exportFilePrefix: 'Moisture_Report',
    });

    return <ReportPage title="Moisture Report" report={report} />;
};
