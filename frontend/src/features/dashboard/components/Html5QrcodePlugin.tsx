import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

const MLKitScanner = registerPlugin<any>('MLKitScanner');

const qrcodeRegionId = "html5qr-code-full-region";

const BARCODE_FORMATS = [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF
];

export interface Html5QrcodePluginProps {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    skipValidation?: boolean;
    enableQrCode?: boolean;
    qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void;
    qrCodeErrorCallback?: (errorMessage: string, error: any) => void;
}

const Html5QrcodePlugin = (props: Html5QrcodePluginProps) => {
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const latestSuccessCb = useRef(props.qrCodeSuccessCallback);
    const latestErrorCb = useRef(props.qrCodeErrorCallback);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<'loading' | 'active' | 'file-mode' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    const webFormats = props.enableQrCode
        ? [...BARCODE_FORMATS, Html5QrcodeSupportedFormats.QR_CODE]
        : BARCODE_FORMATS;

    useEffect(() => {
        latestSuccessCb.current = props.qrCodeSuccessCallback;
        latestErrorCb.current = props.qrCodeErrorCallback;
    }, [props.qrCodeSuccessCallback, props.qrCodeErrorCallback]);

    const handleValidScan = (text: string, result: any) => {
        const barcodeText = String(text || '').trim();
        if (props.skipValidation || barcodeText.length === 10) {
            if (latestSuccessCb.current) {
                latestSuccessCb.current(barcodeText, result);
            }
        } else {
            console.warn(`Scan ignored: Barcode must be exactly 10 characters`);
        }
    };

    const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const scanner = new Html5Qrcode("file-scan-region", {
                formatsToSupport: webFormats,
                verbose: false
            });
            const result = await scanner.scanFile(file, true);
            if (result) {
                handleValidScan(result, null);
            }
            scanner.clear();
        } catch (err: any) {
            console.error("File scan error:", err);
            alert("Không tìm thấy barcode trong ảnh. Hãy chụp lại.");
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const forceCloseDialog = () => {
        try {
            const dialogs = document.querySelectorAll('.MuiDialog-root');
            dialogs.forEach(d => {
                const btns = d.querySelectorAll('button');
                btns.forEach(b => {
                    const t = b.innerText.toLowerCase();
                    if (t.includes('đóng') || t.includes('hủy') || t.includes('close') || t.includes('cancel')) {
                        (b as HTMLElement).click();
                    }
                });
            });
        } catch (e) { }
    };

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            const runNativeScan = async () => {
                try {
                    const result = await MLKitScanner.scan();
                    if (result && result.hasContent) {
                        handleValidScan(result.content, result.format);
                    } else {
                        forceCloseDialog();
                    }
                } catch (err: any) {
                    console.error("Native scanner failed:", err);
                    forceCloseDialog();
                }
            };
            runNativeScan();
            return;
        }

        const timerId = setTimeout(async () => {
            const el = document.getElementById(qrcodeRegionId);
            if (!el || html5QrCodeRef.current) return;

            const scanConfig: any = {};
            if (props.fps) scanConfig.fps = props.fps;
            if (props.qrbox) scanConfig.qrbox = props.qrbox;
            if (props.aspectRatio) scanConfig.aspectRatio = props.aspectRatio;
            if (props.disableFlip !== undefined) scanConfig.disableFlip = props.disableFlip;

            html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId, {
                formatsToSupport: webFormats,
                verbose: false
            });
            const scanner = html5QrCodeRef.current;

            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0) {
                    const backCam = devices.find(d => /back|rear|environment|mặt sau/i.test(d.label));
                    const pickId = backCam ? backCam.id : devices[devices.length - 1].id;
                    await scanner.start(
                        pickId,
                        scanConfig,
                        (decodedText, decodedResult) => handleValidScan(decodedText, decodedResult),
                        () => {}
                    );
                    setStatus('active');
                } else {
                    setStatus('error');
                    setErrorMsg("Không tìm thấy Camera nào.");
                }
            } catch (err: any) {
                console.error("Camera Error:", err);
                setStatus('error');
                setErrorMsg(err?.message || String(err));
            }
        }, 500);

        return () => {
            clearTimeout(timerId);
            if (html5QrCodeRef.current) {
                const scanner = html5QrCodeRef.current;
                if (scanner.isScanning) {
                    scanner.stop().then(() => scanner.clear()).catch(() => {});
                } else {
                    try { scanner.clear(); } catch(e) {}
                }
                html5QrCodeRef.current = null;
            }
        };
    }, [props.fps, props.qrbox, props.aspectRatio, props.disableFlip]);

    if (status === 'file-mode') {
        return (
            <div style={{ width: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px' }}>
                <div style={{ fontSize: '48px' }}>📷</div>
                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '16px', textAlign: 'center' }}>Chụp ảnh Barcode để quét</p>
                <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#2e7d32', color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(46,125,50,0.3)', marginTop: '8px'
                }}>
                    📸 Mở Camera Chụp
                    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileCapture} style={{ display: 'none' }} />
                </label>
                <div id="file-scan-region" style={{ display: 'none' }} />
            </div>
        );
    }

    if (Capacitor.isNativePlatform() && status === 'loading') {
        return (
            <div style={{ width: '100%', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderRadius: '12px' }}>
                <p style={{ fontWeight: 600, color: '#475569' }}>Đang mở Native Camera...</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', minHeight: '300px', position: 'relative' }}>
            {status === 'loading' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
                    <p style={{ fontWeight: 600, color: '#64748b' }}>⏳ Đang mở Camera...</p>
                </div>
            )}
            {status === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '20px' }}>
                    <p style={{ fontWeight: 700, color: '#dc2626', fontSize: '16px' }}>❌ Lỗi Camera</p>
                    <p style={{ color: '#991b1b', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>{errorMsg}</p>
                </div>
            )}
            <div id="html5qr-code-full-region" style={{ width: '100%', display: status === 'error' ? 'none' : 'block' }} />
        </div>
    );
};

export default Html5QrcodePlugin;
