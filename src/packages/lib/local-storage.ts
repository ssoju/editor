const isSupported = typeof localStorage !== 'undefined';

function clear() {
  if (isSupported) {
    return localStorage.clear();
  }
}

function getItem(name: string): string | null {
  if (isSupported) {
    return localStorage.getItem(name);
  }
  return null;
}

function key(index: number): string | null {
  if (isSupported) {
    return localStorage.key(index);
  }
  return null;
}

function removeItem(name: string) {
  if (isSupported) {
    localStorage.removeItem(name);
  }
}

function setItem(name: string, value: string) {
  if (isSupported) {
    localStorage.setItem(name, value);
  }
}

export default { getItem, setItem, removeItem, clear, key };
