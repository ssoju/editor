import { keyName } from 'w3c-keyname';
import { isMac } from './env';

/**
 * 키보드 단축키 문자열(예. Shift-Alt-Space)을 정규화한다.
 *
 * @param {String} name 키보드 단축키 문자열
 */
export function normalizeKeyName(name: string): string {
  const parts = name.split(/-(?!$)/g);
  const key = parts.pop();
  const keyName = Object.keys(
    parts.reduce((result, part) => {
      const match = /^(?:(cmd|meta|m)|(a|alt)|(c|ctrl|control)|(s|shift)|(mod))$/i.exec(part);

      if (!match) throw new Error('알 수 없는 단축키 파트입니다: ' + part);
      if (match[1]) result['Meta'] = true;
      if (match[2]) result['Alt'] = true;
      if (match[3]) result['Ctrl'] = true;
      if (match[4]) result['Shift'] = true;
      if (match[5]) result[isMac ? 'Meta' : 'Ctrl'] = true;

      return result;
    }, {} as { [key: string]: boolean })
  );

  keyName.sort();
  if (key !== undefined) {
    keyName.push(key === 'Space' ? ' ' : key.length === 1 ? key.toLowerCase() : key);
  }

  return keyName.join('-');
}

/**
 * Shift, Alt 등 다른 메타키 입력이 없는 키 입력인지 확인한다.
 * @param {KeyboardEvent} event
 * @return {boolean}
 */
export function isPureKey(event: KeyboardEvent): boolean {
  return !event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey;
}

/**
 * 키보드 이벤트에서 단축키 문자열을 만들어낸다.
 * @param {KeyboardEvent} event
 */
export function generateKeyName(event: KeyboardEvent) {
  const key = keyName(event);
  const keys = [key];

  if (event.altKey && key !== 'Alt') keys.unshift('Alt');
  if (event.ctrlKey && key !== 'Ctrl') keys.unshift('Ctrl');
  if (event.shiftKey && key !== 'Shift') keys.unshift('Shift');
  if (event.metaKey && key !== 'Meta') keys.unshift('Meta');

  return normalizeKeyName(keys.join('-'));
}
