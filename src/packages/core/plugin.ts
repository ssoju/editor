import { EditorState, PluginKey, Transaction } from 'prosemirror-state';
import type { Decoration } from 'prosemirror-view';
import type { Slice } from 'prosemirror-model';
import type Editor from './editor';

type NodeViewMap = Record<string, Function>;

export default class Plugin {
  editor: Editor;
  ownKey: PluginKey;
  /**
   * 노드에 대한 커스텀 렌더러를 할당하고 싶을 때 작성한다.
   * ProseMirror에 정의된 EditorProps.nodeViews와 같다.
   * @return {Object} 속성 이름으로는 스키마에 정의된 노드 이름(예. code_block)을 주고, 값은 NodeView 객체를 반환하는 함수여야 한다.
   * @see http://prosemirror.net/docs/ref/#view.EditorProps.nodeViews
   */
  static nodeViews(): NodeViewMap | void {}

  constructor(editor: Editor) {
    this.editor = editor;
    this.ownKey = new PluginKey(this.className);
  }

  get className() {
    return this.constructor.name;
  }

  /**
   * 노드를 꾸미는 Decoration 객체의 배열을 반환한다.
   * DecorationSet이 아닌 배열을 반환한다는 점을 제외하면 ProseMirror에 정의된 EditorProps.decorations와 같다.
   * @param {EditorState} state
   * @return {Decoration[]}
   * @see http://prosemirror.net/docs/ref/#view.EditorProps.decorations
   */
  decorations(state: EditorState): Decoration[] | void {}

  /**
   * 트랜잭션을 디스패치한다. EditorView.dispatch와 동일하다.
   * https://prosemirror.net/docs/ref/#view.EditorView.dispatch
   */
  dispatch(tr: Transaction) {
    this.editor.view?.dispatch(tr);
  }

  transformPastedHTML(html: string) {
    return null;
  }

  transformPastedText(text: string) {
    return null;
  }

  transformPasted(slice: Slice<any>) {
    return null;
  }
}
