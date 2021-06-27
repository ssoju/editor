import { wrapIn, lift } from 'prosemirror-commands';
import { liftTarget } from 'prosemirror-transform';
import { AttributeSpec, Mark, MarkType, Node, NodeRange, NodeType } from 'prosemirror-model';
import { EditorState, SelectionRange, TextSelection, Transaction } from 'prosemirror-state';
import { assign, clone, has, isMatch, some } from 'lodash';
import { findBlocksInSelection, findNodesInSelection } from '~/packages/lib/prosemirror-utils';

function rangeTotallyMarked(container: Node, from: number, to: number, type: MarkType) {
  let foundUnmark = false;
  container.nodesBetween(from, to, (node) => {
    if (!node.isText) return true;
    if (!type.isInSet(node.marks)) foundUnmark = true;
    return !foundUnmark;
  });

  return !foundUnmark;
}

function markApplies(doc: Node, ranges: SelectionRange[], type: MarkType) {
  for (let i = 0; i < ranges.length; i++) {
    let { $from, $to } = ranges[i];
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, (node) => {
      if (can) return false;
      can = node.inlineContent && node.type.allowsMarkType(type);
    });
    if (can) return true;
  }
  return false;
}

export function isMarkActive(state: EditorState, type: MarkType) {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return type.isInSet(state.storedMarks || $from.marks());
  }
  return rangeTotallyMarked(state.doc, from, to, type);
}

export function markCommand(markType: MarkType, attrs?: AttributeSpec) {
  return (state: EditorState, dispatch: any) => {
    const { empty, $cursor, ranges } = state.selection as TextSelection;
    if ((empty && !$cursor) || !markApplies(state.doc, ranges, markType)) return false;
    if (!dispatch) return true;

    if ($cursor) {
      if (markType.isInSet(state.storedMarks || $cursor.marks())) {
        dispatch(state.tr.removeStoredMark(markType));
      } else {
        dispatch(state.tr.addStoredMark(markType.create(attrs)));
      }
    } else {
      const allMarked = ranges.every(({ $from, $to }) =>
        rangeTotallyMarked(state.doc, $from.pos, $to.pos, markType),
      );
      const tr = ranges.reduce((tr, { $from, $to }) => {
        if (allMarked) {
          return tr.removeMark($from.pos, $to.pos, markType);
        }
        return tr.addMark($from.pos, $to.pos, markType.create(attrs));
      }, state.tr);
      dispatch(tr);
    }

    return true;
  };
}

export function blockActive(type: NodeType, attrs: AttributeSpec) {
  const attr = clone(attrs);

  return (state: EditorState) => {
    const { from, to } = state.selection;
    let hasTheType = false;

    state.doc.nodesBetween(from, to, (node: Node) => {
      if (hasTheType) return false;
      if (node.isBlock && node.type === type) {
        hasTheType = !attr || isMatch(node.attrs, attr);
      }
    });

    return hasTheType;
  };
}

export function unwrapType(nodeType: NodeType, attrs: AttributeSpec = {}) {
  return (state: EditorState, dispatch: any) => {
    const ranges = findBlocksInSelection(state, nodeType, attrs).map(({ node, pos }: any) => {
      const $from = state.doc.resolve(pos + 1);
      const $to = state.doc.resolve(pos + node.nodeSize - 1);

      return $from.blockRange($to);
    });

    if (!dispatch) {
      return some(ranges, (range: NodeRange) => typeof liftTarget(range) !== 'undefined');
    }

    dispatch(
      // @ts-ignore
      ranges.reverse().reduce((tr, range) => {
        if (range) {
          const lift = liftTarget(range);
          if (lift) {
            return tr.lift(range, lift);
          }
        }
        return tr;
      }, state.tr),
    );
  };
}

export function toggleWrapType(nodeType: NodeType, attrs = {}) {
  const wrap = wrapIn(nodeType, attrs);

  return (state: EditorState, dispatch: any) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    const target = range && liftTarget(range);

    if (!dispatch) {
      return target !== undefined ? target : wrap(state);
    }
    return target !== undefined ? lift(state, dispatch) : wrap(state, dispatch);
  };
}

export function alignCommand(align: string) {
  return (state: EditorState, dispatch: any) => {
    const { paragraph, heading } = state.schema.nodes;
    const textNodeTypes = [paragraph, heading];
    const blocks = findNodesInSelection(state, (node) => has(node, 'type.attrs.align'));
    const hasTheAlign = blocks.some(([node]) => node.attrs.align === align);

    const tr = blocks.reduce((tr, [node, pos]) => {
      return tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        align: hasTheAlign ? null : align,
      });
    }, state.tr);

    if (tr !== state.tr) {
      dispatch && dispatch(tr);
      return true;
    }

    return false;
  };
}

export function setBlockType(nodeType: NodeType, attrs: AttributeSpec) {
  return function(state: EditorState, dispatch: any) {
    const { from, to } = state.selection;
    let tr = state.tr;
    let applicable = false;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) return;
      if (node.type === nodeType) {
        applicable = true;

        if (dispatch) {
          tr = tr.setBlockType(pos, pos + 1, nodeType, assign({}, node.attrs, attrs));
        }
      } else {
        const $pos = state.doc.resolve(pos);
        const index = $pos.index();
        applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);

        if (applicable && dispatch) {
          tr = tr.setBlockType(pos, pos + 1, nodeType, assign({}, node.attrs, attrs));
        }
      }
    });

    dispatch && dispatch(tr.scrollIntoView());

    return applicable;
  };
}
