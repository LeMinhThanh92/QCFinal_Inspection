import { request } from '@/network/network';

export const getSearchPo_api = (poNumber: string, factory: string) => {
    return request({
        url: '/api/inspection/search-po',
        method: 'GET',
        params: { poNumber, factory },
    });
};

export const getDefectTypes_api = () => {
    return request({
        url: '/api/inspection/defect-types',
        method: 'GET',
    });
};

export const getDefectCodes_api = (type: string) => {
    return request({
        url: '/api/inspection/defect-codes',
        method: 'GET',
        params: { type },
    });
};

export const getLoadImages_api = (poNumber: string, planRef: string) => {
    return request({
        url: '/api/inspection/load-images',
        method: 'GET',
        params: { poNumber, planRef },
    });
};

export const getRecordedDefects_api = (recNo: string) => {
    return request({
        url: '/api/inspection/load-recorded-defects',
        method: 'GET',
        params: { recNo },
    });
};

export const getCheckPassFail_api = (poNumber: string, factory: string, inspectorId: string, planRef: string) => {
    return request({
        url: '/api/inspection/check-pass-fail',
        method: 'GET',
        params: { poNumber, factory, inspectorId, planRef },
    });
};

export const getPlanId_api = (poNumber: string, factory: string, inspectorId: string, planRef: string) => {
    return request({
        url: '/api/inspection/get-plan-id',
        method: 'GET',
        params: { poNumber, factory, inspectorId, planRef },
    });
};

export const getInspectorId_api = (userId: string) => {
    return request({
        url: '/api/inspection/get-inspector-id',
        method: 'GET',
        params: { userId },
    });
};

export const getRecNo_api = (planId: string, inspectorId: string) => {
    return request({
        url: '/api/inspection/get-rec-no',
        method: 'GET',
        params: { planId, inspectorId },
    });
};

