import React from "react";
export type DragProps = {
    style: React.CSSProperties;
    onDragStart: (event: React.DragEvent<HTMLElement>) => void;
    draggable: "true";
    ref: React.RefCallback<HTMLElement>;
};
interface RearrangeableItem {
    id: string;
}
type DragAndDropProps<T extends RearrangeableItem> = {
    items: T[];
    render: ([item, dragProps]: [item: T, props: DragProps, itemIsDragging: boolean][]) => React.ReactElement;
    onDragEnd: (fromIndex: number, toIndex: number) => any;
    onDragStart?: (item: RearrangeableItem, event: React.DragEvent<HTMLElement>) => any;
};
export const arrWithReposition: (arr: any[], from: number, to: number) => any[];
declare const DragAndDrop: <T extends RearrangeableItem>({ render, items, onDragEnd, onDragStart }: DragAndDropProps<T>) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export default DragAndDrop;

//# sourceMappingURL=types.d.ts.map
