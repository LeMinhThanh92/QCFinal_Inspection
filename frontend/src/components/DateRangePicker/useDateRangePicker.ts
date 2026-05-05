import {useCallback, useState} from 'react';
import {addMonths, isAfter, isBefore} from 'date-fns';

type DateRange = [Date | null, Date | null];

interface UseDateRangePickerProps {
    selectedDateRange: [Date | null, Date | null];
    setSelectedDateRange: (range: [Date | null, Date | null]) => void;
    onApply?: (range: DateRange) => void;
    onCancel?: () => void;
    minDate?: Date;
    maxDate?: Date;
    onClose: () => void;
    showApplyCancelButtons?: boolean;
}

const useDateRangePicker = ({
                                selectedDateRange,
                                setSelectedDateRange,
                                onApply,
                                onCancel,
                                minDate,
                                maxDate,
                                onClose,
                                showApplyCancelButtons,
                            }: UseDateRangePickerProps) => {
    const initialMonth = selectedDateRange[0] ? new Date(selectedDateRange[0].getFullYear(), selectedDateRange[0].getMonth(), 1) : new Date();
    const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

    const start = selectedDateRange[0];
    const end = selectedDateRange[1];

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth((prevMonth) => addMonths(prevMonth, -1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
    }, []);

    const handleChangeMonth = useCallback((date: any) => {
        setCurrentMonth(date);
    }, []);

    const handleApply = useCallback(() => {
        if (onApply) {
            onApply(selectedDateRange);
        }
        setSelectedDateRange(selectedDateRange);
        onClose();
    }, [onApply, selectedDateRange, onClose, setSelectedDateRange]);

    const handleCancel = useCallback(() => {
        if (onCancel) {
            onCancel();
        }
        // setSelectedDateRange([null, null]);
        onClose();
    }, [onCancel, onClose, setSelectedDateRange]);

    const handleDayClick = useCallback((day: Date) => {
        if ((minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate))) {
            return;
        }
        if (!start || end) {
            setSelectedDateRange([day, null]);
        } else if (day < start) {
            setSelectedDateRange([day, start]);
            if (!showApplyCancelButtons) {
                onClose();
            }
        } else {
            setSelectedDateRange([start, day]);
            if (!showApplyCancelButtons) {
                onClose();
            }
        }
    }, [minDate, maxDate, start, end, setSelectedDateRange, showApplyCancelButtons, onClose]);

    return {
        currentMonth,
        hoveredDate,
        handlePrevMonth,
        handleNextMonth,
        handleApply,
        handleCancel,
        handleDayClick,
        setHoveredDate,
        handleChangeMonth
    };
};

export default useDateRangePicker;
