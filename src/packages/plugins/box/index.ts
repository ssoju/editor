import { Node } from 'prosemirror-model';
import u from 'umbrellajs';

import Editor from '~/packages/core/editor';
import Plugin from '~/packages/core/plugin';
import { ChangeEvent } from 'react';

const WIDGET_TYPE = 'box';

export default class Box extends Plugin {
  $widgets: any = {};

  constructor(editor: Editor) {
    super(editor);

    editor.registerFilter('mention.widgets', this.addWidget);
  }

  addWidget = (widgets: any[]) => {
    return [
      ...widgets,
      {
        type: WIDGET_TYPE,
        name: '상자',
        description: '<h2>상자</h2><p>상자를 그리는 위젯 예시입니다.</p>',
      },
    ];
  };

  renderWidget(node: Node) {
    if (node.attrs.type !== WIDGET_TYPE) return;

    let $dom = this.$widgets[node.attrs.id];

    if (!$dom) {
      const $select = u(
        '<select><option>Gray</option><option>Red</option><option>Blue</option><option>Green</option></select>',
      );

      $dom = u('<div class="box"><p>상자를 보여줍니다.</p></div>').append($select);
      $select.on('change', (event: ChangeEvent<HTMLSelectElement>) => this.changeColor(node.attrs.id, event.target.value));

      this.$widgets[node.attrs.id] = $dom;
    }

    const color = node.attrs.args?.color || 'gray';

    if (!$dom.hasClass(color)) {
      $dom.removeClass('gray red blue green').addClass(color);
    }

    return this.$widgets[node.attrs.id].nodes[0];
  }

  changeColor(id: string, color: string) {
    color = color.toLowerCase();
    this.editor.updateWidget(id, { args: { color } });
  }
}
