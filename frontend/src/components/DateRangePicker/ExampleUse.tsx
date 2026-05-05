import DateRangePicker from "@components/DateRangePicker/DateRangePicker.tsx";
import {Button, Stack, Typography} from "@mui/material";
import {useState} from "react";
import {format} from "date-fns";

export const ExampleUse = () => {
    return <Stack direction={'column'} spacing={2} padding={2}>
        <ExampleWithoutButton/> </Stack>
}

const ExampleWithoutButton = () => {
    const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);

    const formatDateRange = (start: Date | null, end: Date | null) => {
        if (start && end) {
            return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
        }
        return 'No date range selected';
    };

    return (
        <div>
            <h1>Select Date Range without button</h1>
            <Stack>
                <DateRangePicker
                    selectedDateRange={selectedDateRange}
                    setSelectedDateRange={setSelectedDateRange}
                    showApplyCancelButtons={false}
                />
                <Typography variant="body1" component="p" gutterBottom marginTop={2}>
                    Selected Date Range: {formatDateRange(selectedDateRange[0], selectedDateRange[1])}
                </Typography>
            </Stack>
        </div>
    );
};

const ExampleWithCustomButton = () => {
    const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);

    const handleApply = (range: [Date | null, Date | null]) => {
        console.log('Date range applied:', range);
    };

    const handleCancel = () => {
        console.log('Date range selection cancelled');
    };

    const renderCustomFooter = () => (
        <Stack direction="row" justifyContent="space-between" padding={2}>
            <Button onClick={handleCancel} variant="outlined" color="primary">
                Custom Cancel
            </Button>
            <Button onClick={() => handleApply(selectedDateRange)} variant="contained" color="primary">
                Custom Apply
            </Button>
        </Stack>
    );

    return (
        <div>
            <h1>Select Date Range with custom button</h1>
            <DateRangePicker
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
                showApplyCancelButtons={true}
                onApply={handleApply}
                onCancel={handleCancel}
                renderFooter={renderCustomFooter}
            />
        </div>
    );
}


const ExampleWithDefaultButton = () => {
    const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);

    const handleApply = (range: [Date | null, Date | null]) => {
        console.log('Date range applied:', range);
    };

    const handleCancel = () => {
        console.log('Date range selection cancelled');
    };

    return (
        <div>
            <h1>Select Date Range with default button</h1>
            <DateRangePicker
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
                showApplyCancelButtons={true}
                onApply={handleApply}
                onCancel={handleCancel}
            />
        </div>
    );
}