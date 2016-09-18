Redux Reactor
=============

NOTE: This is still work in progress..

Side-effect [middleware](http://redux.js.org/docs/advanced/Middleware.html) for Redux.

[![build status](https://img.shields.io/travis/eiriklv/redux-reactor/master.svg?style=flat-square)](https://travis-ci.org/eiriklv/redux-reactor)
[![npm version](https://img.shields.io/npm/v/redux-reactor.svg?style=flat-square)](https://www.npmjs.com/package/redux-reactor)

```js
npm install --save redux-reactor
```

ES modules:

```js
import reactor from 'redux-reactor'
```

CommonJS:

```js
const reactor = require('redux-reactor').default;
```

As you can see, if you use CommonJS `require` it also requires `.default` at the end.

## Why Do I Need This?

If you’re not sure whether you need it, you probably don’t.

Reactors can be used to orchestrate asynchronous flows in your redux application. See examples for use cases.

## Motivation

Redux Reactor allows you wait for actions to be dispatched and react to them (in whatever way you like) and if applicable, dispatch new actions. The tools you are given are `takeDispatchOf` and `takeEveryDispatchOf` that you are expected to use together with `async / await` from ESNext.

## Examples

```
// returns a promise of a dispatched action
takeDispatchOf(actionType || undefined)
```

```
// runs a handler (async function) every time an action is dispatched
takeEveryDispatchOf(actionType || undefined, handler)
```

Example Async Reactor 1 (continuous - acts on every action):

```js
module.exports = async (
  { takeDispatchOf, takeEveryDispatchOf },
  { dispatch, getState }
  extraArguments
) {
  takeEveryDispatchOf(undefined, async (action) => {
    switch (action.type) {
      case 'SOME_ACTION':
        //.. Do something (side-effect)
        //.. Maybe dispatch another action?
        break;
      default:
        console.log('Doing nothing..');
    }
  })
}
```

Example Async Reactor 2 (multiple times - but only acts on one action at the time):

```js
module.exports = async (
  { takeDispatchOf, takeEveryDispatchOf },
  { dispatch, getState }
  extraArguments
) {
  while (true) {
    const action = takeDispatchOf('SOME_ASYNC_ACTION');
    // Do something based on the async action..
  }
}
```

Example Async Reactor 2 (multiple times - only completes one flow at the time):

```js
module.exports = async (
  { takeDispatchOf, takeEveryDispatchOf },
  { dispatch, getState }
  extraArguments
) {
  while (true) {
    const action1 = takeDispatchOf('STEP_1');
    // Do something based on step 1..

    const action2 = takeDispatchOf('STEP_2');
    // Do something based on step 1..

    const action3 = takeDispatchOf('STEP_3');
    // Do something based on step 1..

    console.log('Done with all steps!');
  }
}
```

Example Async Reactor 2 (single time - only completes one flow ever):

```js
module.exports = async (
  { takeDispatchOf, takeEveryDispatchOf },
  { dispatch, getState }
  extraArguments
) {
  const action1 = takeDispatchOf('STEP_1');
  // Do something based on step 1..

  const action2 = takeDispatchOf('STEP_2');
  // Do something based on step 1..

  const action3 = takeDispatchOf('STEP_3');
  // Do something based on step 1..

  console.log('Done with all steps!');
}
```

## Installation

```
npm install --save redux-reactor
```

Then, to enable Redux Reactor, use [`applyMiddleware()`](http://redux.js.org/docs/api/applyMiddleware.html):

```js
import { createStore, applyMiddleware } from 'redux';
import reactor from 'redux-reactor';
import rootReducer from './reducers/index';

// Import your reactors
import { myReactor, myOtherReactor } from './reactors';

// Note: this API requires redux@>=3.1.0
const store = createStore(
  rootReducer,
  applyMiddleware(
    reactor([
      myReactor,
      myOtherReactor
    ])
  )
);
```

## License

MIT
