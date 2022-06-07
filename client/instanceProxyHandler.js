import client from './client';
import { generateContext } from './context';
import { generateObjectProxy } from './objectProxyHandler';

export const instanceProxies = new WeakMap()

const instanceProxyHandler = {
  get(target, name) {
    if (name === '_isProxy') return true;
    if (target.constructor[name]?.name === '_invoke') return target.constructor[name].bind(target.constructor)
    if (!target[name]?.name?.startsWith?.('_') && !name.startsWith('_') && typeof target[name] === 'function' && name !== 'constructor') {
      const { [name]: named } = {
        [name]: (args) => {
          const context = generateContext({ ...target._attributes, ...args });
          const proxy = instanceProxies.get(target)
          return target[name].call(proxy, context);
        }
      }
      return named;
    }
    return Reflect.get(...arguments);
  },
  set(target, name, value) {
    if (!value?.name?.startsWith?.('_') && !name.startsWith('_')) {
      target[name] = generateObjectProxy(name, value);
      client.update();
    } else {
      target[name] = value;
    }
    return true;
  }
}

export default instanceProxyHandler;