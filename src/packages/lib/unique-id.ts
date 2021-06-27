function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * 네임스페이스 별로 고유한 아이디를 만들 수 있도록 고유 아이디 생성 함수를 반환한다.
 * @param {String} namespace 네임스페이스
 * @param {Boolean} shouldUniqueInDOM 이 값이 true면 DOM 엘리먼트의 아이디로서도 무결한지 확인한다.
 */
export function uniqueId(prefix = '', shouldUniqueInDOM: boolean = false) {
  const idStore: string[] = [];

  return function () {
    let index = +(random(10000, 99999) + '' + new Date().getMilliseconds());
    let id: string, exist: boolean;

    do {
      id = prefix + index++;
      exist = false;

      if (shouldUniqueInDOM) {
        exist =
          (typeof document !== 'undefined' &&
            Boolean(document.querySelector(`#${id}`))) ||
          idStore.indexOf(id) !== -1;

        if (!exist) {
          idStore.push(id);
        }
      }
    } while (exist);

    return id;
  };
}

export const uniqueWidgetId = uniqueId('widget-', true);
export const uniqueNodeId = uniqueId('nd-', true);
