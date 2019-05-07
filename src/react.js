import { renderComponent } from './diff.js';

function createElement(tag, attrs, ...children) {
  return {
      tag,
      attrs,
      children
  }
}

const defer = (f) => Promise.resolve().then(f);

const queue = [];
const enqueueSetState = (stateChange, componenet) => {
  if (queue.length === 0) {
    defer(flush);
  }
  queue.push({
    stateChange,
    componenet,
  });
}

const flush = () => {
  let item;
  const componenetQueue = [];
  while(item = queue.shift()) {
    const { stateChange, componenet } = item;
    if (typeof stateChange === 'function') {
      Object.assign(componenet.state, stateChange(componenet.state, componenet.props))
    } else {
      Object.assign(componenet.state, stateChange)
    }
    if (componenetQueue.every((_componenet) => _componenet !== componenet)) {
      componenetQueue.push(componenet);
    }
  }
  componenetQueue.forEach(renderComponent);
}

export class Component {
  constructor(props = {}) {
    this.state = {};
    this.props = props;
  }

  setState(stateChange) {
    // 将修改合并到state
    enqueueSetState(stateChange, this);
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