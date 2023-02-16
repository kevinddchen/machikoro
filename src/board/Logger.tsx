import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import { LogEntry } from 'boardgame.io';
import React from 'react';

import { Log, MachikoroG } from 'game';

const COIN = '\uD83D\uDFE4';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {string[]} names - List of player names.
 */
interface LogProps extends BoardProps<MachikoroG> {
  names: string[];
}

/**
 * Player-viewable game log.
 * @prop {RefObject} textBoxRef - Reference to the log text box.
 */
export default class Logger extends React.Component<LogProps, object> {
  private textBoxRef: React.RefObject<HTMLDivElement>;

  constructor(props: LogProps) {
    super(props);
    this.textBoxRef = React.createRef();
  }

  /**
   * @param turn - Turn number; starts at 0.
   * @param repeatedTurns - Total number of repeated turns so far.
   * @returns A string indicating the start of a turn for a given player.
   */
  logStartTurn = (turn: number, repeatedTurns: number): string => {
    const { ctx, names } = this.props;
    const player = ctx.playOrder[(turn - repeatedTurns) % names.length];
    const name = names[parseInt(player)];
    return `Turn ${turn + 1}: ${name}`;
  };

  /**
   * Takes a `LogEntry` and parse its array of `LogEvent` into strings. These
   * strings are appended to the `lines` array.
   * @param entry
   * @param lines - List of strings to append to.
   */
  parseLogEntry = (entry: LogEntry, lines: string[]): void => {
    const { metadata } = entry;
    if (metadata) {
      try {
        for (const event of metadata as Log.LogEvent[]) {
          const line = this.parseLogEvent(event);
          if (line !== null) {
            lines.push(line);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  /**
   * Parse a single `LogEvent` to its string.
   * @param event
   * @returns String to display in the log.
   */
  parseLogEvent = (event: Log.LogEvent): string | null => {
    const { names } = this.props;
    const { eventType } = event;

    switch (eventType) {
      case Log.LogEventType.RollOne: {
        return `\trolled ${event.roll}`;
      }
      case Log.LogEventType.RollTwo: {
        const { dice } = event;
        const roll = dice[0] + dice[1];
        return `\trolled ${roll} (${dice})`;
      }
      case Log.LogEventType.AddTwo: {
        return `\tchanged roll to ${event.roll}`;
      }
      case Log.LogEventType.Earn: {
        const { player, amount, name } = event;
        return `\t${names[player]} earned ${amount} ${COIN}  (${name})`;
      }
      case Log.LogEventType.Take: {
        const { from, to, amount, name } = event;
        return `\t${names[from]} paid ${names[to]} ${amount} ${COIN}  (${name})`;
      }
      case Log.LogEventType.Buy: {
        return `\tbought ${event.name}`;
      }
      case Log.LogEventType.Office: {
        const { player_est_name, opponent_est_name, opponent } = event;
        return `\ttraded ${player_est_name} for ${opponent_est_name} with ${names[opponent]}`;
      }
      case Log.LogEventType.TunaRoll: {
        return `\t(Tuna boat roll: ${event.roll})`;
      }
      case Log.LogEventType.EndGame: {
        return `Game over! Winner: ${names[event.winner]}`;
      }
      default:
        return null;
    }
  };

  componentDidUpdate() {
    // scroll log box to bottom
    if (this.textBoxRef.current) {
      this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
    }
  }

  render() {
    const { log } = this.props;

    // parse log and remove undos
    const cleanLog: LogEntry[] = [];
    for (const entry of log) {
      if (entry.action.type === 'UNDO') {
        cleanLog.pop();
      } else {
        cleanLog.push(entry);
      }
    }

    const logBody: JSX.Element[] = [];
    // since there is no entry in the log for the first turn, we need to manually add it
    logBody.push(<div key={-1}>{this.logStartTurn(0, 0)}</div>);

    let turn = 0;
    let repeated_turns = 0;

    for (let i = 0; i < cleanLog.length; i++) {
      const entry = cleanLog[i];
      const lines: string[] = [];
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
        this.parseLogEntry(entry, lines);
      }

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        logBody.push(
          <div key={`${i}_${j}`} className='log_div'>
            {line}
          </div>
        );
      }
    }

    return (
      <div ref={this.textBoxRef} id='log' className='log_box'>
        {logBody}
      </div>
    );
  }
}
