import { EventEmitter } from './event';
import { forEach } from 'lodash';
import { getCookie } from '~/packages/lib/get-cookie';

export default class Uploader extends EventEmitter {
  url: string;
  xhr: XMLHttpRequest | null;

  constructor(url: string) {
    super();

    this.url = url;
    this.xhr = null;
  }

  /**
   * 파일을 업로드한다.
   * @param {String} name 파일 필드의 이름
   * @param {FileList|Array} files 업로드할 파일 목록
   * @param {Object} fields 추가 필드
   * @param {Promise}
   */
  upload(name: string, files: FileList | File[], fields: object = {}) {
    const formData = new FormData();

    forEach(files, (file) => formData.append(name, file));
    forEach(fields, (value, name) => formData.append(name, value));

    // 에디터에 의한 업로드임을 표시
    formData.append('isEditor', 'true');

    const authKey = getCookie('collabee-auth-001');

    return new Promise((resolve, reject) => {
      const xhr = (this.xhr = new XMLHttpRequest());

      xhr.withCredentials = true;
      xhr.open('POST', this.url, true);
      xhr.setRequestHeader('collabee-auth-001', authKey);

      xhr.onload = () => {
        this.handleComplete(xhr);
        resolve(xhr);
      };
      xhr.onerror = () => {
        this.handleError(xhr);
        reject(xhr);
      };
      xhr.onabort = () => {
        this.handleAbort(xhr);
      };
      xhr.upload.addEventListener('progress', this.handleProgress);

      xhr.send(formData);
    });
  }

  isUploading() {
    return !!this.xhr;
  }

  abort() {
    this.xhr?.abort();
  }

  handleProgress = (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
    const params = { loaded: event.loaded || 0, total: event.total, percent: 0 };
    const percent = params.loaded / event.total;

    if (!isNaN(percent)) {
      params.percent = percent * 100;
    }

    this.emit('progress', params);
  };

  handleComplete = (xhr: XMLHttpRequest) => {
    this.xhr = null;
    this.emit('complete', { xhr });
  };

  handleError = (xhr: XMLHttpRequest) => {
    this.xhr = null;
    this.emit('error', { xhr });
  };

  handleAbort = (xhr: XMLHttpRequest) => {
    this.xhr = null;
    this.emit('abort', { xhr });
  };
}
