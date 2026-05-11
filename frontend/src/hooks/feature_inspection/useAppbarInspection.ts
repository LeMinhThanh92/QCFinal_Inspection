import { useState, useEffect } from 'react';
import { getSearchPo_api, getCheckSampleSize_api, getLoadImages_api, getRecordedDefects_api, getPlanId_api, getInspectorId_api } from '@/network/urls/inspection_api';
import { useAppStore } from '@/utils/states/useAppStore';
import { useAuth } from '@/utils/context/AuthProvider';
import { toast } from '@/utils/states/state';
import { useLocale } from '@/utils/context/LocaleProvider';

export const useAppbarInspection = () => {
    const { t } = useLocale();
    const [poInput, setPoInput] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [poResults, setPoResults] = useState<any[]>([]);

    // State for AQL Confirm Dialog
    const [confirmAqlOpen, setConfirmAqlOpen] = useState(false);
    const [pendingAql, setPendingAql] = useState<string | null>(null);

    const factory = useAppStore(state => state.factory);
    const aqlLevel = useAppStore(state => state.aqlLevel);
    const setAqlLevel = useAppStore(state => state.setAqlLevel);
    const poInfo = useAppStore(state => state.poInfo);
    const setPoInfo = useAppStore(state => state.setPoInfo);
    const clearAllData = useAppStore(state => state.clearAllData);
    const isPoLoaded = !!(poInfo && poInfo.poNumber);
    const { user, logout } = useAuth();
    const initChecklistStatuses = useAppStore(state => state.initChecklistStatuses);
    const initImages = useAppStore(state => state.initImages);
    const initRecordedDefects = useAppStore(state => state.initRecordedDefects);

    useEffect(() => {
        const verifyInspector = async () => {
            const userId = user?.account?.username || '';
            if (userId) {
                try {
                    const fetchedInspectorId = await getInspectorId_api(userId);
                    if (!fetchedInspectorId || fetchedInspectorId.trim() === '') {
                        toast.value = {
                            ...toast.value,
                            message: t.inspection.missingUserPivot,
                            type: 'error',
                        };
                        setTimeout(() => {
                            logout();
                        }, 2500);
                    }
                } catch (e) {
                    console.error('Failed to verify inspector ID on load', e);
                }
            }
        };
        verifyInspector();
    }, [user, logout]);

    const handleAqlChange = (event: React.MouseEvent<HTMLElement>, newAql: string | null) => {
        if (isPoLoaded) {
            setPendingAql(newAql);
            setConfirmAqlOpen(true);
            return;
        }
        setAqlLevel(newAql);
    };

    const handleConfirmAqlChange = () => {
        clearAllData();
        setAqlLevel(pendingAql);
        setConfirmAqlOpen(false);
        setPendingAql(null);
    };

    const handleCancelAqlChange = () => {
        setConfirmAqlOpen(false);
        setPendingAql(null);
    };

    const handleSearchPO = async () => {
        if (!aqlLevel) {
            toast.value = { ...toast.value, message: t.inspection.pleaseSelectAql, type: 'warning' };
            return;
        }
        if (!poInput.trim()) {
            toast.value = { ...toast.value, message: t.inspection.pleaseEnterPo, type: 'warning' };
            return;
        }

        setLoading(true);
        try {
            const results = await getSearchPo_api(poInput.trim(), factory);
            if (results && results.length > 0) {
                setPoResults(results);
                setDialogOpen(true);
            } else {
                toast.value = { ...toast.value, message: t.inspection.noPoFound, type: 'error' };
            }
        } catch (error: any) {
            toast.value = { ...toast.value, message: String(error), type: 'error' };
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPO = async (poItem: any) => {
        setDialogOpen(false); // Close dialog immediately for better UX

        const poNo = poItem.PONo || poItem.poNumber || poInput;
        const planRef = poItem.PlanRefNo || poItem.planRefNo || '';

        // 1. Get the actual inspectorId by calling getInspectorId_api with current login user
        let inspectorId = poItem.Inspector || poItem.inspector || '1'; // Default fallback
        try {
            const userId = user?.account?.username || '';
            if (userId) {
                const fetchedInspectorId = await getInspectorId_api(userId);
                if (!fetchedInspectorId || fetchedInspectorId.trim() === '') {
                    // User Pivot not configured — notify and force logout
                    toast.value = {
                        ...toast.value,
                        message: t.inspection.missingUserPivot,
                        type: 'error',
                    };
                    setTimeout(() => {
                        logout();
                    }, 2500);
                    return;
                }
                inspectorId = fetchedInspectorId;
            }
        } catch (e) {
            console.error('Failed to get inspector ID', e);
        }

        // 2. Get planId asynchronously if not provided (checkpobook)
        let planId = poItem.PlanID || poItem.planId || '';
        try {
            if (!planId) {
                const fetchedPlanId = await getPlanId_api(poNo, factory, inspectorId, planRef);
                planId = fetchedPlanId || '';
            }
        } catch (e) {
            console.error('Failed to get plan ID', e);
        }

        // 3. Get recNo precisely from ADynamicApp 72 result
        const rawRecNo = poItem.RecNo || poItem.Unikey || poItem.unikey;
        let recNo = '';
        if (rawRecNo && rawRecNo !== '0' && rawRecNo !== 'null') {
            recNo = rawRecNo.toString().replace('trax_', '');
        } else {
            // As per C# code: recno = ""
            recNo = '';
        }

        // 4. Calculate total qty
        const totalQty = poItem.QtyTotal || poItem.qtyTotal || poItem.TotalQty || poItem.totalQty || poItem.POQty || 0;

        // 5. Check if sample size needs to be fetched
        let sampleSize = poItem.SampleSize || poItem.sampleSize || poItem.Sample_Size || poItem.InsQTY || poItem.PlanQty || 0;
        const inspectorDb = poItem.Inspector || poItem.inspector;

        if (!inspectorDb || inspectorDb === 'NULL' || inspectorDb === 'N/A') {
            try {
                const calculatedSampleSize = await getCheckSampleSize_api(aqlLevel || '', String(totalQty));
                if (calculatedSampleSize && calculatedSampleSize !== 'N/A') {
                    sampleSize = calculatedSampleSize;
                }
            } catch (e) {
                console.error('Failed to get sample size', e);
            }
        }

        // 6. Update the centralized poInfo state with clean variables
        setPoInfo({
            ...poItem,
            poNumber: poNo,
            sku: poItem.SKU || poItem.sku,
            supplier: poItem.CompanyName || poItem.supplier,
            totalQty: totalQty,
            sampleSize: sampleSize,
            planRefNo: planRef,
            recNo: recNo,
            planId: planId,
            inspectorId: inspectorId
        });

        // Initialize the checklist statuses based on list1, list2, list3 from API
        initChecklistStatuses(poItem.list1 || poItem.List1 || '', poItem.list2 || poItem.List2 || '', poItem.list3 || poItem.List3 || '');

        // Load images and recorded defects
        try {
            // Fetch images
            const imagesData = await getLoadImages_api(poNo, planRef);
            if (imagesData && Array.isArray(imagesData)) {
                initImages(imagesData);
            }

            // Fetch recorded defects if RecNo exists
            if (recNo) {
                const defectsData = await getRecordedDefects_api(recNo);
                if (defectsData && Array.isArray(defectsData)) {
                    initRecordedDefects(defectsData);
                }
            } else {
                initRecordedDefects([]);
            }

        } catch (error) {
            console.error('Failed to load PO details (images/defects):', error);
        }

        // Set the search text field to the full selected PO
        setPoInput(poNo);
    };

    return {
        poInput, setPoInput,
        dialogOpen, setDialogOpen,
        loading,
        poResults,
        confirmAqlOpen,
        aqlLevel,
        isPoLoaded,
        user,
        logout,
        t,
        handleAqlChange,
        handleConfirmAqlChange,
        handleCancelAqlChange,
        handleSearchPO,
        handleSelectPO
    };
};
