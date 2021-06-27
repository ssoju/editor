import debugFactory from 'debug';
import { EventEmitter } from '~/packages/lib/event';
import ls from '~/packages/lib/local-storage';

const debug = debugFactory('editor:plugin:socket');

const DEFAULT_RETRY_INTERVAL = 1; // seconds
const DEFAULT_TIMEOUT = 2; // seconds <- 이 시간 안에 응답이 없으면 접속이 끊긴 것으로 간주
const DEFAULT_PING_TIMEOUT = 10; // seconds <- 이 시간 동안 사용자 입력이 없으면 서버에 ping 요청을 전송(접속 유지용)

export type DocumentOptions = {
  authKey: string;
  displayName: string;
  version: number;
  host: string;
  retryInterval: number;
  timeout: number;
  sendRemoveSessionId: boolean;
}

type User = Record<string, any>;
type RequestData = {
  id: number;
  type: string;
  model: any;
  data: any;
}

type Packet = {
  type: string;
  data: any;
}


class Document extends EventEmitter {
  socket: Nullable<WebSocket> = null;
  initialized: boolean = false;
  requestId: number = 0;
  retrying:boolean = false;
  retryTimeout?: number;
  timeoutId?: number;
  pingTimeout?: number;
  users: User[] = [];
  clientID: string = '';
  documentID: number = 0;
  options: DocumentOptions = {
    authKey: '',
    displayName: '',
    version: 1,
    host: '',
    retryInterval: DEFAULT_RETRY_INTERVAL,
    timeout: DEFAULT_TIMEOUT,
    sendRemoveSessionId: true,
  };

  constructor(clientID: string, documentID: number, options: DocumentOptions) {
    super();

    this.clientID = clientID;
    this.documentID = documentID;
    this.options = Object.freeze({
      ...options,
    });
  }

  connect = () => {
    if (this.socket !== null) {
      if (this.socket.readyState === WebSocket.OPEN) {
        return Promise.resolve(this);
      }

      if (this.socket.readyState === WebSocket.CONNECTING) {
        return new Promise((resolve) => {
          this.socket?.addEventListener('open', () => resolve(this));
        });
      }

      this.socket = null;
      return Promise.reject({ message: 'The socket is closing or closed.' });
    }

    const qs = new URLSearchParams({
      id: this.clientID,
      key: this.options.authKey,
      name: this.options.displayName,
      version: String(this.options.version || 0), // 문서서버 api 버전..
      agent:
        (typeof navigator !== 'undefined' ? navigator.userAgent : '') +
        ` CollabeeEditor/${__VERSION__}`,
    });
    const url = `${this.options.host}/doc/${this.documentID}?${qs.toString()}`;

    try {
      this.socket = new WebSocket(url);
      this.socket.addEventListener('message', this.handleMessage);
      this.socket.addEventListener('close', this.handleClose);
      this.socket.addEventListener('error', this.handleError);

      // 리퀘스트 일련번호와 초기화 상태 리셋
      this.requestId = 0;
      this.initialized = false;

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          return;
        }

        this.socket.addEventListener('close', reject);
        this.socket.addEventListener('open', () => {
          debug(
            'connect, retrying: %s, initialized: %s',
            this.retrying,
            this.initialized
          );

          reject = () => {};
          this.emit('connect');
          resolve(this);

          this.startPingTimer();
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  disconnect = () => {
    clearTimeout(this.retryTimeout);
    this.stopPingTimer();
    this.emptySocket();
  };

  retryToConnect = async () => {
    if (this.socket) return;

    clearTimeout(this.retryTimeout);
    this.stopPingTimer();

    debug('retrying...');

    try {
      await this.connect();
      this.retrying = false;
      this.initialized = true;
    } catch (e) {
      this.retryTimeout = window.setTimeout(this.retryToConnect, this.options.retryInterval * 1000);
    }
  };

  // 문서가 초기화 됐을 때 실행되는 Promise 객체를 반환한다.
  // 이미 초기화 한 후에도 호출할 수 있다.
  async ready() {
    const state = this.socket?.readyState;

    debug('ready:', state, this.initialized);

    if (state === undefined) {
      return Promise.reject(new Error('Socket is undefined'));
    }

    if (state === WebSocket.CLOSING || state === WebSocket.CLOSED) {
      return Promise.reject('Socket should be connected');
    }

    if (this.initialized) {
      return Promise.resolve();
    }

    return new Promise((resolve) => this.on('initialize', resolve));
  }

  /**
   * 세션키를 스토리지에 저장
   * @param {string} sessionId
   */
  storeSessionId(sessionId: string) {
    if (this.options.sendRemoveSessionId) {
      ls.setItem('editorSessionId', sessionId);
    }
  }

  /**
   * 스토리지에 저장되어 있는 세션키 추출
   * @returns {string}
   */
  getStoredSessionId() {
    if (this.options.sendRemoveSessionId) {
      return ls.getItem('editorSessionId') || '';
    }
    return '';
  }

  handleMessage = (event: MessageEvent) => {
    try {
      const packet = JSON.parse(event.data);
      let handled = false;

      this.updateUserList(packet);

      debug('handleMessage:', packet);

      // clear timeout
      clearTimeout(this.timeoutId);
      this.timeoutId = 0;

      if (packet.type === 'init') {
        this.initialized = true;

        // 서버에서 이전 세션에 대해서 해제작업을 할 수 있도록 세션키를 저장해 놓았다가
        // this.get()에서 이 값을 보내준다.(백엔드에서 요청함)
        // 스토리지에 보관하는 이유는 새로고침된 후에도 마지막으로 갖고 있던 세션키를
        // 보내주어야 하기 때문이다.
        this.storeSessionId(packet.data?.sessionId);

        this.emit('initialize', packet);
        handled = true;
      }

      if (!handled && packet.type === 'exception') {
        this.emit('exception', packet);
        handled = true;
      }

      if (!handled && packet.error) {
        this.emit('error', packet);
        handled = true;
      }

      if (!handled && packet.model === 'shout') {
        this.emit(packet.type, packet.data);
        handled = true;
      }

      if (packet.id) {
        this.emit(`response.${packet.id}`, packet);
      }

      this.emit('message', packet);
    } catch (e) {
      this.emit('error', e);
    }
  };

  handleClose = (event: CloseEvent) => {
    debug('handleClose', event);

    this.stopPingTimer();
    this.emptySocket();

    if (!this.retrying) {
      this.emit('disconnect');
    }

    // 비정상적인 접속 종료일 경우 재시도해본다.
    if (!event.wasClean && !this.retrying) {
      this.retrying = true;
      this.retryToConnect();
    }
  };

  handleError = (event: Event) => {
    debug('handleError', event);
    this.emit('error', event);
  };

  startPingTimer() {
    this.stopPingTimer();
    this.pingTimeout = window.setTimeout(() => this.ping(), DEFAULT_PING_TIMEOUT * 1000);
  }

  stopPingTimer() {
    clearTimeout(this.pingTimeout);
  }

  ping = () => {
    debug('ping');
    this.request({
      type: 'ping',
      model: 'req',
    } as RequestData);
  };

  emptySocket = () => {
    if (this.socket) {
      this.socket.removeEventListener('message', this.handleMessage);
      this.socket.removeEventListener('close', this.handleClose);
      this.socket.removeEventListener('error', this.handleError);
      this.socket.close();
    }

    this.socket = null;
  };

  // 소켓 서버로 데이터를 전송한다.
  request = async (data: RequestData, skipResponse = false) => {
    debug('request, retyring: %s', this.retrying, data);

    if (!data) {
      throw new Error('Packet is empty.');
    }

    // 재접속 시도 중에는 'retry' 결과만 보낸다.
    if (this.retrying) {
      return { result: 'retry' };
    }

    // ensure socket is connected
    await this.connect();
    this.startPingTimer();

    return new Promise<void>((resolve, reject) => {
      const req: RequestData = {
        ...data,
        id: ++this.requestId,
      };

      if (this.socket?.readyState !== WebSocket.OPEN) {
        return reject('Socket is not ready');
      }

      this.mayTriggerTimeout(req, reject);

      if (!skipResponse) {
        this.on(`response.${req.id}`, ({ data }: MessageEvent) => {
          this.off(`response.${req.id}`);

          if (data.data) {
            resolve(data.data);
          }

          if (data.error) {
            resolve(data);
          }
        });
      }

      this.socket.send(JSON.stringify(req));
      skipResponse && resolve();
    });
  };

  mayTriggerTimeout(request: RequestData, reject: (reason?: any) => void) {
    if (this.timeoutId) return;

    this.timeoutId = window.setTimeout(() => {
      debug('timeout %ds', this.options.timeout);

      this.emit('timeout');

      this.timeoutId = 0;
      this.off(`response.${request.id}`);
      this.handleClose({ wasClean: false, reason: 'timeout' } as CloseEvent);
      reject('Timeout');
    }, this.options.timeout * 1000);
  }

  // 문서 정보를 가져온다.
  get() {
    return this.request({
      type: 'init',
      model: 'req',
      data: {
        no: this.documentID,
        removeSessionId: this.getStoredSessionId(),
      },
    } as RequestData);
  }

  // 사용자 목록을 반환한다.
  getUsers() {
    return this.users;
  }

  // 전달받은 패킷을 확인하여 사용자 목록을 업데이트한다.
  updateUserList(packet: Packet) {
    if (!packet) return;
    if (packet.type === 'init') {
      this.users = packet.data?.users || [];
      return;
    }
    if (packet.type === 'user') {
      this.users = packet.data || [];
      return;
    }
  }

  // 문서의 변경된 정보를 서버로 전송한다.
  updateVersion(payload: any) {
    debug('updateVersion', payload);
    return this.request({
      type: 'update',
      model: 'req',
      data: { no: this.documentID, payload },
    } as RequestData);
  }

  // 현재 사용자의 위치를 다른 사용자에게 업데이트해준다.
  updatePosition(data: RequestData) {
    debug('updatePosition', data);
    return this.request({
      type: 'changepos',
      model: 'req',
      data,
    } as RequestData);
  }
}

const documents = new Map();
function connect(clientID: string, documentID: number, options: DocumentOptions) {
  if (!documents.has(documentID)) {
    documents.set(documentID, new Document(clientID, documentID, options));
    documents.get(documentID).connect();
  }

  return documents.get(documentID);
}

export default {
  connect,
};
