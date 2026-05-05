import { useRef, useState, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';

const useQrCodePrint = (handleCloseDialog?: () => void) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [showPrintComponent, setShowPrintComponent] = useState<boolean>(false);
    const [dataPrint, setDataPrint] = useState<any>([]);

    const setPrintData = useCallback((data: any) => {
        if (data) {
            setDataPrint(data);
            setShowPrintComponent(true);
        }
    }, []);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `
        @page {
            size: 75mm 50mm;
            margin: 0;
            }
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            #print-container {
                width: 75mm;
                height: 50mm;
                box-sizing: border-box;
                font-size: 9pt;
            }

            .MuiBox-root {
                page-break-after: always;
            }
        }
        `,
        onAfterPrint: () => {
            setShowPrintComponent(false);
            if (handleCloseDialog) handleCloseDialog();
        },
    });


    useEffect(() => {
        if (dataPrint && showPrintComponent) {
            handlePrint();
        }
    }, [dataPrint, showPrintComponent, handlePrint]);

    return { componentRef, showPrintComponent, dataPrint, setPrintData } as const;
};

export default useQrCodePrint;