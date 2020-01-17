# vue-keep-navigator

[![npm](https://img.shields.io/npm/v/vue-keep-navigator)][npm]
[![GitHub file size in bytes](https://img.shields.io/github/size/sealice/vue-keep-navigator/dist/vue-keep-navigator.umd.min.js)][size]
[![GitHub](https://img.shields.io/github/license/sealice/vue-keep-navigator)][licence]

一个用于 Vuejs 的，基于浏览器历史记录的路由导航器。

---

## 功能特性

- 缓存页面，可以实现页面前进刷新、后退不刷新
- 可以为路由前进、后退添加不同的过渡动画
- 保持与浏览器一致的历史访问记录（即使刷新页面也可以保持正确的前进、后退过渡动画）

## 用法

**安装**

```shell
npm install vue-keep-navigator
# OR
yarn add vue-keep-navigator
```

**使用**

main.js

```js
import Vue from 'vue';
import VueKeepNavigator from 'vue-keep-navigator';

// router: new VueRouter()
Vue.use(VueKeepNavigator, { router });
```

App.vue

```vue
<template>
  <div id="app">
    <keep-navigator>
      <router-view />
    </keep-navigator>
  </div>
</template>
```

**过渡动画**：可以通过 `$router.isForward` 判断路由是否前进来执行不同的动画

```vue
<template>
  <div id="app">
    <transition mode="out-in" :name="$router.isForward ? 'slide-left' : 'slide-right'">
      <keep-navigator>
        <router-view class="view" />
      </keep-navigator>
    </transition>
  </div>
</template>
```

## API

```js
Vue.use(VueKeepNavigator, options);
```

### options 说明：

<table>
  <colgroup>
    <col width="175" />
    <col width="85" />
    <col width="85" />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>属性</th>
      <th>类型</th>
      <th>默认值</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>router</td>
      <td>object</td>
      <td>-</td>
      <td>【必填】vue-router 实例，vue-keep-navigator 依赖于 vue 路由实例</td>
    </tr>
    <tr>
      <td>key</td>
      <td>string</td>
      <td>_sk</td>
      <td>给路由追加的键值名称，用于区分页面地址</td>
    </tr>
    <tr>
      <td>mode</td>
      <td>string</td>
      <td>stack</td>
      <td>
        导航模式，可选 <code>stack</code>、<code>cache</code> ；<br />
        <code>stack</code> ：页面前进刷新、后退不刷新（使用缓存）；<br />
        <code>cache</code> ：无论页面是前进还是后退，只要缓存可用将从缓存恢复页面；<br />2 种模式均可触发
        <code>activated</code> 和 <code>deactivated</code> 钩子函数，因此当页面从缓存恢复时可通过
        <code>activated</code> 更新页面数据
      </td>
    </tr>
    <tr>
      <td>keepAlive</td>
      <td>boolean</td>
      <td>true</td>
      <td>是否缓存页面，仅当 <code>mode: 'cache'</code> 模式有效。在路由 <code>meta.keepAlive</code> 值缺省时使用</td>
    </tr>
    <tr>
      <td>disableFirstActivated</td>
      <td>boolean</td>
      <td>true</td>
      <td>
        首次打开页面是否禁用 <code>activated</code> 钩子的执行。因 <code>activated</code> 钩子函数在
        <code>mounted</code> 之后执行，所以不适于页面首次加载时用来获取数据
      </td>
    </tr>
    <tr>
      <td>localCache</td>
      <td>boolean</td>
      <td>false</td>
      <td>是否启用本地缓存历史记录，为 true 时，即使刷新页面也可以保持正确的前进、后退过渡动画</td>
    </tr>
  </tbody>
</table>

### keep-navigator 组件参数

<table>
  <colgroup>
    <col width="175" />
    <col width="85" />
    <col width="85" />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>属性</th>
      <th>类型</th>
      <th>默认值</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>max</td>
      <td>number<br />string</td>
      <td>-</td>
      <td>
        一个（字符串）数字，指定最多可以缓存多少页面实例。<br />一旦这个数字达到了，在新页面实例被创建之前，已缓存页面中最久没有被访问的实例会被销毁掉，但是不会影响前进、后退的效果
      </td>
    </tr>
  </tbody>
</table>

## Licence

[MIT][licence]

[npm]: https://www.npmjs.com/package/vue-keep-navigator
[size]: https://github.com/sealice/vue-keep-navigator/blob/master/dist/vue-keep-navigator.umd.min.js
[licence]: https://github.com/sealice/vue-keep-navigator/blob/master/LICENSE
