
import { get } from 'lodash';

type TranslateArg = {
  [key: string]: unknown;
  count?: number;
};

type TranslationList = {
  [locale: string]: Record<string, Record<string, string>>;
};

type PluarlIndexer = (count: number) => number;

/**
 * 다국어 지원을 위한 문자열 번역 함수.
 *
 * 사용법
 * 1. 단순한 문자열 번역
 *   translate('String to locailize');
 * 2. 변수를 사용하는 문자열 - 변수 이름을 {{var}} 처럼 작성하고 인수에 변수값을 설정한다. 변수 이름에는 영문자, 숫자, _만 가능.
 *   translate('Hello, {{name}}', { name: 'world' });
 * 3. 단수, 복수 구분해서 사용해야 할 경우 - 템플릿 문자열을 배열로 작성하고 첫 번째 요소에 단수, 두 번째 요소로 복수형 문자열을 전달한다.
 *   translate(['apple.', '{{count}} apples.'], { count: 3 } );
 *   단수, 복수는 *항상* count 변수를 기준으로 구분한다.
 * 4. 단수, 복수가 여러 단계로 나뉘는 언어의 경우 - 언어를 변경할 때 setPluralIndexer를 사용해 복수형 판단 함수도 함께 수정한다.
 *
 * @param {String} code 번역할 템플릿 문자열의 코드
 * @param {Object} args (optional) 전달할 인수
 * @return {String} 번역된 문자열
 */
export function translate(code: string, args: TranslateArg = {}): string {
  const template = get(langs, code, '');
  const index = typeof args.count === 'number' ? pluralIndexer(args.count) : 0;
  let tmpl = Array.isArray(template) ? template[index] : template;

  return tmpl.replace(/\$\{(\w+)\}/g, (_: string, name: string) => args[name] || '');
}

let pluralIndexer: PluarlIndexer = (count) => {
  return count === 1 ? 0 : 1;
};

export function setPluralIndexer(fn: PluarlIndexer) {
  pluralIndexer = fn;
}

let langs: TranslationList = {};
let langType: string = '';

export function setLangs(localeLangs: TranslationList) {
  langs = localeLangs;
}

export function getLangs(): TranslationList {
  return langs;
}

export function getLangType() {
  return langType;
}

export function setLangType(_langType: string) {
  langType = _langType;
}
