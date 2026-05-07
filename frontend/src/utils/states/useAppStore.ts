import { create } from 'zustand';

interface PoInfo {
    poNumber: string;
    sku?: string;
    supplier?: string;
    totalQty?: number;
    sampleSize?: number;
    planRefNo: string;
    recNo: string;
    planId: string;
    inspectorId: string;
    [key: string]: any;
}

export interface RecordedDefect {
    id: string;
    type: string;
    code: string;
    major: number;
}

interface AppState {
    poInfo: PoInfo | null;
    factory: string;
    aqlLevel: string | null;
    defectTypes: any[];
    defectCodesMap: Record<string, any[]>;
    checklistStatuses: Record<number, 'conform' | 'non-conform' | 'na'>;
    images: Record<string, string[]>;
    recordedDefects: RecordedDefect[];
    
    setPoInfo: (info: PoInfo | null) => void;
    setFactory: (factory: string) => void;
    setAqlLevel: (level: string | null) => void;
    setDefectTypes: (types: any[]) => void;
    setDefectCodes: (type: string, codes: any[]) => void;
    setChecklistStatus: (globalIndex: number, status: 'conform' | 'non-conform' | 'na') => void;
    initChecklistStatuses: (list1: string, list2: string, list3: string) => void;
    setImages: (images: Record<string, string[]>) => void;
    addImage: (category: string, image: string) => void;
    removeImage: (category: string, image: string) => void;
    initImages: (data: Array<{ Description: string; Image1: string }>) => void;
    initRecordedDefects: (defects: any[]) => void;
    addRecordedDefect: (defect: Omit<RecordedDefect, 'id'>) => void;
    removeRecordedDefect: (id: string) => void;
    clearAllData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    poInfo: null,
    factory: 'F1', // Default or fetch from auth
    aqlLevel: null,
    defectTypes: [],
    defectCodesMap: {},
    checklistStatuses: {},
    images: {},
    recordedDefects: [],
    
    setPoInfo: (info) => set({ poInfo: info }),
    setFactory: (factory) => set({ factory }),
    setAqlLevel: (level) => set({ aqlLevel: level }),
    clearAllData: () => set({ 
        poInfo: null, 
        checklistStatuses: {}, 
        images: {}, 
        recordedDefects: [] 
    }),
    setDefectTypes: (types) => set({ defectTypes: types }),
    setDefectCodes: (type, codes) => set((state) => ({
        defectCodesMap: { ...state.defectCodesMap, [type]: codes }
    })),
    setChecklistStatus: (globalIndex, status) => set((state) => ({
        checklistStatuses: { ...state.checklistStatuses, [globalIndex]: status }
    })),
    initChecklistStatuses: (list1, list2, list3) => set(() => {
        const newStatuses: Record<number, 'conform' | 'non-conform' | 'na'> = {};
        
        // Helper to parse "0|1|2" into array of numbers
        const parseList = (str: string) => str ? str.split('|').map(n => parseInt(n, 10)).filter(n => !isNaN(n)) : [];
        
        parseList(list1).forEach(idx => newStatuses[idx] = 'conform');
        parseList(list2).forEach(idx => newStatuses[idx] = 'non-conform');
        parseList(list3).forEach(idx => newStatuses[idx] = 'na');
        
        return { checklistStatuses: newStatuses };
    }),
    setImages: (images) => set({ images }),
    addImage: (category, image) => set((state) => ({
        images: {
            ...state.images,
            [category]: [...(state.images[category] || []), image]
        }
    })),
    removeImage: (category, image) => set((state) => ({
        images: {
            ...state.images,
            [category]: (state.images[category] || []).filter(img => img !== image)
        }
    })),
    initImages: (data) => set(() => {
        const newImages: Record<string, string[]> = {};
        data.forEach(row => {
            if (row.Description && row.Image1) {
                const category = row.Description.toUpperCase();
                // Backend loadImages() already formats Image1 as full HTTP URLs
                const urls = row.Image1.split(',').filter((url: string) => url.trim() !== '')
                    .map((url: string) => url.trim());
                // Map the category strings to our keys
                if (category.includes('HANGTAB')) newImages['HANGTAB'] = urls;
                else if (category.includes('PACKAGING')) newImages['PACKAGING'] = urls;
                else if (category.includes('COMPARE')) newImages['COMPARE'] = urls;
                else if (category.includes('EXCEPTIONAL')) newImages['EXCEPTIONAL'] = urls;
                else if (category.includes('DEFECT')) newImages['DEFECT'] = urls;
                else if (category.includes('MEASUREMENTS')) newImages['MEASUREMENTS'] = urls;
            }
        });
        return { images: newImages };
    }),
    initRecordedDefects: (defectsFromApi: any[]) => set(() => {
        const parsedDefects: RecordedDefect[] = defectsFromApi.map((d, index) => {
            const defCode = d.DefCode?.toString() || '';
            const defDescription = d.DefDescription?.toString() || Object.values(d)[0]?.toString() || 'Unknown Defect';
            const major = d.Major ?? d.major ?? 1;
            return {
                id: d.ID?.toString() || Date.now().toString() + index,
                type: d.DefCode ? 'Defect' : 'Loaded Defect',
                code: defCode ? `${defCode} - ${defDescription}` : defDescription,
                major: typeof major === 'number' ? major : parseInt(major, 10) || 1,
            };
        });
        return { recordedDefects: parsedDefects };
    }),
    addRecordedDefect: (defect) => set((state) => ({
        recordedDefects: [...state.recordedDefects, { ...defect, id: Date.now().toString() }]
    })),
    removeRecordedDefect: (id) => set((state) => ({
        recordedDefects: state.recordedDefects.filter(d => d.id !== id)
    })),
}));
