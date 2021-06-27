import { DOMSerializer } from 'prosemirror-model';
import type { Node } from 'prosemirror-model';
import type Editor from './editor';
import schema from './schema';

const { nodes, marks } = DOMSerializer.fromSchema(schema);

/**
 * 드래그인지 복사인지 확인하여 적절한 DOMSerializer를 반환해주는 클래스
 */
export default class ClipboardSerializer extends DOMSerializer {
  editor: Editor;
  supportWidget = false;

  constructor(editor: Editor) {
    super(nodes, marks);
    this.editor = editor;
  }

  /**
   * 위젯의 지원 여부를 결정한다. 지원하지 않으면 위젯 마커가 복사 또는 드래그 되지 않는다.
   * @param {boolean} support 지원 여부
   */
  toggleSupportWidget(support: boolean = false) {
    this.supportWidget = support;
  }

  serializeNode(node: Node, options: Object = {}) {
    // 위젯 비지원 모드일 때, 위젯 노드에 대한 DOM으로는 프래그먼트를 반환한다.
    if (!this.supportWidget && node.type.name === 'widget_marker') {
      return document.createDocumentFragment();
    }

    // 아이디가 복제되지 않도록 아이디를 제거한다.
    if (node.attrs.id) node.attrs.id = '';

    return super.serializeNode(node, options);
  }
}
