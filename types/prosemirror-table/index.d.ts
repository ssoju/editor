import type { Node } from 'prosemirror-model';

declare module 'prosemirror-tables' {
  export class TableView {
    node: Node;
    dom: HTMLDivElement;
    table: HTMLTableElement;
    colgroup: HTMLElement;
    contentDOM: HTMLTableSectionElement;
    cellMinWidth: number;

    constructor(node: Node, cellMinWidth: number);

    update: (node: Node) => boolean;
    stopEvent?: (event: Event) => boolean;
    ignoreMutation?: (record: MutationRecord) => boolean;
    setSelection?: (anchor: number, head: number, root: Document) => void;
  }
}
