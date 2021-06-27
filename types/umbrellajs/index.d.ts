declare module 'umbrellajs' {
  type Appendable = string | U | Function;
  type FilterFunc = (node: HTMLElement, i: index) => boolean;

  class U {
    /**
     * You can check how many elements are matched with .length:
     */
    length: number;

    nodes: HTMLElement[];

    /**
     * Add html class(es) to all of the matched elements.
     */
    addClass(className: string | string[]): U;

    /**
     * Add some html as a sibling after each of the matched elements.
     */
    after(child: Appendable): U;

    /**
     * Add some html as a child at the end of each of the matched elements
     */
    append(child: Appendable): U;

    /**
     * Add some html before each of the matched elements.
     */
    before(child: Appendable): U;

    /**
     * Find the first ancestor that matches the selector for each node
     */
    closest(filter: string): U;

    /**
     * Handle data-* attributes for the matched elements
     * ```
     * // GET
     * .data('name');
     *
     * // SET
     * .data('name', 'value');
     * .data({ name1: 'value', name2: 'value2' });
     * ```
     */
    data(name: string): string;
    data(name: string, value: unknown): U;
    data(dataSet: Record<string, unknown>): U;

    /**
     * Remove all the nodes that doesn't match the criteria
     */
    filter(filter: string | U | FilterFunc): U;

    /**
     * Get all of the descendants of the nodes with an optional filter
     */
    find(filter: string): U;

    /**
     * Retrieve the first of the matched nodes
     */
    first(): U;

    /**
     * Find if any of the matched elements contains the class passed:
     */
    hasClass(className: string | string[]): boolean;

    /**
     * Retrieve or set the html of the elements:
     * ```
     * // GET
     * .html();
     *
     * // SET
     * .html(html);
     * ```
     */
    html(): string;
    html(set: string): U;

    /**
     * Get the last element from a list of elements.
     */
    last(): U;

    /**
     * Remove event handler from matched nodes
     */
    off(event: string | string[]): U;
    off(event: string, callback: Function): U;
    off(event: string, selector: string, callback: Function): U;

    /**
     * Calls a function when an event is triggered
     */
    on(event: string | string[], callback: Function): U;
    on(event: string, selector: string, callback: Function): U;

    /**
     * Retrieve each parent of the matched nodes, optionally filtered by a selector
     */
    parent(filter?: string | U | FilterFunc): U;

    /**
     * Add some html as a child at the beginning of each of the matched elements.
     */
    prepend(child: Appendable): U;

    /**
     * Removes the matched elements.
     */
    remove(): U;

    /**
     * Remove html class(es) to all of the matched elements
     */
    removeClass(className: string | string[]): U;

    /**
     * Scroll to the first matched element, smoothly if supported.
     */
    scroll(): U;

    /**
     * Retrieve or set the text content of matched elements:
     * ```
     * // GET
     * .text();
     *
     * // SET
     * .text(text)
     * ```
     */
    text(): string;
    text(text: string): U;

    /**
     * Toggles html class(es) to all of the matched elements.
     */
    toggleClass(className: string | string[]): U;
    toggleClass(className: string, forceAdd: boolean): U;
    removeClass(className: string): U;
    css(styleName: string, value: string): U;
    next(selector?: string): U;
    attr(name: string): string;
    is(selector: string): boolean;
  }

  /**
   * Find nodes from the HTML with a CSS selector:
   * ```
   * u('ul#demo li')
   * u(document.getElementById('demo'))
   * u(document.getElementsByClassName('demo'))
   * u([ document.getElementById('demo') ])
   * u( u('ul li') )
   * u('<a>')
   * u('li', context)
   * ```
   */
  export default function u(
    htmlOrSelector: string | U | HTMLElement | HTMLElement[],
    context?: HTMLElement
  ): U;
}
