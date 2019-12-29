'use strict';

function lastIndexOf(arr, callback) {
  if (!arr.length || !callback) {
    return -1;
  }

  for (var i = arr.length - 1; i >= 0; i--) {
    if (callback(arr[i], i)) {
      return i;
    }
  }

  return -1;
}
function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);

    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
function defineProperty(obj, key, attributes) {
  Object.defineProperty(obj, key, attributes);
}
function Assignment(target, source) {
  for (var key in target) {
    if (source[key] !== void 0) {
      target[key] = source[key];
    }
  }
}

var CACHE_KEY = 'NAVIGATION_RECORD';
var STACK_MODE = 'stack';
var CACHE_MODE = 'cache';
var config = {
  key: '_sk',
  mode: STACK_MODE,
  // stack|cache
  keepAlive: true,
  localCache: false,
  disableFirstActivated: true
};
defineProperty(config, STACK_MODE, {
  get: function get() {
    return this.mode == STACK_MODE || this.mode != CACHE_MODE;
  }
});

/* eslint-disable no-empty */
var session = sessionStorage;
var sess = {
  set: function set(key, val) {
    session.setItem(key, JSON.stringify(val));
  },
  get: function get(key) {
    var val = session.getItem(key);

    try {
      val = JSON.parse(val);
    } catch (err) {}

    return val;
  }
};

function History() {
  this.key = '';
  this.caches = [];
  this.isForward = false;
  this.isReplace = false;
}

defineHistoryPropertys({
  index: {
    get: function get() {
      var slef = this;
      return lastIndexOf(slef.caches, function (item) {
        return item.key == slef.key;
      });
    }
  },
  size: {
    get: function get() {
      return this.caches.length;
    }
  },
  forward: {
    value: function forward(tag, vnode) {
      var self = this;
      var item = {
        key: self.key,
        tag: tag
      };
      defineProperty(item, 'vnode', {
        value: vnode,
        writable: true
      });

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
      var self = this;
      var cache = self.caches[self.index];

      if (!cache.vnode && vnode) {
        defineProperty(cache, 'vnode', {
          value: vnode,
          writable: true
        });
      }

      self.remove(self.index + 1, self.size);

      if (config.localCache) {
        sess.set(CACHE_KEY, self.caches);
      }
    }
  },
  remove: {
    value: function remove(start, end) {
      var self = this;

      if (start > -1) {
        var caches = self.caches.splice(start, end);

        var _loop = function _loop(i, len) {
          var cache = caches[i];
          var index = lastIndexOf(self.caches, function (item) {
            return item.tag == cache.tag && item.vnode;
          });

          if (cache.vnode && (config.stack || index < 0)) {
            cache.vnode.componentInstance && cache.vnode.componentInstance.$destroy();
            cache.vnode = null;
          }
        };

        for (var i = 0, len = caches.length - 1; i <= len; i++) {
          _loop(i, len);
        }
      }
    }
  }
});

function defineHistoryPropertys(obj) {
  for (var key in obj) {
    defineProperty(History.prototype, key, obj[key]);
  }
}

var history = new History();

var tags = [];
var KeepNavigator = {
  name: 'keep-navigator',
  "abstract": true,
  props: {
    max: [Number, String]
  },
  methods: {
    push: function push(tag) {
      var max = parseInt(this.max);

      if (!max) {
        return;
      }

      if (config.stack) {
        tags.push("".concat(history.key, "::").concat(tag));
      } else {
        var index = tags.indexOf(tag);

        if (index >= 0) {
          tags.splice(index, 1);
        }

        tags.push(tag);
      }

      if (tags.length > max) {
        pruneCache(tags, tags[0], config.stack);
      }
    },
    destroy: function destroy() {
      history.remove(0, history.size);
    }
  },
  // destroyed() {
  //   if (this.$parent.$options.name != 'transition') {
  //     this.destroy();
  //   }
  // },
  render: function render() {
    var vm = this;
    var vnode = getFirstComponent(vm.$slots["default"]);
    var componentOptions = vnode && vnode.componentOptions;

    if (componentOptions) {
      var caches = history.caches;
      var tag = getViewName(vm.$route);
      var keepAlive = vm.$route.meta.keepAlive;

      if (keepAlive == void 0) {
        keepAlive = config.keepAlive;
      }

      if (history.isForward) {
        if (!config.stack) {
          if (keepAlive) {
            var index = lastIndexOf(caches, function (item) {
              return item.tag == tag;
            });
            var cache = caches[index];

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
          var _index = lastIndexOf(caches, function (item) {
            return item.key == history.key;
          });

          var _cache = caches[_index];

          if (_index >= 0 && _cache.vnode && _cache.vnode.componentInstance) {
            vnode.componentInstance = _cache.vnode.componentInstance;
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
  var matched = route.matched;
  return route.name || matched[matched.length - 1].path;
}

function disableFirstActivatedHander(vm, vnode) {
  var opts = vnode.componentOptions.Ctor.options;

  if (opts.isFirstEnter != void 0) {
    return;
  }

  opts.isFirstEnter = true;

  if (opts.activated) {
    opts.activated = opts.activated.map(function (activated) {
      return function () {
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
  var caches = history.caches.filter(function (cache) {
    if (stack) {
      return "".concat(cache.key, "::").concat(cache.tag) == tag && cache.vnode;
    } else {
      return cache.tag == tag && cache.vnode;
    }
  });
  caches.forEach(function (cache) {
    if (cache.vnode) {
      cache.vnode.componentInstance && cache.vnode.componentInstance.$destroy();
      cache.vnode = null;
    }
  });
  remove(tags, tag);
}

var caches = sess.get(CACHE_KEY) || [];

function getKey() {
  return Math.random().toString(16).substr(2, 8);
}

function hasKey(route, key) {
  return !!route.query[key];
}

var index = {
  install: function install(Vue, opts) {
    var router = opts && opts.router;

    if (!router) {
      throw Error("[VueKeepNavigator]: router is necessary.");
    }

    Assignment(config, opts);
    Vue.component(KeepNavigator.name, KeepNavigator);

    if (config.localCache) {
      history.caches = caches;
    }

    var routerReplace = router.replace;

    router.replace = function () {
      history.isReplace = true;
      routerReplace.apply(router, arguments);
    };

    var keyReg = new RegExp("[?&]".concat(config.key, "=[^&]+"));

    function beforeEach(to, from, next) {
      var toPath = to.fullPath;
      var fromPath = from.fullPath;

      if (toPath == fromPath.replace(keyReg, '') && fromPath != '/') {
        next(false);
        return;
      }

      if (!hasKey(to, config.key)) {
        to.query[config.key] = getKey();
        next({
          path: to.path,
          hash: to.hash,
          query: to.query,
          replace: history.isReplace || !hasKey(from, config.key)
        });
      } else {
        history.key = to.query[config.key];
        router.isForward = history.isForward = history.index == -1 || history.index == history.size - 1;
        next();
      }
    }

    router.beforeHooks.unshift(beforeEach);
  }
};

module.exports = index;
