import { useState, useEffect } from 'react';
import { useAppStore } from '@/utils/states/useAppStore';
import { getDefectTypes_api, getDefectCodes_api, loadOperations_api, addDefect_api, deleteDefect_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

export const useDefectList = () => {
    const [expanded, setExpanded] = useState<string | false>(false);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [loadingCodes, setLoadingCodes] = useState<Record<string, boolean>>({});

    const poInfo = useAppStore(state => state.poInfo);
    const setPoInfo = useAppStore(state => state.setPoInfo);
    const defectTypes = useAppStore(state => state.defectTypes);
    const defectCodesMap = useAppStore(state => state.defectCodesMap);
    const recordedDefects = useAppStore(state => state.recordedDefects);
    const setDefectTypes = useAppStore(state => state.setDefectTypes);
    const setDefectCodes = useAppStore(state => state.setDefectCodes);
    const addRecordedDefect = useAppStore(state => state.addRecordedDefect);
    const removeRecordedDefect = useAppStore(state => state.removeRecordedDefect);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDefectCode, setSelectedDefectCode] = useState('');
    const [selectedDefectName, setSelectedDefectName] = useState('');
    const [selectedDefectType, setSelectedDefectType] = useState('');
    const [majorQty, setMajorQty] = useState('1');
    const [operations, setOperations] = useState<string[]>([]);
    const [selectedOperation, setSelectedOperation] = useState('');
    const [loadingOps, setLoadingOps] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Load Defect Types once ───────────────────────
    useEffect(() => {
        if (defectTypes.length === 0) {
            setLoadingTypes(true);
            getDefectTypes_api()
                .then((res: any) => {
                    if (res && res.length > 0) {
                        const types = res.map((item: any) => item.DefectType || Object.values(item)[0]);
                        setDefectTypes(types.filter(Boolean));
                    }
                })
                .catch(() => {
                    toast.value = { ...toast.value, message: 'Failed to load Defect Types', type: 'error' };
                })
                .finally(() => setLoadingTypes(false));
        }
    }, [defectTypes.length, setDefectTypes]);

    // ── Load Defect Codes on expand ──────────────────
    const handleExpand = (type: string) => {
        const isExpanded = expanded === type;
        setExpanded(isExpanded ? false : type);

        if (!isExpanded && !defectCodesMap[type] && !loadingCodes[type]) {
            setLoadingCodes(prev => ({ ...prev, [type]: true }));
            getDefectCodes_api(type)
                .then((res: any) => {
                    setDefectCodes(type, res && res.length > 0 ? res : []);
                })
                .catch(() => {
                    toast.value = { ...toast.value, message: `Failed to load codes for ${type}`, type: 'error' };
                })
                .finally(() => {
                    setLoadingCodes(prev => ({ ...prev, [type]: false }));
                });
        }
    };

    // ── Click a defect code → open dialog ────────────
    const handleDefectClick = (type: string, codeRaw: string) => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Save report trước khi thêm lỗi!', type: 'warning' };
            return;
        }

        // Parse DefCode safely: use FIRST dash to split Code vs Description
        // e.g. "ST01-Broken Stitch" → code="ST01", name="Broken Stitch"
        // e.g. "ST01-Broken-Stitch" → code="ST01", name="Broken-Stitch"
        const firstDashIdx = codeRaw.indexOf('-');
        let defCode = codeRaw;
        let defName = codeRaw;
        if (firstDashIdx > 0) {
            defCode = codeRaw.substring(0, firstDashIdx).trim();
            defName = codeRaw.substring(firstDashIdx + 1).trim();
        }

        setSelectedDefectCode(defCode);
        setSelectedDefectName(defName);
        setSelectedDefectType(type);
        setMajorQty('1');
        setSelectedOperation('');
        setDialogOpen(true);

        // Load operations
        const poNo = poInfo?.poNumber || '';
        if (poNo) {
            setLoadingOps(true);
            loadOperations_api(poNo)
                .then((res: any) => {
                    if (res && res.length > 0) {
                        const ops = res.map((item: any) => item.OPERATION || Object.values(item)[0]?.toString() || '');
                        setOperations(ops.filter(Boolean));
                    } else {
                        setOperations([]);
                    }
                })
                .catch(() => setOperations([]))
                .finally(() => setLoadingOps(false));
        }
    };

    // ── Submit defect → call API ────────────────────
    const handleSubmitDefect = async () => {
        if (!poInfo?.recNo) return;
        const major = parseInt(majorQty, 10);
        if (isNaN(major) || major <= 0) {
            toast.value = { ...toast.value, message: 'Nhập số lượng Major hợp lệ!', type: 'warning' };
            return;
        }

        setSubmitting(true);
        try {
            const result: any = await addDefect_api(
                poInfo.recNo,
                poInfo.poNumber,
                selectedDefectCode,
                selectedDefectName,
                major,
                selectedOperation
            );

            if (result?.success) {
                // Update local poInfo with new accepted/rejected
                setPoInfo({ ...poInfo, Accpected: result.accepted, Rejected: result.rejected });
                // Add to local recorded defects list
                addRecordedDefect({ type: selectedDefectType, code: `${selectedDefectCode} - ${selectedDefectName}`, major });
                toast.value = { ...toast.value, message: `Đã thêm lỗi: ${selectedDefectCode} - Major: ${major}`, type: 'success' };
                setDialogOpen(false);
            } else {
                toast.value = { ...toast.value, message: result?.error || 'Thêm lỗi thất bại', type: 'error' };
            }
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete defect → call API ────────────────────
    const handleDelete = async (defect: { id: string; code: string; type: string; major: number }) => {
        if (!poInfo?.recNo) return;

        // Parse the defDescription from the display format "CODE - Description"
        const firstDashIdx = defect.code.indexOf(' - ');
        const defDescription = firstDashIdx > 0 ? defect.code.substring(firstDashIdx + 3).trim() : defect.code;

        try {
            const result: any = await deleteDefect_api(poInfo.recNo, defDescription);
            if (result?.success) {
                setPoInfo({ ...poInfo, Accpected: result.accepted, Rejected: result.rejected });
                removeRecordedDefect(defect.id);
                toast.value = { ...toast.value, message: 'Đã xóa defect thành công', type: 'success' };
            } else {
                toast.value = { ...toast.value, message: result?.error || 'Xóa defect thất bại', type: 'error' };
            }
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        }
    };

    return {
        expanded,
        loadingTypes,
        loadingCodes,
        defectTypes,
        defectCodesMap,
        recordedDefects,
        dialogOpen, setDialogOpen,
        selectedDefectCode,
        selectedDefectName,
        selectedDefectType,
        majorQty, setMajorQty,
        operations,
        selectedOperation, setSelectedOperation,
        loadingOps,
        submitting,
        handleExpand,
        handleDefectClick,
        handleSubmitDefect,
        handleDelete
    };
};
