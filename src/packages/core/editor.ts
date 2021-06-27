import { EditorView } from 'prosemirror-view';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { DOMSerializer, Slice, DOMParser, AttributeSpec } from 'prosemirror-model';
import { collab } from 'prosemirror-collab';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { columnResizing, tableEditing } from 'prosemirror-tables';
import { history } from 'prosemirror-history';
import { clamp, find, get, isEqual, omit } from 'lodash';
import debugFactory from 'debug';

import { Event, EventEmitter } from '~/packages/lib/event';
import { DocumentOptions } from '~/packages/api/document';
import PluginHub from './plugin-hub';
import WidgetHelper from './widget-helper';
import OverlayHub from './overlay-hub';
import MenubarHub from './menubar-hub';
import api from '~/packages/api';
import ClipboardSerializer from './clipboard-serializer';
import { applyJSONSteps, giveIdToBlockNodes } from '~/packages/core/transform';
import schema from './schema';
import { uniqueWidgetId } from '~/packages/lib/unique-id';

const debug = debugFactory('editor:core');

debug('version %s', process.env.VERSION);

export type EditorOptions = {
  authKey?: string;
  clientID?: string;
  containerNode?: HTMLDivElement;
  contentNode?: HTMLDivElement;
  documentID?: number;
  user?: Record<string, any>;
  socket?: Record<string, any>;
};

export default class Editor extends EventEmitter {
  view: EditorView | null = null;
  options: EditorOptions = {};
  creating: boolean = false;
  editable: boolean = true;
  inputRules: InputRule[] = [];
  clipboardSerializer: ClipboardSerializer = new ClipboardSerializer(this);
  pluginHub: PluginHub = new PluginHub(this);
  widgetHelper: WidgetHelper = new WidgetHelper(this);
  overlayHub: OverlayHub = new OverlayHub(this);
  menubarHub: MenubarHub = new MenubarHub(this);
  container?: Element;

  constructor(options: EditorOptions = {}) {
    super();
  }

  async configure(options: EditorOptions) {
    if (isEqual(this.options, options)) return;

    const renew = !this.view || this.shouldRenew(this.options, options);

    this.options = Object.freeze(options);

    if (renew) {
      this.view?.destroy();
      if (!this.creating) {
        this.creating = true;
        await this.createEditor(options);
        this.creating = false;
      }
    }
  }

  /**
   * 에디터 뷰의 갱신 여부를 판단한다.
   * @param {EditorOptions} prev 예전 옵션
   * @param {EditorOptions} current 지금 적용할 옵션
   * @return {boolean} true면 에디터 전체를 다시 그리고, false면 설정만 업데이트한다.
   */
  shouldRenew(prev: EditorOptions, current: EditorOptions) {
    // 이전 옵션이 없었으면 무조건 리뉴
    if (!prev) return true;

    // 동시편집 관련
    if (
      prev.authKey !== current.authKey ||
      prev.clientID !== current.clientID ||
      prev.containerNode !== current.containerNode ||
      prev.documentID !== current.documentID
    ) {
      return true;
    }

    return false;
  }

  async createEditor(options: EditorOptions) {
    const { containerNode, clientID } = options;
    if (!containerNode) return;

    let state;
    try {
      const { version, doc } = await this.createDocument(options);
      state = EditorState.create({
        doc,
        plugins: [
          this.widgetHelper.asProseMirrorPlugin(),
          this.pluginHub.asProseMirrorPlugin(),
          this.overlayHub.asProseMirrorPlugin(),
          this.menubarHub.asProseMirrorPlugin(),
          // ...keymaps,
          collab({ version, clientID }),
          inputRules({ rules: this.inputRules }),
          // @ts-ignore
          columnResizing(),
          history(),
          tableEditing({ allowTableNodeSelection: true }),
        ],
      });
    } catch (e) {
      throw e;
    }

    //  처음엔 편집 가능한 상태로 만든다.
    this.setEditable(true);

    try {
      this.view = new EditorView(containerNode, {
        state,
        nodeViews: this.pluginHub.getNodeViews(),
        clipboardSerializer: this.clipboardSerializer,
        dispatchTransaction: this.dispatchTransaction,
        editable: this.getEditable,
      });
      this.emit('editor-init', this);
    } catch (e) {
      debug('Failed to create an EditorView: %o', e);
    }

    // decoration을 반영하기 위해 강제 리프레시
    this.forceUpdate();
  }

  async createDocument({
   authKey,
   clientID,
   contentNode,
   documentID,
   user,
   socket,
 }: EditorOptions): Promise<{ version: number, doc: any }> {
    if (user && clientID && documentID && documentID > 0) {
      const document = api.document.connect(clientID, documentID, {
        authKey,
        displayName: user.userName,
        ...socket,
      } as DocumentOptions);
      const { content, version, users, steps } = await document.get();
      const doc = applyJSONSteps(content, steps);

      return { version, doc };
    }

    if (contentNode) {
      const parser = DOMParser.fromSchema(schema);
      return { version: -1, doc: parser.parse(contentNode) };
    }

    throw new Error('문서를 만들 수 없습니다');
  }

  dispatchTransaction = (tr: Transaction) => {
    if (!this.view) return;

    const prevState = this.view.state;
    let state = this.filter(
      'dispatch-transaction',
      prevState,
      (tr = giveIdToBlockNodes(tr.setMeta('@handled', false)))
    );

    if (prevState === state && !tr.getMeta('@handled')) {
      state = prevState.apply(tr);
    }

    this.view.updateState(state);
    this.emit('update-state', state);

    if (tr.docChanged) {
      this.emit('document-changed', { prevState, state });
    }

    // tr.docChanged에 상관없이 selection-changed이벤트가 발생하는게 맞지 않나싶어서 이처럼 수정함.
    if (!prevState.selection.eq(state.selection)) {
      this.emit('selection-changed', { prevState, state });
    }
  };


  setEditable(editable: boolean) {
    if (this.editable === editable) {
      return;
    }

    this.editable = editable;
  }

  getEditable() {
    return this.editable;
  }


  hasFocus() {
    return this.view?.hasFocus() || false;
  }

  focus() {
    try {
      this.view?.focus();
    } catch (e) {}
  }


  /**
   * 전달된 설정을 반환한다. path에 가져오고 싶은 설정의 위치를 전달하면 해당 설정만 반환한다.
   *
   * 예)
   *   const message = this.editor.getOptions
   *
   * @param {String} path 가져오고 싶은 설정의 위치(예. 'placeholder.message')
   * @param {any} defaultValue 기본값
   * @return {any}
   */
  getOptions(path: string, defaultValue: any) {
    return path ? get(this.options, path, defaultValue) : this.options;
  }

  /**
   * 현재 선택된 영역의 시작 위치와 끝 위치 및 커서 여부를 반환한다.
   * @return {{from: number, to: number, isCursor: boolean}}
   */
  getSelection() {
    const sel = this.view?.state.selection;
    if (sel) {
      return {
        from: sel.from,
        to: sel.to,
        // @ts-ignore
        isCursor: !!sel.$cursor,
      };
    }
    return null;
  }

  /**
   * 전달한 DOM 노드의 시작과 끝 위치를 반환한다. 노드가 존재하지 않으면 null을 반환한다.
   */
  getRangeOfDOMNode(dom: Element) {
    const coords = dom?.getBoundingClientRect();
    const pos = coords && this.view?.posAtCoords(coords);

    if (!pos) return null;

    const $pos = this.view?.state.doc.resolve(pos.pos);
    if (!$pos) return null;

    return { from: pos.pos, to: pos.pos + $pos.node().nodeSize };
  }

  /**
   * 해당 위치에 있는 DOM Node를 반환한다.
   * @param {int} pos
   * @return {{node: dom.Node, offset: number}}
   */
  getDOMNodeAtPos(pos: number) {
    return this.view?.domAtPos(pos);
  }

  /**
   * 전달한 아이디로 찾은 DOM 노드의 시작과 끝 위치를 반환한다.
   * @param {String} id 찾고자 하는 DOM Node의 아이디
   */
  getRangeOfDOMNodeById(id: string) {
    const node = this.container?.querySelector(`#${id}`);

    return node ? this.getRangeOfDOMNode(node) : null;
  }

  /**
   * 특정 문자열이 입력되었을 때 반응하는 입력 규칙을 정한다.
   * @param {InputRule} inputRule
   * @see http://prosemirror.net/docs/ref/#inputrules.InputRule
   */
  registerInputRule(inputRule: InputRule) {
    this.inputRules.push(inputRule);
  }

  /**
   * 등록한 입력 규칙을 제거한다.
   * @param {InputRule} inputRule
   */
  unregisterInputRule(inputRule: InputRule) {
    const index = this.inputRules.indexOf(inputRule);
    if (index !== -1) {
      this.inputRules.splice(index, 1);
    }
  }

  /**
   * 단축키를 등록한다. 키 이름을 스페이스로 구분하여 여러 개를 한꺼번에 입력할 수도 있다.
   * @param {String} keyName 단축키 시퀀스(ex. Alt-Shift-C).
   * @param {Function} callback 단축키가 입력됐을 때 실행할 콜백 함수
   * @param {int} priority 우선 순위. 숫자가 작을 수록 먼저 실행된다.
   */
  registerHotkey(keyName: string, callback: any, priority = 10) {
    keyName.split(/[ ]+/g).forEach((key) => {
      this.pluginHub.registerHotkey(key, callback, priority);
    });
  }

  /**
   * 전역 명령어를 등록한다. 이미 등록된 명령어를 다시 등록하려고 하면 에러가 발생한다.
   * @param {String} name 명령어 이름
   * @param {Function} callback 실행할 콜백 함수
   */
  registerAction(name: string, callback: any) {
    this.pluginHub.actions.register(name, callback);
  }

  /**
   * 전역 명령어를 등록 해제한다.
   * @param {String} name 명령어 이름
   * @param {Function} callback 실행할 콜백 함수
   */
  unregisterAction(name: string, callback: any) {
    this.pluginHub.actions.unregister(name, callback);
  }

  exec(name: string, ...args: any[]) {
    return this.pluginHub.actions.exec(name, ...args);
  }

  /**
   * 명령어의 동작을 수정할 필터를 등록한다.
   * 명령어 이름을 필터로 등록하면 명령어의 반환값을 수정할 수 있다.
   * @param {String} name 등록할 필터의 이름.
   * @param {Function} callback 단축키가 입력됐을 때 실행할 콜백 함수
   * @param {int} priority 우선 순위. 숫자가 작을 수록 먼저 실행된다.
   */
  registerFilter(name: string, callback: any, priority = 10) {
    this.pluginHub.filters.register(name, callback, priority);
  }

  /**
   * 등록한 필터를 제거한다.
   * @param {String} name 등록할 필터의 이름.
   * @param {Function} callback 단축키가 입력됐을 때 실행할 콜백 함수
   */
  unregisterFilter(name: string, callback: any) {
    this.pluginHub.filters.unregister(name, callback);
  }

  filter(name: string, value: any, ...args: any[]): any {
    return this.pluginHub.filters.execReturn(name, value, ...args);
  }

  /**
   * 사용할 오버레이를 등록한다.
   * @param {String} name
   * @param {Element} overlay
   */
  registerOverlay = (name: string, overlay: HTMLElement) => {
    this.overlayHub.registerOverlay(name, overlay);
  };

  /**
   * 오버레이를 등록 해제한다.
   * @param {String} name
   */
  unregisterOverlay = (name: string) => {
    this.overlayHub.unregisterOverlay(name);
  };

  /**
   * 오버레이를 화면에 표시한다.
   * @param {String} name
   * @param {int} pos 위치. 에디터 상의 위치를 입력한다.
   * @param {String} position 오버레이를 보여줄 위치. 'top' 또는 'bottom'
   */
  showOverlay = (name: string, pos: number, position: 'top' | 'bottom') => {
    this.overlayHub.showOverlay(name, pos, position);
  };

  /**
   * 오버레이를 화면에 표시하지 않는다.
   * @param {String} name
   */
  hideOverlay = (name: string) => {
    this.overlayHub.hideOverlay(name);
  };

  /**
   * 현재 표시된 오버레이인지 확인한다.
   * @param {String} name
   * @return {boolean} 표시되고 있으면 true, 아니면 false
   */
  isVisibleOverlay = (name: string) => {
    return this.overlayHub.isVisibleOverlay(name);
  };

  /**
   * 메뉴 아이템을 클릭했을 때 실행할 메소드를 등록한다. 스페이스로 구분하여 여러 포맷을 한꺼번에 등록할 수 있다.
   * @param {String} name 등록한 메뉴 아이템의 이름
   * @param {Function} callback 콜백 함수
   */
  registerFormat = (name: string, callback: any, ...args: any[]) => {
    name.split(/[ ]+/g).forEach((format) => {
      this.on('format', (event: Event) => {
        if (event.data !== format) return;
        callback(this.view?.state, this.view?.dispatch, event, ...args);
      });
    });
  };

  /**
   * 주어진 위치에 위젯을 추가한다.
   * @param {String} type 위젯 타입
   * @param {Object} args 위젯의 속성
   * @param {Object} options 위젯 추가와 관련한 속성
   *   - {int} author (optional) 위젯을 작성한 사용자의 고유 번호. 기본값은 현재 사용자의 번호.
   *   - {int} createdAt (optional) 위젯이 작성된 시간. 기본값은 현재 시각.
   *   - {int} from (optional) 위젯을 삽입할 시작 위치. 기본값은 -1. 문서 가장 마지막에 삽입한다.
   *   - {int} to (optional) 위젯을 삽입할 끝 위치
   *   - {bool} select (optional) 작성한 위젯을 선택할 것인지 여부. 기본값 false.
   * @return {String|null} 추가한 위젯의 아이디. 추가 도중 문제가 발생하면 null 반환
   */
  createWidget(type: string, args: Record<string, any> = {}, options: Record<string, any> = {}) {
    if (!this.view) return;

    const {
      state: { tr, doc },
      dispatch,
    } = this.view;
    const id = args.id || uniqueWidgetId();
    const currentUserNo = this.getOptions('user.userNo', '');
    let { author = null, createdAt = null, from = -1, to = null } = options;
    let $from = doc.resolve((from = from < 0 ? doc.nodeSize - 1 + from : from));
    let $to = doc.resolve(to === null ? from : to);
    let marker;

    author = author || currentUserNo;
    createdAt = createdAt || Date.now();

    // 같은 아이디가 이미 존재하면 위젯을 추가하지 않음
    if (args.id && this.getWidgetMarker(args.id)) {
      console.error(`Widget ID '${args.id}' already exists.`);
      return null;
    }

    delete args.id;

    args = this.filter('widget-args', { ...args }, type);
    marker = schema.node('widget_marker', { id, type, author, createdAt, args });
    marker = this.filter('widget-marker', marker);

    // 선택 영역이 처음에 걸려있는 경우, 영역을 노드 시작으로 확장하여 블럭이 새로 만들어지는 걸 방지
    while ($from.depth > 0) {
      if ($from.pos > $from.start()) break;
      $from = doc.resolve($from.before());
    }

    // 선택 영역이 끝에 걸려있는 경우, 영역을 노드 끝으로 확장하여 블럭이 새로 만들어지는 걸 방지
    while ($to.depth > 0) {
      if ($to.pos < $to.end()) break;
      $to = doc.resolve($to.after());
    }

    debug('createWidget, id: %s, marker: %o', id, marker);

    dispatch(
      tr
        .replaceWith($from.pos, $to.pos, marker)
        .setMeta('addToHistory', false)
        .setMeta('skipPermCheck', true)
    );

    // 문서에 삽입된 마커의 정보
    if (options.select) {
      this.selectWidget(id);
    }

    this.emit('create-widget', marker);

    return id;
  }

  /**
   * 위젯 선택 메소드
   * @param id
   */
  selectWidget(id: string) {
    if (!this.view) return;

    const { dispatch } = this.view;
    const theMarker = this.getWidgetMarker(id);

    if (theMarker) {
      this.view.focus();

      const $pos = this.view.state.doc.resolve(theMarker.after);
      const selection = Selection.findFrom($pos, -1, false);

      if (selection) {
        dispatch(
          this.view.state.tr
            .setSelection(selection)
            .scrollIntoView()
        );
      }
    }
  }

  /**
   * 문서 내에 있는 모든 위젯 마커를 찾아서 반환한다.
   * @return {{node:Node, before:Number, after:Number}[]} 노드의 정보
   */
  getWidgetMarkerAll() {
    const markers: any[] = [];

    this.view?.state.doc.forEach((node, offset, index) => {
      if (node.type.name === 'widget_marker') {
        markers.push({ node, before: offset, after: offset + node.nodeSize });
      }
    });

    return markers;
  }

  /**
   * 위젯 마커 노드와 마커의 앞, 뒤 위치를 반환한다.
   * @param {String} id 마커의 아이디
   * @return {?{node:Node, before:Number, after:Number}} 노드의 정보
   */
  getWidgetMarker(id: string) {
    return find(this.getWidgetMarkerAll(), ({ node: { attrs } }) => attrs.id === id);
  }

  /**
   * 위젯을 삭제한다.
   * @param {String} id 위젯의 아이디
   */
  deleteWidget = (id: string) => {
    if (!this.view) return;

    const marker = this.getWidgetMarker(id);
    if (!marker) return;

    debug('deleteWidget, id: %s, marker: %o', id, marker);

    const tr = this.view.state.tr
      .delete(marker.before, marker.after)
      .setMeta('addToHistory', false);

    this.emit('widget-will-delete', marker.node.attrs);
    this.view.dispatch(tr);
  };

  /**
   * 전달한 아이디의 위젯을 업데이트한다. 기존값에 전달된 값을 추가한다.
   * @param {String} id 위젯의 아이디
   * @param {Object} attrs 위젯의 속성
   * @param {boolean} overwriteArg (optional) 이 값이 true면 기존 args 값 대신 현재 전달된 값만 사용한다.
   */
  updateWidget = (id: string, attrs: AttributeSpec & { args: Record<string, any>}, overwriteArgs = false) => {
    if (!this.view) return;

    const marker = this.getWidgetMarker(id);
    if (!marker) return;

    const { before, node } = marker;
    const {
      state: { tr },
      dispatch,
    } = this.view;

    attrs = { ...omit(node.attrs, 'args'), ...attrs };
    if (overwriteArgs) {
      attrs.args = { ...node.attrs.args, ...attrs.args };
    }

    debug('updateWidget, id: %s, attrs: %o, pos: %d', id, attrs, before);

    dispatch(tr.setNodeMarkup(before, undefined, attrs).setMeta('addToHistory', false));
  };

  /**
   * 전달한 아이디의 위젯을 설정한 위치로 이동한다.
   * @param {String} id 위젯의 아이디
   * @param {integer} newPos 새 위치
   * @param {boolean} [selectWidget] 선택 영역을 옮긴 위젯으로 설정한다.
   */
  moveWidget = (id: string, newPos: number, selectWidget = true) => {
    if (!this.view) return;

    const {
      state: { doc },
      dispatch,
    } = this.view;
    const marker = this.getWidgetMarker(id);
    if (!marker) return;

    const $pos = doc.resolve(newPos);
    const newMarker = schema.node('widget_marker', {
      ...marker.node.attrs,
      id: uniqueWidgetId(),
    });
    const pos = $pos.start(1);

    // 바로 앞 또는 뒤면 결국은 같은 위치이므로 스킵
    if ([marker.after, marker.after + 1, marker.before - 1].indexOf(pos) > -1) return;

    const insertPos = clamp(pos - 1, 1, doc.nodeSize - 2);
    let { tr } = this.view.state;
    if (insertPos < marker.before) {
      tr = tr
        .delete(marker.before, marker.after)
        .replaceWith(insertPos, insertPos, newMarker);
    } else {
      tr = tr
        .replaceWith(insertPos, insertPos, newMarker)
        .delete(marker.before, marker.after);
    }

    dispatch(tr.setMeta('addToHistory', false));

    if (selectWidget) {
      const marker = this.getWidgetMarker(newMarker.attrs.id);
      if (marker) {
        const { state } = this.view;
        const sel = Selection.findFrom(state.doc.resolve(marker.before), 1, false);
        sel && dispatch(state.tr.setSelection(sel));
      }
    }
  };

  /**
   * 뷰를 강제로 리프레시 한다.
   * 성능에 문제가 생길 수 있으므로 꼭 필요할 때만 쓰자.
   */
  forceUpdate() {
    const pm = this.options?.containerNode?.querySelector('.ProseMirror');
    const el = pm?.querySelector('p,h1,h2,h3,div');

    if (el) {
      el.setAttribute('_', 'dummy');
    } else {
      pm?.appendChild(document?.createElement('br'));
    }
  }

  /**
   * 소켓에 연결하지 않고 json 정보를 에디터에 설정하여 내용을 출력
   * @param json
   */
  setJSON(json: string | Record<string, any>) {
    if (!this.view) {
      return;
    }

    const node = applyJSONSteps(typeof json === 'string' ? JSON.parse(json) : json);
    const { state, dispatch } = this.view;
    const slice = new Slice(node.content, 0, 0);

    dispatch(state.tr.replace(0, state.doc.nodeSize - 2, slice));
  }

  /**
   * 텍스트를 조합 중인지 여부를 반환한다.
   * @return {bool}
   */
  isComposingText() {
    return this.pluginHub.isComposingText();
  }

  get state() {
    return this.view?.state;
  }

  get json() {
    return this.state?.toJSON();
  }

  get content() {
    return this.state?.doc.content;
  }

  get html() {
    if (!this.content) {
      return '';
    }

    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(this.content);
    const tmp = document.createElement('div');
    tmp.appendChild(fragment);
    return tmp.innerHTML;
  }

  get text() {
    if (!this.content) {
      return '';
    }

    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(this.content);
    const tmp = document.createElement('div');
    tmp.appendChild(fragment);
    return tmp.innerText;
  }

  destroy() {
    return this.view?.destroy();
  }
}
