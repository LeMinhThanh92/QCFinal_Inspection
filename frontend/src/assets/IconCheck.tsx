import CheckIcon from "@assets/ic_check.svg?react";

type IconCheckProps = {
    color?: string;
};

export function IconCheck({color}: IconCheckProps) {
    return <CheckIcon style={{fill: color}}/>;
}