type CallbackList = {
  [name: string]: {
    [priority: number]: Function[];
  };
};

type CallbackIndex = [name: string, priority: number, index: number];

/**
 * 콜백 함수 목록을 관리하는 클래스.
 * 이름과 우선 순위를 줄 수 있어 실행 순서를 제어할 수 있다.
 */
export default class CallbackManager {
  callbacks: CallbackList = {};
  callbackMap = new WeakMap<Function, CallbackIndex>();

  /**
   * 콜백 함수를 등록한다.
   * @param {String} name 콜백 함수 이름
   * @param {Function} callback 실행할 콜백 함수
   */
  register(name: string, callback: Function, priority = 10) {
    if (!this.callbacks[name]) {
      this.callbacks[name] = [];
    }

    if (!this.callbacks[name][priority]) {
      this.callbacks[name][priority] = [];
    }

    // 이미 등록되었다면 에러를 내보낸다.
    if (this.callbackMap.has(callback)) {
      throw new Error('이미 등록된 콜백 함수입니다.');
    }

    const group = this.callbacks[name][priority];

    this.callbackMap.set(callback, [name, priority, group.length]);
    group.push(callback);
  }

  /**
   * 등록한 콜백 함수를 제거한다.
   * @param {String} name 콜백 함수 이름
   * @param {Function} callback 콜백 함수
   */
  unregister(name: string, callback: Function) {
    const path = this.callbackMap.get(callback);

    if (!path || name !== path[0]) return;

    const [_, priority, index] = path;
    const group = this.callbacks?.[name]?.[priority];

    if (group?.[index] === callback) {
      this.callbackMap.delete(callback);
      delete group[index];
    }
  }

  /**
   * 주어진 이름으로 등록된 콜백 함수를 실행한다.
   * @param {String} name 콜백 함수 그룹의 이름
   * @param  {...any} args 인수
   */
  exec(name: string, ...args: unknown[]) {
    let ret: unknown;
    this.iterate(name, (cb: Function) => (ret = cb(...args)));
    return ret;
  }

  /**
   * exec와 같지만 값을 반환한다.
   * @param {String} name 콜백 함수 그룹의 이름
   * @param {any} ret 반환할 값의 기본값
   * @param {...any} args 인수
   */
  execReturn(name: string, ret: unknown, ...args: unknown[]) {
    this.iterate(name, (cb: Function) => {
      let r = cb(ret, ...args);
      if (r !== undefined) ret = r;
    });
    return ret;
  }

  /**
   * 그룹에 속한 콜백 함수를 훑으며 실행한다.
   * @param {String} name 콜백 함수 그룹의 이름
   * @param {Function} iterator
   */
  iterate(name: string, iterator: (cb: Function) => void) {
    if (!this.callbacks[name]) return;
    for (const group of Object.values(this.callbacks[name])) {
      group.filter(Boolean).forEach(iterator);
    }
  }

  /**
   * 등록된 콜백 함수의 이름 목록을 반환한다.
   * @return {string[]} 이름 문자열의 배열
   */
  getNames(): string[] {
    return Object.keys(this.callbacks);
  }
}
