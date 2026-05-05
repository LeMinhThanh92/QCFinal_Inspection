import {signal} from "@preact/signals-core";

export const appBarTitle = signal('')
export const appBarSelected = signal(0)
export const navigationState = signal<any>(null);

interface Toast {
    message: string;
    duration: number;
    type: 'success' | 'error' | 'info' | 'warning';
    isExpired: boolean,
}

export const toast = signal<Toast>({
    message: '',
    duration: 2500,
    type: 'error',
    isExpired: false
});

export const toastDialog = signal<Toast>({
    message: '',
    duration: 4500,
    type: 'error',
    isExpired: false
});