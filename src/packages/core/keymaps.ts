import { keymap } from 'prosemirror-keymap';
import { baseKeymap, chainCommands, exitCode, setBlockType } from 'prosemirror-commands';
import type { Keymap } from 'prosemirror-commands';
import { splitListItem, wrapInList } from 'prosemirror-schema-list';
import { undoInputRule } from 'prosemirror-inputrules';
import { undo, redo } from 'prosemirror-history';
import { toggleWrapType, markCommand } from './commands';
import schema from './schema';

function extraKeymap({ nodes, marks }: typeof schema) {
  const keys: Keymap = {
    'Mod-z': undo,
    'Mod-y': redo,
    'Shift-Mod-z': redo,
    'Mod-b': markCommand(marks.strong),
    'Mod-i': markCommand(marks.em),
    'Mod-u': markCommand(marks.underline),
    'Shift-Mod-x': markCommand(marks.del),
    Backspace: undoInputRule,
    Enter: splitListItem(nodes.list_item),
    'Shift-Enter': chainCommands(exitCode, (state, dispatch) => {
      dispatch?.(state.tr.replaceSelectionWith(nodes.hard_break.create()).scrollIntoView());
      return true;
    }),
    // paragraph
    'Mod-Alt-o': setBlockType(nodes.paragraph),
    // list
    'Mod-Shift-7': wrapInList(nodes.ordered_list),
    'Mod-Shift-8': wrapInList(nodes.bullet_list),
    // blcokquote
    // @ts-ignore
    'Mod-Alt-5': toggleWrapType(nodes.blockquote),
    // code block
    'Mod-Alt-6': setBlockType(nodes.code_block),
  };

  // headings
  for (let level = 1; level <= 4; level++) {
    keys[`Mod-Alt-${level}`] = setBlockType(nodes.heading, { level });
  }

  const instance = keymap(keys);

  return instance;
}

export default [extraKeymap(schema), keymap(baseKeymap)];
