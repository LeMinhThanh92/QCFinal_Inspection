import SeasonIcon from "@assets/ic_season.svg?react";

type IconColorProps = {
    color?: string;
};

export function IconSeason({color}: IconColorProps) {
    return <SeasonIcon style={{fill: color}}/>;
}