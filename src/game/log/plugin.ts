//
// Custom plugin to handle logging.
//

import { GameMethod } from 'boardgame.io/core';
import { INVALID_MOVE } from 'boardgame.io/core';
import { Plugin } from 'boardgame.io';

import type { MachikoroG } from '../types';

/**
 * 'logx' stands for 'log-extension', where we add additional functionality to
 * the built-in 'log' plugin.
 *
 * Over the course of a move, we accumulate `LogEvent` objects which each
 * represent an event that should be logged. These are gathered in a buffer
 * array stored in `G._logBuffer`. At the end of the move, the array of
 * `LogEvent` objects is flushed to the `log.setMetadata` method, which stores
 * these log events as metadata for the move.
 *
 * On the client, this array of `LogEvent` objects are retrieved, where it then
 * can be parsed.
 */
export const LogxPlugin: Plugin<Record<string, never>, Record<string, never>, MachikoroG> = {
  name: 'logx',

  fnWrap: (fn, fnType) => {
    if (fnType === GameMethod.MOVE) {
      const wrappedFn: typeof fn = ({ G, log, ...rest }, ...args) => {
        // initialize empty log buffer
        G = { ...G, _logBuffer: [] };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        const moveResult = fn({ G, log, ...rest }, ...args);

        if (moveResult === INVALID_MOVE) {
          return INVALID_MOVE;
        }

        let newG = moveResult as MachikoroG;
        log.setMetadata(newG._logBuffer);
        // clear log buffer
        newG = { ...newG, _logBuffer: [] };
        return newG;
      };
      return wrappedFn;
    } else {
      return fn;
    }
  },
};
  