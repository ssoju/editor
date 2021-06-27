import { EditorState, Plugin, PluginKey, Selection, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { insertPoint } from 'prosemirror-transform';
import { clamp } from 'lodash';
import schema from './schema';
import {
  findNodesToRemove,
  getSelectedWidgetElement,
  getSelectedWidgetMarker,
} from '~/packages/lib/prosemirror-utils';
import { findScrollable } from '~/packages/lib/dom-utils';
import { generateKeyName, isPureKey } from '~/packages/lib/keyboard';
import u from '~/packages/lib/umbrella-ex';
import Editor from '~/packages/core/editor';
import { U } from 'umbrellajs';
import { Event } from '~/packages/lib/event';

const pluginKey = new PluginKey('widget-helper');

export default class WidgetHelper {
  key = pluginKey;
  editor: Editor;
  props: Record<string, any> = this.getProps();
  dragging: boolean = false;
  startDragPos: {x: number, y: number} = {x: 0, y:0};
  lastPos: number = 0;
  dragStart: any = null;
  $ghost: U | null = null;
  $indicator: U | null = null;
  $draghandler: U | null = null;
  mouseMoveTimeout: number = 0;
  boundDrag: boolean = false;
  pmPlugin: Plugin | null = null;
  lastMarker: any = null;
  lastMarkerId: string = '';

  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.on('selection-changed', this.handleSelectionChanged);
    this.editor.on('editable-changed', this.handleEditableChanged);
  }

  /**
   * ProseMirror의 Plugin 형태로 감싼다.
   */
  asProseMirrorPlugin() {
    if (!this.pmPlugin) {
      this.pmPlugin = new Plugin(this);
    }
    return this.pmPlugin;
  }

  getProps() {
    return {
      decorations: this.decorations,
      handleKeyDown: this.handleKeyDown,
    };
  }

  /**
   * 노드를 꾸밀 데코레이터 세트를 반환한다.
   * @param {EditorState} state
   * @return {DecorationSet}
   * @see http://prosemirror.net/docs/ref/#view.EditorProps.decorations
   */
  decorations = (state: EditorState) => {
    const stopEvent = () => true;
    // const marker = getSelectedWidgetMarker(state);
    let decorations: Decoration[] = [];

    // 위젯 노드 처리
    state.doc.forEach((node, offset, index) => {
      if (node.type.name === 'widget_marker') {
        const dom: any = this.renderWidget(node);

        if (dom) {
          dom.setAttribute('data-id', node.attrs.id);
          dom.classList.add('widget');
          dom.addEventListener('touchstart', this.handleTouchStartWidget, {
            passive: true,
          });
          dom.addEventListener('touchend', this.handleTouchEndWidget);
          dom.addEventListener('mouseenter', this.handleMouseEnterWidget);
          dom.addEventListener('mouseleave', this.handleMouseLeaveWidget);
          decorations.push(Decoration.widget(offset, dom, { stopEvent }));
        }
      }
    });

    decorations = decorations.filter((deco) => deco instanceof Decoration);

    return DecorationSet.create(state.doc, decorations);
  };

  /**
   * 위젯을 그린다.
   */
  renderWidget(node: any) {
    return this.editor.pluginHub?.plugins.reduce((rendered, plugin) => {
      if (rendered) return rendered;
      // @ts-ignore
      return plugin.renderWidget?.(node);
    }, null);
  }

  view = (view: EditorView) => {
    this.handleViewInit(view);
    return {
      destroy: this.handleViewDestroy.bind(this),
    };
  };

  handleViewInit(view: EditorView) {
    this.lastMarker = null;

    if (this.editor.getEditable()) {
      this.bindDrag(view);
    }
  }

  handleViewDestroy() {
    this.lastMarker = null;

    this.cancelDrag();
  }

  /**
   * 드래그 기능 바인딩.
   * @param {EditorView} view
   */
  bindDrag(view: EditorView | null) {
    if (this.boundDrag || !view) {
      return;
    }

    this.boundDrag = true;
    this.$indicator = u('<div class="widget-drop-indicator hidden"></div>');
    // @ts-ignore
    view.dom.insertAdjacentElement('afterend', this.$indicator.first());

    this.$draghandler = u('<div class="drag-handler icon-drag"></div>');
    this.$draghandler.on('mousedown', this.handleMouseDown);
    // this.$draghandler.ondragstart = this.handleDragStart; // TODO ????

    window.addEventListener('mouseup', this.handleGlobalMouseUp);
  }

  /**
   * 드래그 기능 off
   */
  cancelDrag() {
    this.endDrag();

    this.boundDrag = false;
    this.$draghandler?.remove();
    this.$draghandler = null;
    this.$indicator?.remove();
    this.$indicator = null;

    window.removeEventListener('mouseup', this.handleGlobalMouseUp);
  }

  /**
   * 드래그 마무리 작업들 처리
   */
  endDrag() {
    clearTimeout(this.mouseMoveTimeout);
    window.removeEventListener('mousemove', this.handleGlobalMouseMove);

    this.dragging = false;
    this.$ghost?.remove();
    this.$ghost = null;
    this.$indicator?.addClass('hidden');
    this.dragStart?.$target?.removeClass?.('dragging');
  }

  handleEditableChanged = (e: Event) => {
    const editable = e.data;

    if (editable) {
      this.bindDrag(this.editor.view);
    } else {
      this.cancelDrag();
    }
  };

  /**
   * @param {EditorView} view
   * @param {dom.KeyboardEvent} event
   */
  handleKeyDown = (view: EditorView, event: KeyboardEvent) => {
    // 위젯을 선택한 후 엔터쳤을 때 아래에 문단을 만들어주는 처리
    const marker = getSelectedWidgetMarker(view.state);
    const keyName = generateKeyName(event);
    const before = keyName === 'ArrowUp' && view.state.doc.child(0) === marker;

    if (!marker || (keyName !== 'Enter' && !before)) return;

    const {
      doc,
      tr,
      selection: { from, to },
    } = view.state;
    const pos = insertPoint(doc, before ? from : to, schema.nodes.paragraph);

    if (pos !== null && pos !== undefined) {
      let newTr = tr.insert(pos, schema.nodes.paragraph.create());
      const $pos = newTr.doc.resolve(pos);
      const sel = before ? Selection.atStart(doc) : Selection.findFrom($pos, 1, true);
      if (sel) newTr = newTr.setSelection(sel).scrollIntoView();
      view.dispatch(newTr);
    }

    return true;
  };

  /**
   * @param {dom.MouseEvent} event
   */
  handleMouseDown = (event: MouseEvent) => {
    const $target = u(event.target as HTMLElement).closest('.ProseMirror-widget');

    // draggable 클래스가 있을 경우에만 드래그 허용(입력모드, 업로드중 등등 에서는 드래그 방지)
    if (!$target.is('.draggable')) {
      this.handleGlobalMouseUp();
      return;
    }

    this.$ghost = null;
    this.lastPos = 0;
    this.dragging = true;
    this.dragStart = {
      x: event.pageX,
      y: event.pageY,
      $target,
      // @ts-ignore
      parent: findScrollable($target.first())[0],
    };

    $target.addClass('dragging');
    window.addEventListener('mousemove', this.handleGlobalMouseMove);
  };

  handleGlobalMouseMove = (event: MouseEvent) => {
    if (!this.dragging) return;

    const { top, left } = this.dragStart.$target.size();
    const newX = event.pageX - this.dragStart.x;
    const newY = event.pageY - this.dragStart.y + top;
    const scrollParent = this.dragStart.parent;
    const scrollRect = scrollParent?.getBoundingClientRect();

    clearTimeout(this.mouseMoveTimeout);

    if (!this.$ghost) {
      this.$ghost = this.dragStart.$target.clone().addClass('ghost');
      // @ts-ignore
      this.editor.view?.dom.insertAdjacentElement('afterend', this.$ghost.first());
    }

    // @ts-ignore
    this.$ghost.css('top', `${newY}px`);

    // 자동 스크롤
    if (scrollParent) {
      const scTop = scrollParent.scrollTop;

      if (newY < scrollRect.top + 50) {
        scrollParent.scrollTop -= 30;
      }

      if (newY > scrollRect.top + scrollRect.height - 100) {
        scrollParent.scrollTop += 30;
      }

      const scDiff = scTop - scrollParent.scrollTop;
      if (scDiff) {
        this.dragStart.y += scDiff;
        this.mouseMoveTimeout = window.setTimeout(() => this.handleGlobalMouseMove(event), 100);
      }
    }

    if (this.editor.view && this.$indicator) {
      // 스크롤 아래의 노드는?
      const pos = this.editor.view.posAtCoords({ top: newY, left });
      if (pos) {
        const $pos = this.editor.view.state.doc.resolve(pos.pos);
        this.lastPos = $pos.start(1);
      }

      this.lastPos = clamp(this.lastPos, 1, this.editor.view.state.doc.nodeSize - 2);

      const coords = this.editor.view.coordsAtPos(this.lastPos);
      this.$indicator
        .removeClass('hidden')
        .css('top', `${coords.top - (scrollRect?.top || 0) - 5 + scrollParent.scrollTop}px`);
    }
  };

  handleGlobalMouseUp = () => {
    if (!this.dragging) return;

    this.endDrag();

    if (this.lastPos) {
      this.editor.moveWidget(this.dragStart.$target.data('id'), this.lastPos);
    }
  };

  handleMouseEnterWidget = (event: MouseEvent) => {
    if (!this.boundDrag || !event.target) {
      return;
    }

    // @ts-ignore
    event.target.appendChild(this.$draghandler.first());
  };

  handleMouseLeaveWidget = (event: MouseEvent) => {
    if (this.dragging) return;

    const $widget = u(event.target as HTMLElement);

    $widget.removeClass('dragging');
    this.$draghandler?.remove();
  };

  handleSelectionChanged = ({ data: { prevState, state } }: any) => {
    if (prevState.selection.eq(state.selection)) return;

    getSelectedWidgetElement(prevState)?.classList.remove('selected');
    getSelectedWidgetElement(state)?.classList.add('selected');
  };

  handleTouchStartWidget = (event: TouchEvent) => {
    const $target = u(event.target as HTMLElement).closest('.ProseMirror-widget,.ProseMirror');
    const $marker = $target.length && $target.next('.widget-marker');

    if (!$marker || !$marker.length) return;

    if (event.touches?.length) {
      this.startDragPos = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }

    this.lastMarkerId = $marker.attr('id');
  };

  handleTouchEndWidget = (event: TouchEvent) => {
    const $target = u(event.target as HTMLElement).closest('.ProseMirror-widget,.ProseMirror');
    const $marker = $target.length && $target.next('.widget-marker');

    if (!$marker || !$marker.length) return;

    if (event.changedTouches?.length) {
      // start, end 터치위치가 바뀌었으면 그냥 빠져나간다.
      const delta = {
        x: Math.abs(event.changedTouches[0].clientX - this.startDragPos.x),
        y: Math.abs(event.changedTouches[0].clientY - this.startDragPos.y),
      };

      if (delta.x > 5 || delta.y > 5) {
        return;
      }
    }

    if (this.lastMarkerId === $marker.attr('id')) {
      this.editor.emit('widget-touched', {
        id: this.lastMarkerId,
        type: $marker.data('type'),
        args: JSON.parse($marker.data('args') || 'null'),
      });
    }
  };

  /**
   * 위젯 삭제 여부를 반환한다.
   * @param {Transaction} tr
   * @return {boolean} true면 삭제
   */
  handleWidgetDelete(tr: Transaction) {
    const nodes = findNodesToRemove(tr);
    const marker = nodes.find(({ type }) => type.name === 'widget_marker');

    // 위젯 노드가 없으면 처리하지 않음(undefined 반환)
    if (!marker) return;

    // 위젯 외에 다른 게 섞여있으면 삭제하지 않는다.
    if (nodes.length > 1) return false;

    // 위젯 삭제 이벤트를 통해 삭제 여부 질의
    const willDelete: boolean | undefined = this.editor.filter('widget-should-delete', true, marker);
    if (willDelete) {
      // 삭제된 위젯은 복구되면 안되니까 위젯 삭제 내역은
      // Undo 히스토리에 남기지 않아야 한다.
      tr.setMeta('addToHistory', false);
      this.editor.emit('widget-will-delete', nodes[0].attrs);
    }

    return willDelete;
  }

  /**
   * @param {Transaction} tr 에디터 트랜잭션
   * @see http://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction
   */
  filterTransaction = (tr: Transaction, state: EditorState) => {
    // 위젯 삭제 처리
    if (!tr.docChanged || tr.getMeta('addToHistory') === false) return true;

    const willDelete = this.handleWidgetDelete(tr);
    if (typeof willDelete === 'boolean') {
      tr.setMeta('@handled', true);
      // 삭제 여부가 결정났으면 다른 플러그인의 filterTransaction은 처리하지 않는다.
      return willDelete;
    }

    return true;
  };
}
