import { Command } from 'prosemirror-commands';
import {
  Mark,
  MarkType,
  Node as ProsemirrorNode,
  NodeType,
  ResolvedPos, Schema,
} from 'prosemirror-model';
import { EditorState, NodeSelection, Selection } from 'prosemirror-state';
import { findWrapping, liftTarget } from 'prosemirror-transform';
import { parentBlockPos, parentInGroupPos, parentWithNodeTypePos } from '~/packages/lib';

export const insertNodeOfType = (nodeType: NodeType): Command => (
  state: EditorState,
  dispatch: any,
) => {
  const node = nodeType.create();
  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
  }
  return true;
};

export const removeFormatting: Command = (state: EditorState, dispatch: any) => {
  const { from, to } = state.selection;
  const { tr } = state;

  tr.removeMark(from, to, undefined).setStoredMarks();

  if (!tr.docChanged) {
    return false;
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

export const changeBlockType = <S extends Schema>(
  nodeType: NodeType<S>,
  attrs?: Record<string, unknown>,
  marks?: Array<Mark<S>>,
) => (state: EditorState<S>, dispatch?: any): boolean => {
  const { $from } = state.selection;
  const parentPos = parentBlockPos($from);

  if (!parentPos) {
    return false;
  }

  if (dispatch) {
    dispatch(state.tr.setNodeMarkup(parentPos, nodeType, attrs, marks));
  }

  return true;
};

export const toggleWrap = (
  nodeType: NodeType,
  attrs?: Record<string, unknown>,
): Command => (state, dispatch): boolean => {
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);

  if (!range) {
    return false;
  }

  const parentPos = parentWithNodeTypePos(range.$from, nodeType);

  if (typeof parentPos === 'number') {
    // unwrap
    const target = liftTarget(range);

    if (typeof target !== 'number') {
      return false;
    }

    if (dispatch) {
      dispatch(state.tr.lift(range, target).scrollIntoView());
    }

    return true;
  } else {
    // wrap
    const wrapping = findWrapping(range, nodeType, attrs);

    if (!wrapping) {
      return false;
    }

    if (dispatch) {
      dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
    }

    return true;
  }
};

export const setListTypeOrWrapInList = (
  listType: NodeType,
  attrs: { type: string },
): Command => (state, dispatch) => {
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);

  if (!range) {
    return false;
  }

  const parentPos = parentInGroupPos(range.$from, 'list');

  if (typeof parentPos === 'number') {
    // already in list
    const $pos = state.doc.resolve(parentPos);

    const node = $pos.nodeAfter;

    if (node && node.type === listType && node.attrs.type === attrs.type) {
      // return false if the list type already matches
      return false;
    }

    if (dispatch) {
      dispatch(
        state.tr.setNodeMarkup(
          parentPos,
          listType,
          node ? { ...node.attrs, ...attrs } : attrs,
        ),
      );
    }

    return true;
  } else {
    const wrapping = findWrapping(range, listType, attrs);

    if (!wrapping) {
      return false;
    }

    if (dispatch) {
      dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
    }

    return true;
  }
};
