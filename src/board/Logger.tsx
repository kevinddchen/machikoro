import 'styles/main.css';

import { Ctx, LogEntry } from 'boardgame.io';
import React from 'react';

import { LogEventType, LogEvent } from 'game/logx';

const COIN = '\uD83D\uDFE4';

interface LogProps {
  ctx: Ctx;
  log: LogEntry[];
  names: string[];
}

/**
 * Player-viewable game log
 */
export default class Logger extends React.Component<LogProps, object> {
  private textBoxRef: React.RefObject<HTMLDivElement>;

  constructor(props: LogProps) {
    super(props);
    this.textBoxRef = React.createRef();
  }

  /**
   * Returns a string that indicates the start of a turn for a given player
   * @param turn Turn number
   * @param repeated_turns Total number of repeated turns so far
   * @returns
   */
  logStartTurn = (turn: number, repeated_turns: number): string => {
    const { ctx, names } = this.props;
    const player = ctx.playOrder[(turn - repeated_turns) % names.length];
    const name = names[parseInt(player)];
    return `Turn ${turn + 1}: ${name}`;
  };

  /**
   * Take a `LogEntry` and parse its array of `LogEvent` into strings.
   * @param entry
   * @param lines List of strings to append to.
   * @returns
   */
  parseLogEntry = (entry: LogEntry, lines: string[]): void => {
    const { metadata } = entry;
    if (metadata) {
      try {
        for (const event of metadata as LogEvent[]) {
          const line = this.parseLogEvent(event);
          if (line) lines.push(line);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  /**
   * Parse a single `LogEvent` to its string.
   * @param event
   * @returns
   */
  parseLogEvent = (event: LogEvent): string | null => {
    const { names } = this.props;
    const { eventType } = event;

    switch (eventType) {
      case LogEventType.RollOne: {
        return `\trolled ${event.roll}`;
      }
      case LogEventType.RollTwo: {
        const { dice } = event;
        const roll = dice[0] + dice[1];
        return `\trolled ${roll} (${dice})`;
      }
      case LogEventType.AddTwo: {
        return `\tchanged roll to ${event.roll}`;
      }
      case LogEventType.Earn: {
        const { player, amount, name } = event;
        return `\t${names[player]} earned ${amount} ${COIN}  (${name})`;
      }
      case LogEventType.Take: {
        const { from, to, amount, name } = event;
        return `\t${names[from]} paid ${names[to]} ${amount} ${COIN}  (${name})`;
      }
      case LogEventType.Buy: {
        return `\tbought ${event.name}`;
      }
      case LogEventType.Office: {
        const { player_est_name, opponent_est_name, opponent } = event;
        return `\ttraded ${player_est_name} for ${opponent_est_name} with ${names[opponent]}`;
      }
      case LogEventType.TunaRoll: {
        return `\t(Tuna boat roll: ${event.roll})`;
      }
      case LogEventType.EndGame: {
        return `Game over! Winner: ${names[event.winner]}`;
      }
      default:
        return null;
    }
  };

  componentDidUpdate() {
    // scroll log box to bottom
    if (this.textBoxRef.current) this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
  }

  render() {
    const { log } = this.props;

    // parse log and remove undos
    const clean_log: LogEntry[] = [];
    for (const entry of log) {
      if (entry.action.type === 'UNDO') clean_log.pop();
      else clean_log.push(entry);
    }

    const logBody: JSX.Element[] = [];
    let turn = 0;
    let repeated_turns = 0;

    // since there is no entry in the log for the first turn, we need to manually add it
    logBody.push(<div key={0}>{this.logStartTurn(turn, repeated_turns)}</div>);

    for (let i = 0; i < clean_log.length; i++) {
      const entry = clean_log[i];
      const lines: string[] = [];
      if (entry.action.type === 'GAME_EVENT' && entry.action.payload.type === 'endTurn') {
        // special case for start of new turn
        turn++;
        // if a 'next' player is specified, then a turn was repeated
        if (entry.action.payload.args && 'next' in entry.action.payload.args) repeated_turns++;
        lines.push(this.logStartTurn(turn, repeated_turns));
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
