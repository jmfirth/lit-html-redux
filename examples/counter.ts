import { html, render } from 'lit-html/lib/lit-extended';
import { createSubscriber, Publisher } from '../src/lit-html-redux';
import { createStore, bindActionCreators } from 'redux';

type CounterState = number;

const todos = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state += 1;
    case 'DECREMENT':
      return state -= 1;
    default:
      return state;
  }
};

const store = createStore<CounterState>(todos, 0);

const actionCreators = {
  decrement: () => ({ type: 'DECREMENT' }),
  increment: () => ({ type: 'INCREMENT' }),
};

const counterView = createSubscriber(
  (counter: CounterState) => ({ counter }),
  dispatch => ({ actions: bindActionCreators(actionCreators, dispatch) })
)(({ counter, actions }) => html`
  <p>${ counter }</p>
  <button type="button" onclick="${ () => actions.increment() }">Increment</button>
  <button type="button" onclick="${ () => actions.decrement() }">Decrement</button>
`);

const provider = new Publisher(
  provider => render(counterView(provider), document.body),
  store
);

provider.mount();
