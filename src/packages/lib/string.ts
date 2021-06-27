import { escapeRegExp } from 'lodash';

/**
 * 문자열을 검색하는 정규표현식을 반환한다.
 * @param {string} query 검색 문자열
 * @param {string} [modifiers] 정규표현식 플래그
 */
export function createQueryPattern(query: string, modifiers?: string) {
  const parts = query.split('').map((ch) => {
    return escapeRegExp(ch);
  });

  return new RegExp(`${parts.join('\\s*')}`, modifiers);
}
