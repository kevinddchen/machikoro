//
// Types for the log.
//

/**
 * Enumerates the types of events that we log.
 */
export const LogEventType = {
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

export type LogType = (typeof LogEventType)[keyof typeof LogEventType];

/**
 * A `LogEvent` is an object that that stores a `LogEventType` together with
 * any metadata that is needed to be logged.
 */
export interface LogEvent {
  readonly event: LogType;
  [key: string]: any;
}

