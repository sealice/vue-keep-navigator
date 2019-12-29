/* eslint-disable no-empty */
const session = sessionStorage;

export default {
  set(key, val) {
    session.setItem(key, JSON.stringify(val));
  },
  get(key) {
    let val = session.getItem(key);
    try {
      val = JSON.parse(val);
    } catch (err) {}
    return val;
  }
};
