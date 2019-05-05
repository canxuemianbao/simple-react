// {tag: "div", attrs: null, children: Array(2)}
function render (vnode) {
  if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

  if ( typeof vnode === 'number' ) vnode = String( vnode );

  if (typeof vnode === 'string') {
      const textNode = document.createTextNode( vnode );
      return textNode;
  }

  if ( typeof vnode.tag === 'function' ) {
      const component = createComponent( vnode.tag, vnode.attrs );
      setComponentProps( component, vnode.attrs );
      return component.base;
  }
  
  const node = document.createElement(vnode.tag);
  if (vnode.attrs != undefined) {
      Object.keys(vnode.attrs).forEach((key) => {
          setAttribute(node, key, vnode.attrs[key]);
      });
  }

  vnode.children.forEach((child) => {
      node.append(render(child));
  });
  return node;
}

function createComponent(component, props) {
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
function setComponentProps(component, props ) {
  if (!component.base) {
      component.componentWillMount();
  } else {
      component.componentWillReceiveProps(props);
  }
  renderComponent(component);
}

// componentWillUpdate componentDidUpdate componentDidMount
export function renderComponent(component) {
  let base;
  if (component.base) {
      component.componentWillUpdate();
  }
  base = render(component.render());
  if (!component.base) {
      component.componentDidMount();
  } else {
      component.componentDidUpdate();
  }

  if ( component.base && component.base.parentNode ) {
      component.base.parentNode.replaceChild( base, component.base );
  }
  component.base = base;
  base._component = component;
}

function setAttribute( dom, name, value ) {
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


export const ReactDOM = {
  render: ( vnode, container ) => {
      container.innerHTML = '';
      return container.appendChild( render( vnode ) );
  }
}
