import ColorIcon from "@assets/ic_color.svg?react";

type IconColorProps = {
    color?: string;
};

export function IconColor({color}: IconColorProps) {
    return <ColorIcon style={{fill: color}}/>;
}