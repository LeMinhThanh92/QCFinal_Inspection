import DDTIcon from "../../assets/ic_DDT.svg?react";
type IconDDTProps = {
    color?: string;
};
export function IconDDT({color}: IconDDTProps) {
    return <DDTIcon style={{fill: color, stroke: color}}/>
}