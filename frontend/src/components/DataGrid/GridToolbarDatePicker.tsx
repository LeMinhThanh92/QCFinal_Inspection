import React, { useCallback, useState } from "react";
import DateRangePicker from "@components/DateRangePicker/DateRangePicker.tsx";
import { Signal } from "@preact/signals-core";

interface GridToolbarDatePickerProps {
    date: any;
    setdate: (value: any) => void;
}

export const GridToolbarDatePicker: React.FC<GridToolbarDatePickerProps> = ({ date, setdate }) => {

    const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([date.startDate, date.endDate]);

    const handleApply = useCallback((range: [Date | null, Date | null]) => {
        setdate({
            startDate: range[0],
            endDate: range[1],
        });
    }, [date.startDate, date.endDate]);

    const handleCancel = () => {
        console.log('Date range selection cancelled');
    };


    return <DateRangePicker
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        showApplyCancelButtons={true}
        onApply={handleApply}
        onCancel={handleCancel}
    />
}