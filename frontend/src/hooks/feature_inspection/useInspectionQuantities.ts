import { useState } from 'react';
import { useAppStore } from '@/utils/states/useAppStore';
import { updateCartonNum_api, loadCtn_api } from '@/network/urls/inspection_api';
import { toast } from '@/utils/states/state';

export const useInspectionQuantities = () => {
    const poInfo = useAppStore(state => state.poInfo);
    const setPoInfo = useAppStore(state => state.setPoInfo);
    const [cartonDialogOpen, setCartonDialogOpen] = useState(false);
    const [cartonInputValue, setCartonInputValue] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleCartonClick = async () => {
        if (!poInfo?.recNo) {
            toast.value = { ...toast.value, message: 'Vui lòng Save report cơ bản trước khi sửa Carton!', type: 'warning' };
            return;
        }
        
        let currentValue = poInfo?.CartonNum || poInfo?.CTNNo || '';
        setCartonInputValue(currentValue);
        setCartonDialogOpen(true);
        setIsUpdating(true);
        
        try {
            const poNo = poInfo?.poNumber || '';
            const planRef = poInfo?.planRefNo || '';
            if (poNo && planRef) {
                const fetchedCtn = await loadCtn_api(poNo, planRef);
                if (fetchedCtn) {
                    setCartonInputValue(fetchedCtn);
                }
            }
        } catch (e) {
            console.error('Failed to load ctn from API', e);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveCarton = async () => {
        if (!poInfo?.recNo) return;
        setIsUpdating(true);
        try {
            await updateCartonNum_api(poInfo.recNo, cartonInputValue);
            setPoInfo({ ...poInfo, CartonNum: cartonInputValue, CTNNo: cartonInputValue });
            toast.value = { ...toast.value, message: 'Đã cập nhật Carton Number thành công', type: 'success' };
            setCartonDialogOpen(false);
        } catch (e: any) {
            toast.value = { ...toast.value, message: String(e), type: 'error' };
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        poInfo,
        cartonDialogOpen, setCartonDialogOpen,
        cartonInputValue, setCartonInputValue,
        isUpdating,
        handleCartonClick,
        handleSaveCarton
    };
};
