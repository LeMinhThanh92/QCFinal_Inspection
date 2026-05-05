import SettingIcon from "../../assets/ic_setting.svg?react";

type IconSettingProps = {
    color?: string;
};

export function IconSetting({color}: IconSettingProps) {
    return <SettingIcon style={{fill: color}}/>
}