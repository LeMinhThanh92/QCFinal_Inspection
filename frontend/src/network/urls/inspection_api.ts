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

export const updateCartonNum_api = (recNo: string, cartonNum: string) => {
    return request({
        url: '/api/inspection/update-carton-num',
        method: 'POST',
        params: { recNo, cartonNum },
    });
};

export const loadCtn_api = (poNumber: string, planRef: string) => {
    return request({
        url: '/api/inspection/load-ctn',
        method: 'GET',
        params: { poNumber, planRef },
    });
};

export const loadOperations_api = (poNumber: string) => {
    return request({
        url: '/api/inspection/load-operations',
        method: 'GET',
        params: { poNumber },
    });
};

export const addDefect_api = (recNo: string, poNumber: string, defCode: string, defDescription: string, major: number, operation: string) => {
    return request({
        url: '/api/inspection/add-defect',
        method: 'POST',
        params: { recNo, poNumber, defCode, defDescription, major, operation },
    });
};

export const deleteDefect_api = (recNo: string, defDescription: string) => {
    return request({
        url: '/api/inspection/delete-defect',
        method: 'POST',
        params: { recNo, defDescription },
    });
};

export const getImageServerUrl_api = () => {
    return request({
        url: '/api/inspection/get-image-server-url',
        method: 'GET',
    });
};

/**
 * Upload a file directly to the PHP server (same pattern as EditPDFAndroid).
 * Returns { success, message, filename } from PHP.
 */
export const uploadFileToPHP = async (
    uploadUrl: string,
    file: File,
    safeFileName: string
): Promise<{ success: boolean; message: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file, safeFileName);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Save image file names to QCFinalImage DB table (no file upload, DB only).
 * Called AFTER frontend has already uploaded files to PHP server.
 */
export const saveImageRecord_api = (recNo: string, description: string, types: string, fileNames: string[]) => {
    const params = new URLSearchParams();
    params.append('recNo', recNo);
    params.append('description', description);
    params.append('types', types);
    fileNames.forEach(fn => params.append('fileNames', fn));

    return request({
        url: '/api/inspection/save-image-record',
        method: 'POST',
        data: params.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
};

export const deleteImage_api = (recNo: string, description: string, fileName: string) => {
    return request({
        url: '/api/inspection/delete-image',
        method: 'POST',
        params: { recNo, description, fileName },
    });
};

export const clearImages_api = (recNo: string) => {
    return request({
        url: '/api/inspection/clear-images',
        method: 'POST',
        params: { recNo },
    });
};

export const exportTrans4mJson_api = (poNumber: string, planRef: string, recNo: string) => {
    return request({
        url: '/api/inspection/export-trans4m-json',
        method: 'GET',
        params: { poNumber, planRef, recNo },
        responseType: 'blob',
    });
};

export interface SaveAllRequest {
    poNumber: string;
    factory: string;
    inspectorId: string;
    planRef: string;
    aqlLevel: string;
    sampleSize: string;
    totalQty: string;
    insQty: string;
    cartonNum: string;
    checklistConform: string;
    checklistNonConform: string;
    checklistNA: string;
}

export const saveAll_api = (data: SaveAllRequest) => {
    return request({
        url: '/api/inspection/save-all',
        method: 'POST',
        data: data,
    });
};

// ── Submit to Pivot88 (SFTP Upload) ──────────────────────────────

export interface SubmitToPivotRequest {
    poNumber: string;
    planRef: string;
    recNo: string;
    inspectorId: string;
}

export interface SubmitToPivotResponse {
    success: boolean;
    message: string;
    fileName?: string;
    imagesUploaded?: number;
    imagesFailed?: number;
    totalImages?: number;
}

export const submitToPivot_api = (data: SubmitToPivotRequest) => {
    return request({
        url: '/api/inspection/submit-to-pivot',
        method: 'POST',
        data: data,
    });
};

// ── Clear PO (mark as Fail) ──────────────────────────────────────

export interface ClearPoRequest {
    poNumber: string;
    planId: string;
    planRef: string;
}

export const clearPo_api = (data: ClearPoRequest) => {
    return request({
        url: '/api/inspection/clear-po',
        method: 'POST',
        data: data,
    });
};


