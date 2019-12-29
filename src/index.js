import config, { CACHE_KEY } from './config';
import { Assignment } from './utils';
import sess from './sess';
import history from './history';
import KeepNavigator from './component/keep-navigator';

const caches = sess.get(CACHE_KEY) || [];

function getKey() {
  return Math.random()
    .toString(16)
    .substr(2, 8);
}

function hasKey(route, key) {
  return !!route.query[key];
}

export default {
  install(Vue, opts) {
    const router = opts && opts.router;
    if (!router) {
      throw Error(`[VueKeepNavigator]: router is necessary.`);
    }

    Assignment(config, opts);
    Vue.component(KeepNavigator.name, KeepNavigator);

    if (config.localCache) {
      history.caches = caches;
    }

    const routerReplace = router.replace;
    router.replace = function() {
      history.isReplace = true;
      routerReplace.apply(router, arguments);
    };

    const keyReg = new RegExp(`[?&]${config.key}=[^&]+`);
    function beforeEach(to, from, next) {
      const toPath = to.fullPath;
      const fromPath = from.fullPath;
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
