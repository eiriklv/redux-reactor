import { createStore, applyMiddleware } from 'redux';
import reactor from '../lib';

const fetchData = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ msg: 'Hello World' });
    }, 2000);
  })
}

const initialState = {
  data: null,
  error: null,
  isLoading: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ASYNC_ACTION_REQUEST':
      return { ...state, isLoading: true };
    case 'ASYNC_ACTION_SUCCESS':
      return { ...state, isLoading: false, data: action.data };
    case 'ASYNC_ACTION_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

const asyncReactor = async ({ takeEveryDispatchOf }, { dispatch }) => {
  takeEveryDispatchOf('ASYNC_ACTION_REQUEST', async (action) => {
    try {
      const data = await fetchData(action.id);
    } catch (error) {
      return dispatch({ type: 'ASYNC_ACTION_ERROR', error });
    }

    dispatch({ type: 'ASYNC_ACTION_SUCCESS', data });
  });
};

const store = createStore(
  reducer,
  applyMiddleware(
    reactor([
      asyncReactor
    ])
  )
);

store.subscribe(() => console.log(store.getState()));

setTimeout(() => {
  store.dispatch({ type: 'ASYNC_ACTION_REQUEST', id: 5 });
}, 1000);
