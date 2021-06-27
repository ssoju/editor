export function contains(ancestor: Node, descendant: Node) {
  let node: Node | null = descendant;
  do {
    if (node.parentNode === ancestor) {
      return true;
    }
    node = node.parentNode;
  } while (node?.parentNode);

  return false;
}

type matcherType = string | ((element: Element) => boolean);

export function closest(element: Element, matcher: matcherType, until: Node | null = null) {
  if (typeof matcher === 'string') {
    const selector = matcher;
    matcher = (element) => element?.matches?.(selector);
  }

  let el: typeof element | null = element;
  do {
    if (matcher(el)) return el;
    if (until === el) break;
  } while ((el = el.parentNode as Element | null));

  return null;
}

/**
 * 스크롤 가능한 영역을 모두 찾아낸다.
 * @param {Element} element
 * @return {Element[]}
 */
export function findScrollable(element: Element): Element[] {
  const result: Element[] = [];

  do {
    const style = getComputedStyle(element);

    if (element.tagName === 'BODY') break;
    if (style.getPropertyValue('position') === 'static') continue;

    const overflows = [
      style.getPropertyValue('overflow'),
      style.getPropertyValue('overflow-x'),
      style.getPropertyValue('overflow-y'),
    ].join(':');

    if (/auto|scroll/.test(overflows)) {
      result.push(element);
    }
  } while ((element = element.parentNode as Element));

  return result;
}

/**
 * 주어진 선택자를 사용해 한 개의 DOM Element를 작성한다.
 * 선택자는 반드시 태그 이름으로 시작해야 하지만, 텍스트 노드는 `#text:텍스트 컨텐츠`와 같은 형식으로 작성할 수 있다.
 * 선택자를 생략하면 DocumentFragment각 만들어진다.
 * @param {String?} selector DOM 엘리먼트를 의미하는 선택자.
 * @return {Element|TextNode|DocumentFragment}
 */
export function createElement(selector: string): Element | Text | DocumentFragment | null {
  // Fragment?
  if (selector === undefined) {
    return document.createDocumentFragment();
  }

  // Has children?
  const rules = selector.split(/\s*>\s*/g).reverse();
  let el: Node | Text | null = null;

  rules.forEach((rule) => {
    // TextNode?
    if (/^#text/.test(rule)) {
      return (el = document.createTextNode(rule.substr(5)));
    }

    const match = /^[a-zA-Z]+[1-9]?/.exec(rule);
    if (!match) {
      throw new Error(`Invalid tag name: ${rule}`);
    }

    const dom = document.createElement(match[0]);
    rule.substr(match[0].length).replace(
      /\[([\w-]+)(=.+?)?\]|#([\w-]+)|\.([\w-]+)/g,
      (_: string, attr: string, value: string, id: string, cls: string) => {
        if (id) {
          dom.id = id;
          return '';
        }
        if (cls) {
          dom.classList.add(cls);
          return '';
        }
        if (attr) {
          value = value ? value.substr(1).replace(/^"|"$|^'|'$/g, '') : '';
          dom.setAttribute(attr, value);
          return '';
        }
        return '';
      }
    );

    if (el) {
      dom.appendChild(el);
    }

    return (el = dom);
  });

  return el;
}

/**
 * 해당 url로 접근했을 때 실제이미지 존재여부 체크
 * @param {string} url 이미지의 URL
 * @param {boolean} [isRetry] 이미지 로드를 10번까지 시도 할 것인가..
 * 기본은 시도하는 것으로 함.(파일이 cdn까지 퍼지는 시간이 걸리므로..)
 * @returns {Promise<IMG>}
 */
export function checkImage(url: string, { isRetry }: any) {
  return new Promise((resolve, reject) => {
    let retry = 0;
    const tryLoad = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (retry >= 20 || isRetry === false) {
          return reject();
        }

        // 0.5초 후에 다시 로드 시도
        setTimeout(() => {
          tryLoad();
        }, 2000);
      };
      img.src = url;
      img.complete && resolve(img);
      retry += 1;
    };

    tryLoad();
  });
}

export const $ = createElement;
