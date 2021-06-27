declare module '*.svg' {
    const content: string;
    export default content;
}

type Nullable<T> = T | null;
type Marker = { node: Node, before: number, after: number };

declare var __VERSION__: string;

declare class U {
    next(string): U;
    first(): HTMLElement;
}
