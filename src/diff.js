export function setAttribute( dom, name, value ) {
  // 如果属性名是className，则改回class
  if ( name === 'className' ) name = 'class';

  // 如果属性名是onXXX，则是一个事件监听方法
  if ( /on\w+/.test( name ) ) {
      name = name.toLowerCase();
      dom[ name ] = value || '';
  // 如果属性名是style，则更新style对象
  } else if ( name === 'style' ) {
      if ( !value || typeof value === 'string' ) {
          dom.style.cssText = value || '';
      } else if ( value && typeof value === 'object' ) {
          for ( let name in value ) {
              // 可以通过style={ width: 20 }这种形式来设置样式，可以省略掉单位px
              dom.style[ name ] = typeof value[ name ] === 'number' ? value[ name ] + 'px' : value[ name ];
          }
      }
  // 普通属性则直接更新属性
  } else {
      if ( name in dom ) {
          dom[ name ] = value || '';
      }
      if ( value ) {
          dom.setAttribute( name, value );
      } else {
          dom.removeAttribute( name );
      }
  }
}

export function diff(dom, vnode, container) {
  const ret = diffNode(dom, vnode);
  if (container && ret.parentNode !== container) {
      container.appendChild(ret);
  }
  return ret;
}

/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @returns {HTMLElement} 更新后的DOM
 */
export function diffNode(dom, vnode) {
  // 文本节点
  let out;
  if (vnode === undefined || vnode === null || typeof vnode === 'boolean') vnode = '';

  if (typeof vnode === 'number') vnode = String(vnode);

  if (typeof vnode === 'string') {
    if (dom && dom.textContent === vnode) {
      out = dom;
    } else if (dom && dom.nodeType === 3) {
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

  if (typeof vnode.tag === 'function') {
    return diffComponent(dom, vnode);
  }

  // 非文本DOM节点
  if (!dom || !isSameNodeType(dom, vnode)) {
    out = document.createElement(vnode.tag);
    if (dom) {
      [...dom.childNodes].map(out.appendChild);
      if (dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }
    }
  } else {
    out = dom;
  }

  if (vnode.children && vnode.children.length > 0 || (out.childNodes && out.childNodes.length > 0)) {
    diffChildren(out, vnode.children);
  }

  diffAttributes(out, vnode);
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

  for (let i = 0; i < vchildren.length; i++) {
    const vnode = vchildren[i];
    let child;
    if (vnode.key != undefined && vnode.key === keyed[key]) {
      child = keyed[key];
      keyed[key] = undefined;
    } else {
      for (let j = 0; j < children.length; j++) {
        if (children[j] != undefined && isSameNodeType(children[j], vnode)) {
          child = children[j];
          children[j] = undefined;
          break;
        }
      }
    }

    const out = diffNode(child, vnode);
    const currentDom = dom.childNodes[i];
    if (out !== currentDom) {
      dom.insertBefore(out, currentDom);
    }
  }

  const pendingLength = dom.childNodes.length;
  for (let i = vchildren.length; i < pendingLength; i++) {
    dom.removeChild(dom.childNodes[vchildren.length]);
  }
}

function diffComponent(dom, vnode) {
  const c = dom && dom._component;
  if (c && c.constructor === vnode.tag) {
    setComponentProps(c, vnode.attrs);
  } else {
    if (c) {
      unmountComponent(c);
    }
    const newComponent = createComponent(vnode.tag, vnode.attrs);
    setComponentProps(newComponent, vnode.attrs);
    if (dom) {
      dom._component = null;
      removeNode(dom);
    }
    dom = newComponent.base;
  }
  return dom;
}

export function renderComponent(component) {
    let base;
    if (component.base) {
        component.componentWillUpdate();
    }
    base = diffNode(component.base, component.render());
    if (!component.base) {
        component.componentDidMount();
    } else {
        component.componentDidUpdate();
    }

    component.base = base;
    base._component = component;
}

export function createComponent(component, props) {
  if (component.prototype && component.prototype.render) {
    return new component(props);
  } else {
    const inst = {};
    inst.constructor = component;
    inst.render = function() {
      return this.constructor(props);
    }
  }
}

// componentWillMount componentWillReceiveProps
export function setComponentProps(component, props) {
  if (!component.base) {
      component.componentWillMount();
  } else {
      component.componentWillReceiveProps(props);
  }
  renderComponent(component);
}

function isSameNodeType(dom, vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return dom.nodeType === 3;
  }

  if (typeof vnode.tag === 'string') {
    return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
  }

  return dom && dom._component && dom._component.constructor === vnode.tag;
}


function removeNode(dom) {
  if (dom && dom.parentNode) {
    dom.parentNode.removeChild(dom);
  }
}

function unmountComponent(component) {
  if (component.componentWillUnmount) component.componentWillUnmount();
  removeNode(component.base);
}