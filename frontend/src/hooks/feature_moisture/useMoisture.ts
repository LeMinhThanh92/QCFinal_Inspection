import { useState, useEffect } from 'react';
import { useAppStore } from '@/utils/states/useAppStore';
import { getMoisture_api, saveMoisture_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

export interface MoistureRowData {
    ctnNo: string;
    fabricComposition: string;
    gTop: string;
    gMid: string;
    gBot: string;
    cIn: string;
    cOut: string;
    mateStandard: string;
    cartonStandard: string;
}

export const useMoisture = () => {
    const poInfo = useAppStore(state => state.poInfo);
    const [rows, setRows] = useState<MoistureRowData[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initialize rows when PO changes
    useEffect(() => {
        if (!poInfo?.recNo) {
            setRows([]);
            return;
        }

        const cartonString = poInfo?.CartonNum || poInfo?.CTNNo || '';
        if (!cartonString) {
            setRows([]);
            return;
        }

        let ctnArray = cartonString.split('|').filter((c: string) => c.trim() !== '');
        
        // If there's a RecNo but no carton defined yet, default to at least 1 empty row
        if (ctnArray.length === 0) {
            ctnArray = ['1'];
        }
        
        // Just initialize rows locally
        const initialRows = ctnArray.map((ctn: string) => ({
            ctnNo: ctn,
            fabricComposition: '100%polyester recycle', // Default from C# app
            gTop: '',
            gMid: '',
            gBot: '',
            cIn: '',
            cOut: '',
            mateStandard: '',
            cartonStandard: ''
        }));
        
        setRows(initialRows);
    }, [poInfo]);

    const handleLoadData = async () => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Load PO trước', type: 'error' };
            return;
        }
        
        setLoading(true);
        try {
            const fetchedData = await getMoisture_api(poInfo.recNo);
            
            setRows(prevRows => {
                return prevRows.map(row => {
                    const existingRow = fetchedData?.find((r: any) => r.CTNNo === row.ctnNo || r.ctnNo === row.ctnNo);
                    if (existingRow) {
                        return {
                            ...row,
                            fabricComposition: existingRow.FabricComposition || existingRow.fabricComposition || row.fabricComposition,
                            gTop: existingRow.G_Top || existingRow.gTop || '',
                            gMid: existingRow.G_Mid || existingRow.gMid || '',
                            gBot: existingRow.G_Bot || existingRow.gBot || '',
                            cIn: existingRow.C_In || existingRow.cIn || '',
                            cOut: existingRow.C_Out || existingRow.cOut || '',
                            mateStandard: existingRow.Mate_Standard || existingRow.mateStandard || '',
                            cartonStandard: existingRow.Carton_Standard || existingRow.cartonStandard || ''
                        };
                    }
                    return {
                        ...row,
                        gTop: '',
                        gMid: '',
                        gBot: '',
                        cIn: '',
                        cOut: '',
                        mateStandard: '',
                        cartonStandard: ''
                    };
                });
            });
            toast.value = { ...toast.value, message: 'Tải dữ liệu Moisture thành công', type: 'success' };
        } catch (error) {
            console.error("Failed to load moisture data", error);
            toast.value = { ...toast.value, message: 'Lỗi khi tải dữ liệu Moisture', type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (index: number, field: keyof MoistureRowData, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        setRows(newRows);
    };

    // Replicates the LongClick behavior to copy first row values to all other rows
    const handleCopyDown = () => {
        if (rows.length <= 1) return;
        
        const firstRow = rows[0];
        const newRows = rows.map((row, index) => {
            if (index === 0) return row;
            return {
                ...row,
                fabricComposition: firstRow.fabricComposition,
                gTop: firstRow.gTop,
                gMid: firstRow.gMid,
                gBot: firstRow.gBot,
                cIn: firstRow.cIn,
                cOut: firstRow.cOut,
                mateStandard: firstRow.mateStandard,
                cartonStandard: firstRow.cartonStandard,
            };
        });
        setRows(newRows);
        toast.value = { ...toast.value, message: 'Đã copy dữ liệu dòng 1 xuống các dòng dưới', type: 'success' };
    };

    const handleSave = async () => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng tải PO trước khi lưu', type: 'warning' };
            return;
        }
        
        setSaving(true);
        try {
            await saveMoisture_api(poInfo.recNo, rows);
            toast.value = { ...toast.value, message: 'Lưu dữ liệu Moisture thành công!', type: 'success' };
        } catch (error) {
            toast.value = { ...toast.value, message: 'Lỗi khi lưu dữ liệu', type: 'error' };
        } finally {
            setSaving(false);
        }
    };

    return {
        poInfo,
        rows,
        loading,
        saving,
        handleLoadData,
        handleInputChange,
        handleCopyDown,
        handleSave
    };
};
