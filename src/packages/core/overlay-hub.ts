import Editor from '~/packages/core/editor';
import { Plugin } from 'prosemirror-state';
import { closest, findScrollable } from '~/packages/lib/dom-utils';
import { EditorView } from 'prosemirror-view';
import u, { U } from 'umbrellajs';

export default class OverlayHub {
  editor: Editor;
  props: Record<string, any> = this.getProps();
  overlays: Map<string, any> = new Map();
  registerQueue: any[] = [];
  scrollable: Element[] = [];
  visibleOverlay: {
    name: string,
    dom: HTMLElement,
    pos: number| HTMLElement,
    position: 'top' | 'bottom',
  } | null = null;
  $container?: U;
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


  view = (view: EditorView) => {
    this.handleViewInit(view);

    return {
      update: this.updatePosition,
      destroy: this.handleViewDestroy,
    };
  };

  handleViewInit(view: EditorView) {
    this.$container = u('<div class="hornet-overlay-container">');
    document.body.appendChild(this.$container.nodes[0]);
    window.addEventListener('mousedown', this.handleWindowMouseDown, false);
    window.addEventListener('blur', this.handleWindowBlur, false);
    window.addEventListener('resize', this.updatePosition, false);

    this.overlays.forEach((overlay) => this.$container?.append(overlay));
    this.registerQueue.forEach((overlay) => this.$container?.append(overlay));
    this.registerQueue = [];

    // @ts-ignore
    this.scrollable = findScrollable(view.dom).concat([window]);
    this.scrollable.forEach((s) => s.addEventListener('scroll', this.updatePosition, false));
  }

  handleViewDestroy = () => {
    this.registerQueue = [];
    window.removeEventListener('mousedown', this.handleWindowMouseDown);
    window.removeEventListener('resize', this.updatePosition);
    this.$container?.remove();
    this.scrollable.forEach((s) => s.removeEventListener('scroll', this.updatePosition));
  };

  handleWindowMouseDown = ({ target }: MouseEvent) => {
    if (!this.editor.view || !target) return;

    const { dom: editorDOM } = this.editor.view;
    const inside = !!closest(target as Element, (elm) => elm === this.$container?.nodes[0]);

    if (!inside) {
      this.visibleOverlay && this.hideOverlay(this.visibleOverlay.name);
    }
  };

  handleWindowBlur = () => {
    // this.visibleOverlay && this.hideOverlay(this.visibleOverlay.name);
  };

  /**
   * @private
   */
  getProps() {
    return {};
  }

  getDimension(dom: Element) {
    const rect = dom.getBoundingClientRect();

    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
    };
  }

  /**
   * @private
   */
  updatePosition = () => {
    if (!this.visibleOverlay) return;

    requestAnimationFrame(() => {
      if (!this.visibleOverlay || !this.editor.view) return;

      const { dom, pos, position } = this.visibleOverlay;
      const rect = this.getClientRect(pos);
      if (!rect) return;

      const { left, top, bottom } = rect;
      const { width, height } = this.getDimension(dom);
      const vWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0,
      );

      dom.style.left = `${left + width > vWidth ? vWidth - width : left}px`;

      if (
        (position === 'top' && top - height < 0) ||
        (position === 'bottom' && bottom + height < vHeight)
      ) {
        dom.style.top = `${bottom}px`;
        dom.style.bottom = '';
      } else {
        dom.style.top = '';
        dom.style.bottom = `-${top}px`;
      }
    });
  };

  getClientRect(target: Element | number): { left: number, right: number, top: number, bottom: number } | undefined {
    if (target instanceof Element) {
      return target.getBoundingClientRect();
    }

    return this.editor.view?.coordsAtPos(target);
  }

  /**
   * 사용할 오버레이를 등록한다.
   * @param {String} name 오버레이의 이름
   * @param {HTMLElement} overlay
   */
  registerOverlay(name: string, overlay: HTMLElement) {
    this.overlays.set(name, overlay);
    if (this.$container) {
      // @ts-ignore
      this.$container.append(overlay);
    } else {
      this.registerQueue.push(overlay);
    }
    overlay.classList.add('overlay');
    overlay.style.display = 'none';
    overlay.style.position = 'absolute';
  }

  /**
   * 오버레이를 등록 해제한다.
   * @param {String} name
   */
  unregisterOverlay(name: string) {
    this.overlays.delete(name);
  }

  /**
   * 오버레이를 화면에 표시한다.
   * @param {String} name 오버레이의 이름
   * @param {int|HTMLElement} pos 위치. 에디터 상의 위치 혹은 기준이 될 HTMLElement를 입력한다.
   * @param {String} position 오버레이를 보여줄 위치. 'top' 또는 'bottom'
   */
  showOverlay(name: string, pos: number | HTMLElement, position: 'top' | 'bottom' = 'bottom') {
    const overlay: HTMLElement = this.overlays.get(name);
    if (!overlay) return;

    if (overlay.style.display === 'none') {
      overlay.style.display = '';
    }

    if (this.visibleOverlay && this.visibleOverlay.name !== name) {
      this.hideOverlay(this.visibleOverlay.name);
    }

    this.visibleOverlay = {
      name,
      dom: overlay,
      pos,
      position,
    };

    this.updatePosition();
  }

  /**
   * 오버레이를 화면에 표시하지 않는다.
   * @param {String} name
   */
  hideOverlay(name: string) {
    if (this.visibleOverlay?.name === name && this.visibleOverlay?.dom) {
      this.visibleOverlay.dom.style.display = 'none';
      this.visibleOverlay = null;
    }
  }

  /**
   * 현재 표시된 오버레이인지 확인한다.
   * @param {String} name
   * @return {boolean} 표시되고 있으면 true, 아니면 false
   */
  isVisibleOverlay(name: string) {
    return this.visibleOverlay?.name === name;
  }
}
