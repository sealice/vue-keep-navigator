import config from '../config';
import history from '../history';
import { lastIndexOf, remove } from '../utils';

const tags = [];

export default {
  name: 'keep-navigator',
  abstract: true,
  props: {
    max: [Number, String]
  },
  methods: {
    push(tag) {
      const max = parseInt(this.max);
      if (!max) {
        return;
      }

      if (config.stack) {
        tags.push(`${history.key}::${tag}`);
      } else {
        const index = tags.indexOf(tag);
        if (index >= 0) {
          tags.splice(index, 1);
        }
        tags.push(tag);
      }

      if (tags.length > max) {
        pruneCache(tags, tags[0], config.stack);
      }
    },
    destroy() {
      history.remove(0, history.size);
    }
  },
  // destroyed() {
  //   if (this.$parent.$options.name != 'transition') {
  //     this.destroy();
  //   }
  // },
  render() {
    const vm = this;
    const vnode = getFirstComponent(vm.$slots.default);
    const componentOptions = vnode && vnode.componentOptions;

    if (componentOptions) {
      const caches = history.caches;
      const tag = getViewName(vm.$route);
      let keepAlive = vm.$route.meta.keepAlive;

      if (keepAlive == void 0) {
        keepAlive = config.keepAlive;
      }

      if (history.isForward) {
        if (!config.stack) {
          if (keepAlive) {
            const index = lastIndexOf(caches, item => item.tag == tag);
            const cache = caches[index];
            if (index >= 0 && cache.vnode && cache.vnode.componentInstance) {
              vnode.componentInstance = cache.vnode.componentInstance;
            }
          } else {
            history.forward(tag, null);
            return vnode;
          }
        }

        history.forward(tag, vnode);
        vm.push(tag);
      } else {
        if (config.stack || keepAlive) {
          const index = lastIndexOf(caches, item => item.key == history.key);
          const cache = caches[index];
          if (index >= 0 && cache.vnode && cache.vnode.componentInstance) {
            vnode.componentInstance = cache.vnode.componentInstance;
          }

          history.back(vnode);
        } else {
          history.back(null);
          return vnode;
        }
      }

      if (config.disableFirstActivated) {
        disableFirstActivatedHander(vm, vnode);
      }

      vnode.data.keepAlive = true;
    }

    return vnode;
  }
};

function getFirstComponent(node) {
  return node && node[0];
}

function getViewName(route) {
  const matched = route.matched;
  return route.name || matched[matched.length - 1].path;
}

function disableFirstActivatedHander(vm, vnode) {
  const opts = vnode.componentOptions.Ctor.options;

  if (opts.isFirstEnter != void 0) {
    return;
  }

  opts.isFirstEnter = true;
  if (opts.activated) {
    opts.activated = opts.activated.map(activated => {
      return function() {
        if (this.$options.isFirstEnter) {
          this.$options.isFirstEnter = false;
          return;
        }
        activated.call(this);
      };
    });
  }
}

function pruneCache(tags, tag, stack) {
  const caches = history.caches.filter(cache => {
    if (stack) {
      return `${cache.key}::${cache.tag}` == tag && cache.vnode;
    } else {
      return cache.tag == tag && cache.vnode;
    }
  });

  caches.forEach(cache => {
    if (cache.vnode) {
      cache.vnode.componentInstance && cache.vnode.componentInstance.$destroy();
      cache.vnode = null;
    }
  });

  remove(tags, tag);
}
