import React, { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import UploadIcon from '@mui/icons-material/Upload';
import { useAppStore } from '@/utils/states/useAppStore';
import { clearImages_api, saveAll_api, submitToPivot_api, clearPo_api, SubmitToPivotResponse } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';
import { useLocale } from '@/utils/context/LocaleProvider';

export const usePageInspection = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { poInfo, images, removeImage, checklistStatuses, setPoInfo, clearAllData, setAqlLevel } = useAppStore();
    const factory = useAppStore(state => state.factory);
    const aqlLevel = useAppStore(state => state.aqlLevel);
    const { t } = useLocale();

    const [confirmAction, setConfirmAction] = useState<{open: boolean, title: string, content: string, actionId: string | null}>({
        open: false, title: '', content: '', actionId: null
    });

    const [resultDialog, setResultDialog] = useState<{
        open: boolean;
        type: 'success' | 'warning' | 'error';
        title: string;
        content: string;
    }>({ open: false, type: 'success', title: '', content: '' });

    const [submittingPivot, setSubmittingPivot] = useState(false);

    const hasData = poInfo && poInfo.recNo && poInfo.recNo !== '';

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const SPEED_DIAL_ACTIONS = [
        { id: 'SAVE', icon: React.createElement(SaveIcon), name: hasData ? 'Update' : 'Save', color: hasData ? '#f44336' : '#4CAF50' },
        { id: 'CLEAR_IMAGE', icon: React.createElement(ClearAllIcon), name: 'Clear Img', color: '#FF9800' },
        { id: 'CLEAR_PO', icon: React.createElement(DeleteForeverIcon), name: 'Clear PO', color: '#9C27B0' },
        { id: 'SUBMIT', icon: React.createElement(UploadIcon), name: 'Submit', color: '#E91E63' },
    ];

    const buildChecklistLists = () => {
        const conformIndexes: number[] = [];
        const nonConformIndexes: number[] = [];
        const naIndexes: number[] = [];

        for (let i = 0; i <= 26; i++) {
            const status = checklistStatuses[i] || 'conform';
            if (status === 'conform') conformIndexes.push(i);
            else if (status === 'non-conform') nonConformIndexes.push(i);
            else if (status === 'na') naIndexes.push(i);
        }

        return {
            conform: conformIndexes.join('|'),
            nonConform: nonConformIndexes.join('|'),
            na: naIndexes.join('|'),
        };
    };

    const handleSpeedDialAction = (actionId: string) => {
        if (actionId === 'SAVE') {
            if (!aqlLevel) {
                toast.value = { ...toast.value, message: 'Vui lòng chọn AQL Level trước!', type: 'warning' };
                return;
            }
            if (!poInfo?.poNumber) {
                toast.value = { ...toast.value, message: 'Vui lòng load PO trước!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Lưu',
                content: `Bạn có chắc chắn muốn SAVE dữ liệu cho PO: ${poInfo.poNumber}?`,
                actionId
            });
        } else if (actionId === 'CLEAR_IMAGE') {
            if (!poInfo?.recNo) {
                toast.value = { ...toast.value, message: 'Chưa có dữ liệu để xóa ảnh!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Xóa Ảnh',
                content: 'Bạn có chắc chắn muốn xóa toàn bộ ảnh của mã PO này không?',
                actionId
            });
        } else if (actionId === 'CLEAR_PO') {
            if (!poInfo?.poNumber || poInfo?.planId == null || poInfo?.planRefNo == null) {
                toast.value = { ...toast.value, message: 'Thiếu thông tin PO/PlanID/PlanRef để clear!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: '⚠️ Xác nhận Clear PO',
                content: `DELETE POs: ${poInfo.poNumber}\nPlanRef: ${poInfo.planRefNo}\nUser: ${poInfo.inspectorId || ''}\n\nHệ thống sẽ đánh dấu PO này là "(Fail)".\nHành động này KHÔNG THỂ hoàn tác!\n\nBạn có chắc chắn?`,
                actionId
            });
        } else if (actionId === 'SUBMIT') {
            if (!poInfo?.poNumber || poInfo?.planRefNo == null || !poInfo?.recNo) {
                toast.value = { ...toast.value, message: 'PO chưa được tải hoặc thiếu dữ liệu!', type: 'warning' };
                return;
            }
            setConfirmAction({
                open: true,
                title: 'Xác nhận Submit SFTP',
                content: `Hệ thống sẽ upload toàn bộ ảnh và file JSON lên server Pivot88/TRANS4M cho PO: ${poInfo.poNumber}.\n\nQuá trình này có thể mất vài phút. Tiếp tục?`,
                actionId
            });
        } else {
            console.log(`Action clicked: ${actionId}`);
        }
    };

    const handleConfirmAction = async () => {
        const { actionId } = confirmAction;
        setConfirmAction({ ...confirmAction, open: false }); // close dialog immediately

        if (actionId === 'SAVE') {
            toast.value = { ...toast.value, message: 'Đang lưu dữ liệu...', type: 'info' };
            try {
                const lists = buildChecklistLists();
                const payload = {
                    poNumber: poInfo?.poNumber || '',
                    factory: factory,
                    inspectorId: poInfo?.inspectorId || '',
                    planRef: poInfo?.planRefNo || '',
                    aqlLevel: aqlLevel || '',
                    sampleSize: String(poInfo?.sampleSize || poInfo?.SampleSize || poInfo?.Sample_Size || ''),
                    totalQty: String(poInfo?.totalQty || poInfo?.TotalQty || poInfo?.QtyTotal || ''),
                    insQty: String(poInfo?.sampleSize || poInfo?.SampleSize || poInfo?.Sample_Size || poInfo?.totalQty || poInfo?.TotalQty || ''),
                    cartonNum: poInfo?.CartonNum || poInfo?.cartonNum || poInfo?.CTNNo || '',
                    checklistConform: lists.conform,
                    checklistNonConform: lists.nonConform,
                    checklistNA: lists.na,
                };

                const result: any = await saveAll_api(payload);

                if (result?.success) {
                    if (poInfo) {
                        setPoInfo({
                            ...poInfo,
                            planId: result.planId || poInfo.planId,
                            recNo: result.recNo || poInfo.recNo,
                        });
                    }

                    const status = result.status || 'UNKNOWN';
                    if (status === 'fail') {
                        toast.value = { ...toast.value, message: '❌ FAIL — Saved but result is FAIL!', type: 'error' };
                    } else if (status === 'pass') {
                        toast.value = { ...toast.value, message: '✅ PASS — Saved successfully!', type: 'success' };
                    } else {
                        toast.value = { ...toast.value, message: `Saved! (${result.isNew ? 'Created New' : 'Updated'})`, type: 'success' };
                    }
                } else {
                    toast.value = { ...toast.value, message: result?.message || 'Lỗi khi lưu!', type: 'error' };
                }
            } catch (e: any) {
                toast.value = { ...toast.value, message: 'Lỗi: ' + String(e), type: 'error' };
            }
        } else if (actionId === 'CLEAR_IMAGE') {
            try {
                const result: any = await clearImages_api(poInfo?.recNo || '');
                if (result?.success) {
                    toast.value = { ...toast.value, message: 'Đã xóa toàn bộ ảnh thành công!', type: 'success' };
                    Object.keys(images).forEach(category => {
                        images[category].forEach(img => removeImage(category, img));
                    });
                } else {
                    toast.value = { ...toast.value, message: result?.error || 'Lỗi khi xóa ảnh', type: 'error' };
                }
            } catch (e: any) {
                toast.value = { ...toast.value, message: String(e), type: 'error' };
            }
        } else if (actionId === 'CLEAR_PO') {
            toast.value = { ...toast.value, message: 'Đang clear PO...', type: 'info' };
            try {
                const result: any = await clearPo_api({
                    poNumber: poInfo?.poNumber || '',
                    planId: poInfo?.planId || '',
                    planRef: poInfo?.planRefNo || '',
                });
                if (result?.success) {
                    clearAllData();
                    setAqlLevel(null);
                    setActiveTab(0);

                    setResultDialog({
                        open: true,
                        type: 'success',
                        title: '✅ Clear PO thành công',
                        content: `${result.message}\n\nTất cả dữ liệu đã được reset.`,
                    });
                } else {
                    setResultDialog({
                        open: true,
                        type: 'error',
                        title: '❌ Clear PO thất bại',
                        content: result?.message || 'Lỗi không xác định',
                    });
                }
            } catch (e: any) {
                setResultDialog({
                    open: true,
                    type: 'error',
                    title: '❌ Lỗi',
                    content: `Lỗi kết nối: ${String(e)}`,
                });
            }
        } else if (actionId === 'SUBMIT') {
            setSubmittingPivot(true);
            toast.value = { ...toast.value, message: 'Đang upload lên Pivot88... Vui lòng chờ!', type: 'info' };
            try {
                const response: any = await submitToPivot_api({
                    poNumber: poInfo?.poNumber || '',
                    planRef: poInfo?.planRefNo || '',
                    recNo: poInfo?.recNo || '',
                    inspectorId: poInfo?.inspectorId || '',
                });

                const data: SubmitToPivotResponse = response;

                if (data.success) {
                    if (data.imagesFailed && data.imagesFailed > 0) {
                        setResultDialog({
                            open: true,
                            type: 'warning',
                            title: '⚠️ Submit hoàn tất (có lỗi ảnh)',
                            content: `JSON đã upload thành công!\n\n` +
                                `📄 File: ${data.fileName}\n` +
                                `✅ Ảnh thành công: ${data.imagesUploaded}/${data.totalImages}\n` +
                                `❌ Ảnh thất bại: ${data.imagesFailed}/${data.totalImages}\n\n` +
                                `Lưu ý: Một số ảnh không upload được. Vui lòng kiểm tra lại trên Pivot88.`,
                        });
                    } else {
                        setResultDialog({
                            open: true,
                            type: 'success',
                            title: '✅ Submitted COMPLETE',
                            content: `Toàn bộ dữ liệu đã upload lên Pivot88 thành công!\n\n` +
                                `📄 File: ${data.fileName}\n` +
                                `🖼️ Ảnh: ${data.imagesUploaded}/${data.totalImages} thành công`,
                        });
                    }
                } else {
                    setResultDialog({
                        open: true,
                        type: 'error',
                        title: `❌ ${t.common.submitFailed}`,
                        content: data.message || t.common.unknownError,
                    });
                }
            } catch (e: any) {
                setResultDialog({
                    open: true,
                    type: 'error',
                    title: `❌ ${t.common.submitFailed}`,
                    content: `${t.common.networkError} ${String(e)}`,
                });
            } finally {
                setSubmittingPivot(false);
            }
        }
    };

    return {
        poInfo,
        hasData,
        activeTab,
        handleTabChange,
        SPEED_DIAL_ACTIONS,
        handleSpeedDialAction,
        confirmAction, setConfirmAction,
        handleConfirmAction,
        resultDialog, setResultDialog,
        submittingPivot,
    };
};
