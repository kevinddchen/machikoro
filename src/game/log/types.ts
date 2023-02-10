//
// Types for the log.
//

/**
 * A `LogLine` is an object that is created during a move that stores a
 * `LogEvent` describing the type of event that needs to be logged and any
 * relevant metadata, such as the dice roll or money earned. Over the course of
 * a move, these `LogLine` objects are gathered in an array. At the end of the
 * move, the array of `LogLine` objects is passed to `ctx.log.setMetadata`.
 *
 * On the client, these `LogLine` objects are retrieved from `ctx.log` where it
 * is parsed by the `Logger` component.
 */
export interface LogLine {
  readonly event: LogEvent;
  [key: string]: any;
}

export const LogEvent = {
  RollOne: 'RollOne',
  RollTwo: 'RollTwo',
  AddTwo: 'AddTwo',
  Earn: 'Earn',
  Take: 'Take',
  Buy: 'Buy',
  Office: 'Office',
  TunaRoll: 'TunaRoll',
  EndGame: 'EndGame',
} as const;

export type LogEvent = (typeof LogEvent)[keyof typeof LogEvent];
