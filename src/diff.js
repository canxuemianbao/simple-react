/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @returns {HTMLElement} 更新后的DOM
 */
function diff(dom, vnode) {
  // 文本节点
  let out;
  if (typeof vnode === 'string') {
    if (dom && dom.nodeType === 3) {
      dom.textContent = vnode;
      out = dom;
    } else {
      out = document.createTextNode(vnode);
      if (dom && dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }
    }
    return out;
  }
  // 非文本DOM节点
  if (!dom || dom.nodeName.toLowerCase() !== vnode.tag.toLowerCase()) {
    out = document.createElement(vnode.tag);
    if (dom) {
      [...dom.childNodes].map(out.appendChild);
      if (dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }
    }
  }

  diffAttributes(out, vnode);

  if (vnode.children && vnode.children.length > 0 || (out.childNodes && out.childNodes.length > 0)) {
    diffChildren(out, vnode.children);
  }
  return out;
}

function diffAttributes(dom, vnode) {
  const old = {};    // 当前DOM的属性
  const attrs = vnode.attrs;     // 虚拟DOM的属性

  for (let i = 0; i < dom.attributes.length; i++) {
    const attr = dom.attributes[i];
    old[attr.name] = attr.value;
  }

  // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
  for (let name in old) {
    if (!(name in attrs)) {
      setAttribute(dom, name, undefined);
    }
  }

  // 更新新的属性值
  for (let name in attrs) {
    if (old[name] !== attrs[name]) {
      setAttribute(dom, name, attrs[name]);
    }
  }
}


function diffChildren(dom, vchildren) {
  const domChildren = dom.childNodes;
  const children = [];

  const keyed = {};

  // 将有key的节点和没有key的节点分开
  if (domChildren.length > 0) {
    for (let i = 0; i < domChildren.length; i++) {
      const child = domChildren[i];
      const key = child.key;
      if (key) {
        keyed[key] = child;
      } else {
        children.push(child);
      }
    }
  }

  let min = 0;
  for (let i = 0; i < vchildren.length; i++) {
    const vnode = vchildren[i];
    let child;
    if (vnode.key != undefined && vnode.key === keyed[key]) {
      child = keyed[key];
      keyed[key] = undefined;
    } else {
      for (let j = min; j < children.length; j++) {
        if (isSameNodeType(children[j], vnode.tag)) {
          min++;
          child = children[j];
          break;
        }
      }
    }
    const newChild = diff(child, vnode);
    if (dom.childNodes[i] !== newChild) {

    }
  }
}

function diffComponent(dom, vnode) {
}

function renderComponent(component) {
}

function isSameNodeType(dom, vnode) {
  return dom.nodeName === vnode.tag;
}