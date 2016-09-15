/**
 * Create a middleware for adding reactors
 */
function reactorMiddleware(reactors, extraArguments) {
  /**
   * Create an array to hold listeners/subscribers/waiters for action dispatches
   */
  const singleDispatchTakers = [];
  const everyDispatchTakers = [];

  /**
   * Return store enhancer
   */
  return (store) => {
    return (next) => {
      /**
       * Initialize the reactors
       *
       * NOTE: This is to make sure we wait until the next til before we
       * run the actual reactors, as we need to wait for all the
       * middleware to be applied to store (or else we cannot dispatch actions through the entire chain again)
       */
      setImmediate(() => {
        reactors.forEach(reactor => {
          /**
           * Create a function that enables reactors to wait
           * for actions to be dispatched (single occurence)
           */
          const takeDispatchOf = (actionType) => {
            /**
             * Return a promise that will be resolved when
             * a specified action is dispatched
             */
            return new Promise((resolve) => {
              singleDispatchTakers.push({ actionType, resolve });
            });
          };

          /**
           * Create e function that enables reactors to wait
           * for actions to be dispatched (every occurence)
           */
          const takeEveryDispatchOf = (actionType, handler) => {
            everyDispatchTakers.push({ actionType, handler });
          };

          /**
           * Run/initialize the reactor
           *
           * Make sure to pass down the functions that enables
           * the reactor to wait for a dispatched action or emitted event
           *
           * We also pass down the store, so that the reactors can
           * read the current state and dispatch actions if necessary
           *
           * We also pass down any additional optional arguments,
           * which could be sockets, emitters or other necessary
           * arguments to get the functionality you need
           */
          reactor({ takeDispatchOf, takeEveryDispatchOf }, store, extraArguments);
        });
      });

      /**
       * Patch store.dispatch to add the reactor functionality
       */
      return (action) => {
        /**
         * Resolve any applicable reactor singleDispatchTakers
         */
        singleDispatchTakers
        .filter(({ actionType }) => (
          !actionType ||
          (action.type && action.type === actionType)
        ))
        .forEach(taker => {
          /**
           * Remove the taker from the list of takers
           */
          singleDispatchTakers.splice(singleDispatchTakers.indexOf(taker), 1);

          /**
           * Resolve the taker in the next tick
           */
          setImmediate(() => {
            taker.resolve(action);
          });
        });

        /**
         * Run the actors of the matched everyDispatchTakers
         * and pass the action itself as argument
         */
        everyDispatchTakers
        .filter(({ actionType }) => (
          !actionType ||
          (action.type && action.type === actionType)
        ))
        .forEach(({ handler }) => {
          /**
           * Run the handler function of the taker
           * on the next tick
           */
          setImmediate(() => {
            handler(action);
          });
        });

        /**
         * Wait for the next tick to resolve the promise
         * to enable the process to move on to the next
         * event
         */
        return new Promise((resolve) => {
          setImmediate(() => {
            resolve(next(action));
          });
        });
      };
    };
  };
}

export default reactorMiddleware;
