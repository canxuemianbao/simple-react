import {
    setAttribute,
    diff,
    createComponent,
    setComponentProps,
} from './diff.js';

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

// componentWillUpdate componentDidUpdate componentDidMount
export function renderComponent0(component) {
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

export const ReactDOM = {
  render0: (vnode, container) => {
    container.innerHTML = '';
    return container.appendChild(render(vnode));
  },
  render: (vnode, container, dom) => {
    return diff(dom, vnode, container);
  }
}
