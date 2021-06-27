function escapeType(name: string) {
  return name.replace(/[\.\$\(\)]/g, '\\$&').replace(/\*/g, '\\w+');
}

export class Event {
  _type: string;
  _data: unknown;
  _cancelled: boolean = false;

  constructor(type: string, data: unknown = null) {
    this._type = type;
    this._data = data;
    this._cancelled = false;
  }

  stop() {
    this._cancelled = true;
  }

  get data() {
    return this._data;
  }

  get type() {
    return this._type;
  }

  get cancelled() {
    return this._cancelled;
  }
}

type EventListenerItem = {
  type: string;
  callback: Function;
};

export class EventEmitter {
  _listeners: EventListenerItem[] = [];

  on(types: string, callback: Function) {
    this._listeners = this._listeners.concat(
      types
        .split(' ')
        .filter(Boolean)
        .map((type) => ({ type, callback }))
    );
  }

  off(types: string, callback?: Function) {
    if (!types || types === '*') {
      this._listeners = [];
      return;
    }

    const regex = new RegExp(
      `^(?:${types.split(' ').filter(Boolean).map(escapeType).join('|')})$`
    );
    this._listeners = this._listeners.filter((listener) => {
      if (!regex.test(listener.type)) return true;
      return callback && listener.callback !== callback;
    });
  }

  async emit(type: string, data = {}) {
    const event = new Event(type, data);

    for (let i = 0; i < this._listeners.length; i++) {
      const { type: $type, callback } = this._listeners[i];
      const regex = new RegExp(`^${escapeType($type)}$`);

      if (regex.test(type)) {
        callback.call(this, event);
        if (event.cancelled) break;
      }
    }

    return event;
  }
}
