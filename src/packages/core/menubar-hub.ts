import Editor from '~/packages/core/editor';
import { Plugin } from 'prosemirror-state';

export default class MenubarHub {
  editor: Editor;
  pmPlugin?: Plugin;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * ProseMirror의 Plugin 형태로 감싼다.
   */
  asProseMirrorPlugin() {
    if (!this.pmPlugin) {
      // @ts-ignore
      this.pmPlugin = new Plugin(this);
    }
    return this.pmPlugin;
  }
}
