/**
 * MS Office Excel에서 복사된 데이터인가?
 * @param {String} html HTML 문자열
 * @returns {Boolean} 맞으면 true 그 밖에는 false
 */
export function isPastedFromExcel(html: string): boolean {
  return /xmlns:x="urn:schemas-microsoft-com:office:excel"/.test(html);
}
