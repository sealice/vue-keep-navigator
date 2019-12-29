import config, { CACHE_KEY } from './config';
import sess from './sess';
import { lastIndexOf, defineProperty } from './utils';

function History() {
  this.key = '';
  this.caches = [];
  this.isForward = false;
  this.isReplace = false;
}

defineHistoryPropertys({
  index: {
    get() {
      const slef = this;
      return lastIndexOf(slef.caches, item => item.key == slef.key);
    }
  },
  size: {
    get() {
      return this.caches.length;
    }
  },
  forward: {
    value: function forward(tag, vnode) {
      const self = this;
      const item = { key: self.key, tag };

      defineProperty(item, 'vnode', { value: vnode, writable: true });

      if (self.index < 0) {
        if (self.isReplace) {
          self.remove(self.size - 1, 1);
        }
      } else {
        self.remove(self.index, 1);
      }

      self.caches.push(item);
      self.isReplace = false;

      if (config.localCache) {
        sess.set(CACHE_KEY, self.caches);
      }
    }
  },
  back: {
    value: function back(vnode) {
      const self = this;
      const cache = self.caches[self.index];
      if (!cache.vnode && vnode) {
        defineProperty(cache, 'vnode', { value: vnode, writable: true });
      }

      self.remove(self.index + 1, self.size);

      if (config.localCache) {
        sess.set(CACHE_KEY, self.caches);
      }
    }
  },
  remove: {
    value: function remove(start, end) {
      const self = this;
      if (start > -1) {
        const caches = self.caches.splice(start, end);
        for (let i = 0, len = caches.length - 1; i <= len; i++) {
          const cache = caches[i];
          const index = lastIndexOf(self.caches, item => item.tag == cache.tag && item.vnode);
          if (cache.vnode && (config.stack || index < 0)) {
            cache.vnode.componentInstance && cache.vnode.componentInstance.$destroy();
            cache.vnode = null;
          }
        }
      }
    }
  }
});

function defineHistoryPropertys(obj) {
  for (let key in obj) {
    defineProperty(History.prototype, key, obj[key]);
  }
}

export default new History();
