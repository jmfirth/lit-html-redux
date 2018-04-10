import { html, render } from 'lit-html/lib/lit-extended';
import { createSubscriber, Publisher } from '../src/lit-html-redux';
import { createStore, bindActionCreators } from 'redux';

type TodoState = string[];

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text]);
    default:
      return state;
  }
};

const store = createStore<TodoState>(todos, ['Use Redux']);

const actions = {
  add: () => ({
    type: 'ADD_TODO',
    text: `Hello ${ Math.random() }`
  })
};

const todosView = createSubscriber(
  (state: TodoState) => ({ todos: state }),
  dispatch => ({ actions: bindActionCreators(actions, dispatch) })
)(({todos, actions}) => html`
  ${ todos.map(text => html`<p>${ text }</p>`) }
  <button type="button" onclick="${ () => actions.add() }">Add</button>
`);

const provider = new Publisher(
  provider => render(todosView(provider), document.body),
  store
);

provider.mount();

// connect(() => ({}), () => ({}))()
