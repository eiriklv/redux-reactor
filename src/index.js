/**
 * Create a middleware for adding reactors
 */
function reactorMiddleware(reactors, extraArguments) {
  return (store) => {
    return (next) => {
      /**
       * Create an array to hold listeners/subscribers/waiters for action dispatches
       */
      const singleDispatchTakers = [];
      const everyDispatchTakers = [];

      /**
       * Initialize the reactors
       *
       * NOTE: This is to make sure we wait until the next til before we
       * run the actual reactors, as we need to wait for all the
       * middleware to be applied to store (or else we cannot dispatch actions through the entire chain again)
       */
      setImmediate(() => {
        reactors.forEach(epic => {
          /**
           * Create a function that enables reactors to wait
           * for actions to be dispatched (single occurence)
           */
          const takeDispatchOf = (actionType) => {
            /**
             * Create an initial resolver function
             */
            let resolver = () => console.warn('resolver not ready');

            /**
             * Create a promise that will be resolved when
             * a specified action is dispatched
             */
            const promise = new Promise((resolve) => {
              /**
               * Replace the resolver function
               * with the actual resolver function
               * of the generated promise
               */
              resolver = resolve;
            });

            /**
             * Create an object representing the
             * unresolved awaited action dispatch
             */
            const taker = { actionType, resolver };

            /**
             * Push the representation into
             * a list of all awaited action dispatches
             */
            singleDispatchTakers.push(taker);

            /**
             * Return a promise of an awaited action dispatch
             */
            return promise;
          };

          /**
           * Create e function that enables reactors to wait
           * for actions to be dispatched (every occurence)
           */
          const takeEveryDispatchOf = (actionType, actor) => {
            /**
             * Create an object representing the
             * unresolved awaited action dispatch
             */
            const taker = { actionType, actor };

            /**
             * Push the representation into
             * a list of all awaited action dispatches
             */
            everyDispatchTakers.push(taker);
          };

          /**
           * Run/initialize the epic/reactor/actor (whatever it ends up being called)
           *
           * Make sure to pass down the functions that enables
           * the epic to wait for a dispatched action or emitted event
           *
           * We also pass down the store, so that the reactors can
           * read the current state and dispatch actions if necessary
           *
           * We also pass down any additional optional arguments,
           * which could be sockets, emitters or other necessary
           * arguments to get the functionality you need
           */
          epic({ takeDispatchOf, takeEveryDispatchOf }, store, extraArguments);
        });
      });

      /**
       * Patch store.dispatch to add the epic functionality
       */
      return (action) => {
        /**
         * Resolve any applicable epic singleDispatchTakers
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
            taker.resolver(action);
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
        .forEach(({ actor }) => {
          /**
           * Run the actor function of the taker
           * on the next tick
           */
          setImmediate(() => {
            actor(action);
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
