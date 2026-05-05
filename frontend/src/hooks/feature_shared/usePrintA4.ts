import { useRef, useState, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';

const usePrintA4 = (handleCloseDialog?: () => void) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [showPrintComponent, setShowPrintComponent] = useState(false);
    const [dataPrint, setDataPrint] = useState<any | null>(null);

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
                    size: A4;
                    margin: 5mm;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    #print-container {
                        width: 210mm;
                        min-height: 297mm;
                        font-size: 14px;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    .print-content {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .page-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        padding: 8px 24px;
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

    return { componentRef, showPrintComponent, dataPrint, setPrintData };
};

export default usePrintA4;
