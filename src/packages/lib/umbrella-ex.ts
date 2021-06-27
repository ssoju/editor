import u from 'umbrellajs';
import { camelCase } from 'lodash';

u.prototype.css = function (name: string, value: string) {
  const specialNames: { [name: string]: string } = {
    float: 'cssFloat',
  };

  return this.pairs(
    name,
    value,
    function (node: HTMLElement, name: string) {
      name = specialNames[name] || camelCase(name);
      return node.style.getPropertyValue(name);
    },
    function (node: HTMLElement, name: string, value: string) {
      node.style.setProperty(name, value);
    }
  );
};

u.prototype.next = function (selector: string) {
  return this.map((node: HTMLElement) => node && node.nextElementSibling)
    .filter(Boolean)
    .filter(selector || '');
};

u.prototype.prev = function (selector: string) {
  return this.map((node: HTMLElement) => node && node.previousElementSibling)
    .filter(Boolean)
    .filter(selector || '');
};

export default u;
