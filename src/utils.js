export function lastIndexOf(arr, callback) {
  if (!arr.length || !callback) {
    return -1;
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    if (callback(arr[i], i)) {
      return i;
    }
  }

  return -1;
}

export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

export function defineProperty(obj, key, attributes) {
  Object.defineProperty(obj, key, attributes);
}

export function Assignment(target, source) {
  for (let key in target) {
    if (source[key] !== void 0) {
      target[key] = source[key];
    }
  }
}
