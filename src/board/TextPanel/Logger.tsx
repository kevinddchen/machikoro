import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import { LogEntry } from 'boardgame.io';
import React from 'react';
import has from 'lodash/has';

import { Log, MachikoroG, Version, displayName, supplyVariantName } from 'game';

/**
 * @extends BoardProps<MachikoroG>
 * @prop names - List of player names.
 */
interface LogProps extends BoardProps<MachikoroG> {
  names: string[];
}

/**
 * Player-viewable game log.
 *
 * The `log` plugin contains a list of `LogEntry` objects, one for each move.
 * Each `LogEntry` contains an array of `LogEvent` objects. We create these
 * `LogEvent` objects during the course of a move to log certain events, such
 * as the dice roll, how many coins a player takes, etc. All of these
 * `LogEvent` objects are parsed into strings and displayed in the log. See
 * 'src/game/log/parsers.ts' for more details on how these `LogEvent` objects
 * are created and parsed.
 * @prop textBoxRef - Reference to the log text box.
 */
export default class Logger extends React.Component<LogProps, object> {
  private textBoxRef: React.RefObject<HTMLDivElement>;

  constructor(props: LogProps) {
    super(props);
    this.textBoxRef = React.createRef();
  }

  // --- Methods --------------------------------------------------------------

  /**
   * Returns a string indicating the start of a turn for a given player.
   * @param turn - Turn number; starts at 0.
   * @param repeatedTurns - Total number of repeated turns so far.
   * @returns A string.
   */
  private logStartTurn = (turn: number, repeatedTurns: number): string => {
    const { ctx, names } = this.props;
    const player = ctx.playOrder[(turn - repeatedTurns) % names.length];
    const name = names[parseInt(player)];
    return `Turn ${(turn + 1).toString()}: ${name}`;
  };

  /**
   * Takes a `LogEntry` and parse its array of `LogEvent` objects into strings.
   * @param entry
   * @returns An array of strings.
   */
  private parseLogEntry = (entry: LogEntry): string[] => {
    const metadata: unknown = entry.metadata;
    const { names } = this.props;

    if (isLogEventArray(metadata)) {
      const lines: string[] = [];
      for (const event of metadata) {
        lines.push(Log.parseLogEvent(event, names));
      }
      return lines;
    } else {
      return [];
    }
  };

  /**
   * Parse an entire log into an array of strings.
   * @param log
   * @returns An array of strings.
   */
  private parseLog = (log: LogEntry[]): string[] => {
    const { G } = this.props;

    // remove undos
    const entries: LogEntry[] = [];
    for (const entry of log) {
      if (entry.action.type === 'UNDO') {
        entries.pop();
      } else {
        entries.push(entry);
      }
    }

    let lines: string[] = [];

    lines.push('Game Configuration:');
    lines.push('\u2013 ' + displayName(G.version, G.expansions));
    lines.push('\u2013 ' + supplyVariantName(G.supplyVariant));
    lines.push(' ');

    // for MK2, add a line to indicate the start of the initial build phase
    if (G.version === Version.MK2) {
      lines.push('(Start of initial build phase)');
    }

    // since there is no entry in the log for the first turn, we need to manually add it
    lines.push(this.logStartTurn(0, 0));

    let turn = 0;
    let repeated_turns = 0;

    for (const entry of entries) {
      // Special case for start of new turn
      if (entry.action.type === 'GAME_EVENT' && entry.action.payload.type === 'endTurn') {
        turn += 1;
        // If a 'next' player is specified, then a turn was repeated
        if (entry.action.payload.args && 'next' in entry.action.payload.args) {
          repeated_turns += 1;
        }
        lines.push(this.logStartTurn(turn, repeated_turns));

        // Usual case is a move
      } else if (entry.action.type === 'MAKE_MOVE') {
        const add_lines = this.parseLogEntry(entry);
        lines = lines.concat(add_lines);
      }
    }
    return lines;
  };

  // --- React ----------------------------------------------------------------

  componentDidUpdate() {
    // scroll log box to bottom
    if (this.textBoxRef.current) {
      this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
    }
  }

  componentDidMount() {
    // scroll log box to bottom
    if (this.textBoxRef.current) {
      this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
    }
  }

  // --- Render ---------------------------------------------------------------

  render() {
    const { log } = this.props;

    const lines = this.parseLog(log);
    const tbody: React.JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      tbody.push(
        <div key={i} className='log_div'>
          {lines[i]}
        </div>,
      );
    }

    return (
      <div className='div-row'>
        <div ref={this.textBoxRef} className='log_box'>
          {tbody}
        </div>
      </div>
    );
  }
}

/**
 * Returns true if the object is an array of `Log.LogEvent` objects.
 * @param obj
 * @returns
 */
const isLogEventArray = (obj: unknown): obj is Log.LogEvent[] => {
  return Array.isArray(obj) && obj.every((e) => has(e, 'type'));
};
