import { MarkType, NodeType, ResolvedPos, Node, Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';

export const isMarkActive = (markType: MarkType) => (
  state: EditorState,
): boolean => {
  const { from, $from, to, empty } = state.selection;

  if (empty) {
    return Boolean(markType.isInSet(state.storedMarks || $from.marks()));
  }

  return state.doc.rangeHasMark(from, to, markType);
};

export const isNodeSelection = (selection: Selection) => 'node' in selection;

export const isBlockActive = (
  type: NodeType,
  attrs: Record<string, unknown> = {},
) => (state: EditorState): boolean => {
  // @ts-ignore
  if (isNodeSelection(state.selection)) {
    // @ts-ignore
    return state.selection.node.hasMarkup(type, attrs);
  }

  const { $from, to } = state.selection;

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

export const canInsert = (type: NodeType) => (state: EditorState): boolean => {
  const { $from } = state.selection;

  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);

    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
    }
  }

  return false;
};

export const parentWithNodeType = (
  $pos: ResolvedPos,
  nodeType: NodeType,
): Node | undefined => {
  for (let depth = $pos.depth; depth >= 0; depth--) {
    const parent = $pos.node(depth);

    if (parent.type === nodeType) {
      return parent;
    }
  }
};

export const parentWithNodeTypePos = (
  $pos: ResolvedPos,
  nodeType: NodeType,
): number | undefined => {
  for (let depth = $pos.depth; depth >= 0; depth--) {
    const parent = $pos.node(depth);

    if (parent.type === nodeType) {
      return $pos.before(depth);
    }
  }
};

export const parentInGroupPos = (
  $pos: ResolvedPos,
  nodeTypeGroup: string,
): number | undefined => {
  for (let depth = $pos.depth; depth >= 0; depth--) {
    const parent = $pos.node(depth);
    const { group } = parent.type.spec;

    if (group && group.split(/\s+/).includes(nodeTypeGroup)) {
      return $pos.before(depth);
    }
  }
};

export const canWrap = <S extends Schema>(
  nodeType: NodeType<S>,
  attrs?: Record<string, unknown>,
) => (state: EditorState<S>): boolean => {
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);

  if (!range) {
    return false;
  }

  if (parentWithNodeType(range.$from, nodeType)) {
    return false; // already wrapped
  }

  return findWrapping(range, nodeType, attrs) !== null;
};

export const isWrapped = (nodeType: NodeType) => (
  state: EditorState,
): boolean => {
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);

  if (!range) {
    return false;
  }

  return parentWithNodeType(range.$from, nodeType) !== undefined;
};

// TODO
export const parentBlockPos = ($pos: ResolvedPos): number => {
  return 0;
}


export const promptForURL = (msg: string = '') => {
  return '';
}
