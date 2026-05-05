import PermissionIcon from "@assets/ic_permission.svg?react";

type IconPermissionProps = {
    color?: string;
};

export function IconPermission({color}: IconPermissionProps) {
    return <PermissionIcon style={{fill: color, stroke: color}}/>;
}