import PurchaseOderIcon from "@assets/purchase_orders.svg?react";

type IconPurchaseOrderProps = {
    color?: string;
};

export function IconPurchaseOrder({color}: IconPurchaseOrderProps) {
    return <PurchaseOderIcon style={{fill: color}}/>;
}