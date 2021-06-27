import { EditorState, NodeSelection, Selection, TextSelection } from 'prosemirror-state';
import type { Transaction } from 'prosemirror-state';
import { AttributeSpec, Node, NodeType, ResolvedPos } from 'prosemirror-model';
import { ReplaceStep } from 'prosemirror-transform';
import type { Step } from 'prosemirror-transform';
import { Decoration, EditorView } from 'prosemirror-view';
import { CellSelection } from 'prosemirror-tables';
import { clamp, isMatch } from 'lodash';

type ClosetNodeFilter = (node: Node) => boolean;

type ClosestNodePosition = {
  pos: number;
  start: number;
  depth: number;
  node: Node;
};

type FindNodesMatcherCallable = (node: Node, pos: number, parent: Node, index: number) => boolean;
type FindNodesMatcher = NodeType | string | FindNodesMatcherCallable;

type FindNodesResult = [node: Node, pos: number, parent: Node, index: number];

function ensureArray<T>(arg: T | T[]): T[] {
  return Array.isArray(arg) ? arg : [arg];
}

/**
 * 주어진 위치 `$pos`부터 부모 노드를 탐색하며 정해진 조건 `predicate`을 만족하는 가장 가까운 노드를 찾아서 반환한다.
 *
 * @param {ResolvedPos} $pos 대상 노드의 resolved position
 * @returns {ClosestNodePosition} 찾은 노드의 위치 정보. 못 찾으면 undefined 반환
 *
 * ```javascript
 * // 예시
 * const predicate = (node) => node.type === schema.nodes.blockquote;
 * const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
 * ```
 */
export function findParentNodeClosestToPos(
  $pos: ResolvedPos,
  predicate: ClosetNodeFilter
): ClosestNodePosition | undefined {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
}

/**
 * 선택 영역 안에서 주어진 조건에 일치하는 노드만 찾아서 반환한다.
 *
 * @param {EditorState|Transaction} state
 * @param {Function|NodeType|String} matcher 일치하는 노드를 구하기 위한 매치 함수. 노드 타입 또는 노드 타입 문자열도 가능.
 * @return {Array} 각 배열 원소는 [node, pos, parent, index] 형태의 배열로 표현된다.
 */
export function findNodesInSelection(
  { selection: { from, to }, doc }: EditorState | Transaction,
  matcher: FindNodesMatcher
): FindNodesResult[] {
  const result: FindNodesResult[] = [];
  let matcherFn: FindNodesMatcherCallable;

  if (matcher instanceof NodeType) {
    const nodeType = matcher;
    matcherFn = ({ type }) => type === nodeType;
  }

  if (typeof matcher === 'string') {
    const nodeTypeName = matcher;
    matcherFn = ({ type: { name } }) => name === nodeTypeName;
  }

  if (typeof matcher === 'function') {
    matcherFn = matcher;
  }

  doc.nodesBetween(from, to, (...args) => {
    if (matcherFn?.(...args)) {
      result.push(args);
    }
  });

  return result;
}

/**
 * 주어진 노드 타입과 속성에 해당하는 블럭 노드를 찾아서 반환한다.
 * @param {EditorState|Transaction} state
 * @param {NodeType[]} nodeTypes
 * @param {Object} attributes (optional)
 */
export function findBlocksInSelection(
  state: EditorState | Transaction,
  nodeTypes: NodeType | NodeType[],
  attributes?: AttributeSpec
) {
  const _nodeTypes = ensureArray<NodeType>(nodeTypes);

  return findNodesInSelection(
    state,
    ({ type, attrs }) =>
      _nodeTypes.indexOf(type) >= 0 && (!attributes || isMatch(attrs, attributes))
  );
}

/**
 * 주어진 노드의 자식 노드 중에서 해당하는 타입만 찾는다.
 **/
export function findChildrenOfType(node: Node, nodeTypes: NodeType[]) {
  nodeTypes = ensureArray<NodeType>(nodeTypes);

  return findChildren(node, (node) => nodeTypes.indexOf(node.type) !== -1);
}

/**
 * 선택 영역에 있는 최상위 노드를 모두 찾아서 반환한다.
 */
export function findTopNodesInSelection({ doc, selection }: EditorState) {
  const { $from, $to, empty } = selection;
  const { node } = selection as NodeSelection;
  const fromIndex = $from.index(0);
  let toIndex = $to.index(0);

  // Node selection?
  if (node)
    return [
      {
        node: $from.depth > 0 ? $from.node(1) : node,
        pos: $from.pos,
      },
    ];

  if (!empty && '$cursor' in selection && toIndex === fromIndex + 1) {
    const text = doc.textBetween($from.pos, $to.pos);
    if (text.length === 0) {
      toIndex = fromIndex;
    }
  }

  return findChildren(doc, (_, __, index) => fromIndex <= index && index <= toIndex);
}

type FindChildrenResult = { node: Node; pos: number };

/**
 * 자식 노드에서 `predicate` 조건을 만족하는 노드만 찾는다.
 */
export function findChildren(
  node: Node,
  predicate: (node: Node, offset: number, index: number) => boolean
): FindChildrenResult[] {
  const result: FindChildrenResult[] = [];

  node.forEach((node, offset, index) => {
    if (predicate(node, offset, index)) {
      result.push({ node, pos: offset });
    }
  });

  return result;
}

/**
 * 노드를 복제한다.
 **/
export function cloneNode(node: Node): Node {
  return Node.fromJSON(node.type.schema, node.toJSON());
}

/**
 * 에디터에서 설정한 노드를 편집할 수 없게 하는 데코레이션을 반환한다.
 * @param {EditorState} state
 * @param {String} nodeName
 * @return {Decoration[]}
 */
export function nonEditableDecorations(state: EditorState, nodeName: string) {
  const decorations: Decoration[] = [];

  state.doc.descendants((node, pos) => {
    if (node.type.name !== nodeName) return;
    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        contentEditable: node.attrs.editable ? 'true' : null,
      })
    );
  });

  return decorations;
}

/**
 * 문서에서 선택 가능한 영역의 시작과 끝을 반환한다.
 * @param  {ProseMirror.Node} doc ProseMirror 문서 객체
 * @return {Object}
 */
export function getDocumentBoundary(doc: Node) {
  const start = Selection.atStart(doc);
  const end = Selection.atEnd(doc);

  return {
    start: start.from,
    end: end.to,
  };
}

export type StepExtension<T extends Step> = T & { guest?: boolean; from: number; to: number };
/**
 * 트랜잭션에서 삭제될 노드를 찾는다.
 * @param {Transaction} tr
 * @param {Function} predicate 적합 여부를 반환하는 함수
 */
export function findNodesToRemove(tr: Transaction, predicate?: (node: Node) => boolean) {
  if (!tr.docChanged || tr.selection instanceof CellSelection) return [];

  const { start, end } = getDocumentBoundary(tr.doc);

  return tr.steps.reduce((result, _step) => {
    const step = _step as StepExtension<ReplaceStep>;
    if (step.guest || !(step instanceof ReplaceStep)) return result;

    const from = clamp(step.from, start, end);
    const to = clamp(step.to, start, end);

    tr.before.nodesBetween(from, to, (node) => {
      if (!predicate || predicate(node)) result.push(node);
    });

    return result;
  }, [] as Node[]);
}

/**
 * 주어진 위치 앞에 있는 텍스트 반환
 * @param {ResolvedPos} $pos
 * @return {String}
 */
export function getTextBefore($pos: ResolvedPos): string {
  return $pos.parent.textBetween(
    Math.max(0, $pos.parentOffset - 100),
    $pos.parentOffset,
    undefined,
    '\ufffc'
  );
}

/**
 * 선택된 위젯이 있다면 DOM을 반환하고 그렇지 않으면 null을 반환한다.
 * @param {EditorState} state
 * @return {?HTMLElement}
 * @private
 */
export function getSelectedWidgetElement({ selection }: EditorState): HTMLElement | null {
  const { node } = selection as NodeSelection;

  if (node?.type.name === 'widget_marker') {
    const dom = document.getElementById(node.attrs.id)?.previousSibling as HTMLElement;
    if (dom && dom.classList.contains('widget')) {
      return dom;
    }
  }
  return null;
}

/**
 * 위젯 마커가 선택되어 있다면 해당 마커를 반환하고 그렇지 않으면 null을 반환한다.
 * @param {EditorState} state
 * @return {?Node}
 * @private
 */
export function getSelectedWidgetMarker({ selection }: EditorState): Node | null {
  const { node } = selection as NodeSelection;

  if (node?.type.name === 'widget_marker') {
    return node;
  }
  return null;
}

/**
 * anchor, head에 해당하는 텍스트를 선택
 * @param {EditorView} view
 * @param {number} anchor
 * @param {number} [head]
 */
export function setTextSelection(view: EditorView, anchor: number, head?: number) {
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, anchor, head));
  view.dispatch(tr);
}
