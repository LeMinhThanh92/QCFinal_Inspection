import React, { memo, useCallback, useEffect, useState } from "react";
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isSameDay,
    isWithinInterval,
    startOfMonth
} from "date-fns";
import { Box, Button, Grid, IconButton, MenuItem, Paper, Select, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import useDateRangePicker from "@components/DateRangePicker/useDateRangePicker.ts";
import { useLocale } from "@/utils/context/LocaleProvider";

interface NavigationButtonProps {
    onClick: () => void;
    direction: "left" | "right";
    hoverColor: any;
}

const NavigationButton: React.FC<NavigationButtonProps> = React.memo(({ onClick, direction, hoverColor }) => (
    <IconButton
        onClick={onClick}
        sx={{
            borderRadius: 2,
            width: 30,
            height: 30,
            backgroundColor: (theme) => theme.palette.primary.main,
            "&:hover": { backgroundColor: hoverColor },
        }}
    >
        {direction === "left" ? <ArrowLeft sx={{ color: "white" }} /> : <ArrowRight sx={{ color: "white" }} />}
    </IconButton>
));

const DayOfWeek: React.FC<{ day: string }> = React.memo(({ day }) => (
    <Typography
        align="center"
        variant="subtitle2"
        sx={{
            fontWeight: "bold",
            color: (theme) => theme.color.primary.o7,
            width: 36,
            height: 40,
            margin: "0 4px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        {day}
    </Typography>
));

interface CalendarHeaderProps {
    direction: "left" | "right";
    month: Date;
    handlePrevMonth: () => void;
    handleNextMonth: () => void;
    handleChangeMonth: (date: any) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = React.memo(({
    direction,
    month,
    handlePrevMonth,
    handleNextMonth,
    handleChangeMonth
}) => {
    const { t } = useLocale();
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(month.getFullYear(), month.getMonth(), 1));
    const [currentYear, setCurrentYear] = useState<Date>(new Date(month.getFullYear(), 0, 1));

    useEffect(() => {
        setCurrentMonth(new Date(month.getFullYear(), month.getMonth(), 1));
        setCurrentYear(new Date(month.getFullYear(), 0, 1));
    }, [month]);

    const handleMonthChange = (event: SelectChangeEvent<string>) => {
        const selectedMonth = parseInt(event.target.value, 10);
        handleChangeMonth(new Date(currentYear.getFullYear(), selectedMonth, 1))
    };

    const handleYearChange = (event: SelectChangeEvent<string>) => {
        const selectedYear = parseInt(event.target.value, 10);
        handleChangeMonth(new Date(selectedYear, currentMonth.getMonth(), 1))
    };

    const monthMap: Record<number, string> = {
        0: t?.calendar?.january ?? 'Tháng 1',
        1: t?.calendar?.february ?? 'Tháng 2',
        2: t?.calendar?.march ?? 'Tháng 3',
        3: t?.calendar?.april ?? 'Tháng 4',
        4: t?.calendar?.may ?? 'Tháng 5',
        5: t?.calendar?.june ?? 'Tháng 6',
        6: t?.calendar?.july ?? 'Tháng 7',
        7: t?.calendar?.august ?? 'Tháng 8',
        8: t?.calendar?.september ?? 'Tháng 9',
        9: t?.calendar?.october ?? 'Tháng 10',
        10: t?.calendar?.november ?? 'Tháng 11',
        11: t?.calendar?.december ?? 'Tháng 12',
    };
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: monthMap[i]
    }));

    const generateYearOptions = () => {
        const options = [];
        const startYear = currentYear.getFullYear() - 5;
        const endYear = currentYear.getFullYear() + 5;

        for (let year = startYear; year <= endYear; year++) {
            options.push(year);
        }

        return options;
    };


    const hoverColor = (theme: Theme) => theme.palette.primary.dark;
    const isLeft = direction === "left";
    return (
        <Stack direction="row" justifyContent="space-around" display={'flex'} alignItems={'center'}>
            {isLeft && <NavigationButton onClick={handlePrevMonth} direction="left" hoverColor={hoverColor} />}
            <Box flexGrow={1} />
            {/* <Typography variant="h6" align="center" gutterBottom>{format(month, "MMMM yyyy")}</Typography> */}
            <Select
                value={String(currentMonth.getMonth())}
                onChange={handleMonthChange}
                size="small"
                variant="outlined"
                sx={{
                    minWidth: 100,
                    border: "none !important",
                    "&:before": { borderBottom: "none" },
                    "&:after": { borderBottom: "none" },
                    "& .MuiSelect-select": {
                        padding: "8px 0",
                        textAlign: "center",
                        fontWeight: 600
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                    },
                }}
            >
                {monthOptions.map((month) => (
                    <MenuItem key={month.value} value={String(month.value)}>
                        {month.label}
                    </MenuItem>
                ))}
            </Select>

            <Select
                value={String(currentYear.getFullYear())}
                onChange={handleYearChange}
                size="small"
                variant="outlined"
                sx={{
                    minWidth: 100,
                    border: "none !important",
                    "&:before": { borderBottom: "none" },
                    "&:after": { borderBottom: "none" },
                    "& .MuiSelect-select": {
                        padding: "8px 0",
                        textAlign: "right",
                        fontWeight: 600
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                    },
                }}
            >
                {generateYearOptions().map((year) => (
                    <MenuItem key={year} value={String(year)}>
                        {year}
                    </MenuItem>
                ))}
            </Select>
            {!isLeft && (
                <>
                    <Box flexGrow={1} />
                    <NavigationButton onClick={handleNextMonth} direction="right" hoverColor={hoverColor} />
                </>
            )}
            {isLeft && <Box flexGrow={1} />}
        </Stack>
    );
});

const CalendarDays: React.FC<{ daysInWeek: string[] }> = React.memo(({ daysInWeek }) => (
    <Stack direction="row" justifyContent="center">
        {daysInWeek.map((day) => (
            <DayOfWeek day={day} key={day} />
        ))}
    </Stack>
));

const CalendarGrid: React.FC<{ calendarGrid: React.ReactNode }> = React.memo(({ calendarGrid }) => (
    <Box sx={{ position: "relative", overflow: "hidden", minWidth: 312, minHeight: 242 }}>
        <Grid container columns={7} sx={{ position: "absolute", top: 0, right: 0, left: 0 }}>
            {calendarGrid}
        </Grid>
    </Box>
));

interface CalendarProps {
    selectedDateRange: [Date | null, Date | null];
    setSelectedDateRange: (range: [Date | null, Date | null]) => void;
    onClose: () => void;
    minDate?: Date;
    maxDate?: Date;
    showApplyCancelButtons?: boolean;
    onApply?: (range: [Date | null, Date | null]) => void;
    onCancel?: () => void;
    renderFooter?: () => React.ReactNode;
}

const Calendar: React.FC<CalendarProps> = memo(
    ({
        selectedDateRange,
        setSelectedDateRange,
        onClose,
        minDate,
        maxDate,
        showApplyCancelButtons,
        onApply,
        onCancel,
        renderFooter
    }) => {
        const { t } = useLocale();
        const {
            currentMonth,
            hoveredDate,
            handlePrevMonth,
            handleNextMonth,
            handleApply,
            handleCancel,
            handleDayClick,
            setHoveredDate,
            handleChangeMonth
        } = useDateRangePicker({
            selectedDateRange,
            setSelectedDateRange,
            onApply,
            onCancel,
            minDate,
            maxDate,
            onClose,
            showApplyCancelButtons,
        });
        const [isCheck, setIsCheck] = useState(false);

        const [start, end] = selectedDateRange;

        useEffect(() => {
            if (start != null && end != null) {
                setIsCheck(false);
            } else {
                setIsCheck(true);
            }
        }, [start, end]);

        const renderCalendar = useCallback((month: Date, direction: "left" | "right") => {
            const startMonth = startOfMonth(month);
            const days = eachDayOfInterval({ start: startMonth, end: endOfMonth(month) });
            const daysInWeek = [t?.calendar?.mon, t?.calendar?.tue, t?.calendar?.wed, t?.calendar?.thu, t?.calendar?.fri, t?.calendar?.sat, t?.calendar?.sun];
            const calendarGrid: React.ReactNode[] = [];
            const startDay = (getDay(startMonth) + 6) % 7;
            for (let i = 0; i < startDay; i++) {
                calendarGrid.push(<Grid item xs={1} key={`empty-${i}`} />);
            }

            days.forEach((day) => {
                const isSelected = start && end && isWithinInterval(day, { start, end });
                const isStart = start && isSameDay(day, start);
                const isEnd = end && isSameDay(day, end);
                const isHovered = hoveredDate && start && !end && isWithinInterval(day, { start, end: hoveredDate });
                const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);
                const isCheckDateHover = start && !end && hoveredDate instanceof Date && start instanceof Date && hoveredDate < start ? true : false;
                const borderRadius = {
                    borderTopLeftRadius: isStart && isCheckDateHover ? 0 : isStart ? "50%" : 0,
                    borderBottomLeftRadius: isStart && isCheckDateHover ? 0 : isStart ? "50%" : 0,
                    borderTopRightRadius: isStart && isCheckDateHover ? "50%" : isEnd ? "50%" : 0,
                    borderBottomRightRadius: isStart && isCheckDateHover ? "50%" : isEnd ? "50%" : 0,
                };

                calendarGrid.push(
                    <Grid
                        item
                        xs={1}
                        key={day.toDateString()}
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 40 }}
                    >
                        <Box
                            onClick={() => !isDisabled && handleDayClick(day)}
                            onMouseEnter={() => !isDisabled && setHoveredDate(day)}
                            onMouseLeave={() => !isDisabled && setHoveredDate(null)}
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: isStart || isEnd ? (theme) => theme.color.primary.o5 : isHovered || isSelected ? (theme) => theme.color.background.o10 : "transparent",
                                ...borderRadius,
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: isStart || isEnd ? "bold" : "normal",
                                    color: isStart || isEnd ? "#FFF" : (theme) => theme.color.text.o1
                                }}
                            >
                                {format(day, "d")}
                            </Typography>
                        </Box>
                    </Grid>
                );
            });

            return (
                <Box sx={{ margin: [1, 2, 1, 2] }}>
                    <CalendarHeader direction={direction} month={month} handlePrevMonth={handlePrevMonth}
                        handleNextMonth={handleNextMonth} handleChangeMonth={handleChangeMonth} />
                    <CalendarDays daysInWeek={daysInWeek} />
                    <CalendarGrid calendarGrid={calendarGrid} />
                </Box>
            );
        }, [handleDayClick, hoveredDate, maxDate, minDate, start, end, handlePrevMonth, handleNextMonth, setHoveredDate]);

        const defaultRenderApplyButton = useCallback((handleApply: () => void, isCheck: boolean) => (
            <Button
                onClick={handleApply}
                variant="contained"
                disabled={isCheck}
                sx={{
                    width: '134px',
                    color: (theme) => theme.color.neutral.o1,
                    borderColor: (theme) => theme.color.primary.o6,
                    fontSize: '16px',
                    fontWeight: 600,
                    backgroundColor: (theme) => theme.color.primary.o6,
                    '&:hover': {
                        borderColor: (theme) => theme.color.primary.o6,
                        color: (theme) => theme.color.neutral.o1,
                    },
                }}
            >
                {t.common.confirm}
            </Button>
        ), []);

        const defaultRenderCancelButton = useCallback((handleCancel: () => void) => (
            <Button
                onClick={handleCancel}
                variant="outlined"
                sx={{
                    width: '134px',
                    color: (theme) => theme.color.primary.o6,
                    borderColor: (theme) => theme.color.primary.o6,
                    fontSize: '16px',
                    fontWeight: 600,
                    backgroundColor: (theme) => theme.color.neutral.o1,
                    '&:hover': {
                        borderColor: (theme) => theme.color.primary.o6,
                        color: (theme) => theme.color.primary.o6,
                    },
                }}
            >
                {t.common.cancel}
            </Button>
        ), []);

        return (
            <Paper sx={{ backgroundColor: (theme) => theme.color.background.o1, border: 1, borderColor: (theme) => theme.color.background.o5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" justifyContent="center" alignItems="center">
                        {renderCalendar(currentMonth, "left")}
                        <Box sx={{ marginLeft: 3 }}>{renderCalendar(addMonths(currentMonth, 1), "right")}</Box>
                    </Box>
                </Box>
                {showApplyCancelButtons ? (
                    renderFooter ? (
                        renderFooter()
                    ) : (
                        <Stack direction="row" justifyContent="flex-end" spacing={1} padding={2}>
                            {defaultRenderCancelButton(handleCancel)}
                            {defaultRenderApplyButton(handleApply, isCheck)}
                        </Stack>
                    )
                ) : null}
            </Paper>
        );
    });

export default Calendar;
