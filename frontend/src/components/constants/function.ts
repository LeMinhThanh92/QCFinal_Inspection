import dayjs from "dayjs";

export const convertDateTime = (timestamp: string) => {
    return dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss');
};

export const convertDate = (timestamp: string) => {
    return dayjs(timestamp).format('DD/MM/YYYY');
};

export const convertTime = (timestamp: string) => {
    return dayjs(timestamp).format('HH:mm:ss');
};