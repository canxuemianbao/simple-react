import { React, Component } from './react.js';
import { ReactDOM } from './reactDom.js';

class Welcome extends Component {
    render () {
        return <div>{this.props.name}</div>;
    }
}

class Counter extends Component {
    constructor( props ) {
        super( props );
        this.state = {
            num: 0
        }
    }

    componentWillUpdate() {
        console.log( 'update' );
    }

    componentWillMount() {
        console.log( 'mount' );
    }

    onClick() {
        for (let i = 0; i < 100; i++) {
            this.setState( ({num}) => ({ num: num + 1 }) );
        }
    }

    render() {
        return (
            <div onClick={ () => this.onClick() }>
                <h1>number: {this.state.num}</h1>
                <button>add</button>
                <p>sdfasdf</p>
                <Welcome name={'asdf'}/>
            </div>
        );
    }
}
ReactDOM.render(
    <Counter/>,
    document.getElementById( 'root' )
);