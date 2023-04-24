/**
 * https://gist.github.com/orangegrove1955/eba48b5243e5da3fd680e6f1a6cae87c#file-asynccallwithtimeout-js
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param {Promise<T>} asyncPromise - An asynchronous promise to resolve
 * @param {number} timeLimit - Time limit to attempt function in milliseconds
 * @returns Resolved promise for async function call, or an error if time limit reached
 */
export const asyncCallWithTimeout = async <T>(asyncPromise: Promise<T>, timeLimit: number): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Async call timeout limit reached')), timeLimit);
  });

  return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  });
};

/**
 * Catches errors and logs to console.
 * @param e
 */
export const defaultErrorCatcher = (e: unknown): void => {
  console.error(e);
};
