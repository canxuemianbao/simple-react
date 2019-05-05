import { renderComponent } from './reactDom';

function createElement( tag, attrs, ...children ) {
  return {
      tag,
      attrs,
      children
  }
}

export class Component {
  constructor( props = {} ) {
      this.state = {};
      this.props = props;
  }

  setState( stateChange ) {
      // 将修改合并到state
      Object.assign( this.state, stateChange );
      renderComponent( this );
  }

  componentWillMount() {}

  componentWillReceiveProps(props) {}

  componentWillUpdate() {}

  componentDidUpdate() {}

  componentDidMount() {}
}

export const React = {
  createElement,
  Component
}