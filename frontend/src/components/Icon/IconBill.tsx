import BillIcon from "@assets/bill.svg?react";

type IconBillProps = {
    color?: string;
};

export function IconBill({color}: IconBillProps) {
    return <BillIcon style={{fill: color}}/>;
}