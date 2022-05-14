import 'styles/main.css';

import { LogEntry } from 'boardgame.io';
import React from 'react';

import { LogEvent, LogLine, MachikoroG } from 'game';

const COIN = '\uD83D\uDFE4';

interface LogProps {
  G: MachikoroG;
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

  logStartTurn = (turn: number): string => {
    const { G, names } = this.props;
    const player = G.turn_order[turn % names.length];
    const name = names[parseInt(player)];
    return `Turn ${turn+1}: ${name}`;
  }

  /**
   * Take a `LogEntry` and parse its array of `LogLines` into strings.
   * @param entry 
   * @returns List of strings to display on the log.
   */
  parseLogEntry = (entry: LogEntry): string[] => {
    const { metadata } = entry;
    const lines: string[] = [];
    if (metadata) {
      try {
        for (const logLine of metadata as LogLine[]) {
          const line = this.parseLogLine(logLine);
          if (line) lines.push(line);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return lines;
  }

  /**
   * Parse a single `LogLine` to its string.
   * @param logLine 
   * @returns 
   */
  parseLogLine = (logLine: LogLine): string | null => {
    const { names } = this.props;
    const { event } = logLine;
    
    switch (event) {
      case LogEvent.RollOne: {
        return `\troll ${logLine.roll}`;
      }
      case LogEvent.RollTwo: {
        const { dice } = logLine;
        const roll = dice[0] + dice[1];
        return `\troll ${roll} (${dice})`;
      }
      case LogEvent.AddTwo: {
        return `\tchange roll to ${logLine.roll}`;
      }
      case LogEvent.Earn: {
        const { to, amount, name } = logLine;
        return `\t${names[to]} earns ${amount} ${COIN}  (${name})`;
      }
      case LogEvent.Take: {
        const { from, to, amount, name } = logLine;
        return `\t${names[from]} pays ${names[to]} ${amount} ${COIN}  (${name})`;
      }
      case LogEvent.Buy: {
        return `\tbuy ${logLine.name}`;
      }
      case LogEvent.Office: {
        const { player_est_name, opponent_est_name, opponent } = logLine;
        return `\ttrade ${player_est_name} for ${opponent_est_name} with ${names[opponent]}`;
      }
      case LogEvent.TunaRoll: {
        return `\t(tuna boat roll: ${logLine.roll})`;
      }
      case LogEvent.EndGame: {
        return `Game over! Winner: ${names[logLine.winner]}`;
      }
      default:
        return null;
    }
  }

  parseName = (x: string): string => this.props.names[parseInt(x[1])];

  componentDidUpdate() {
    // scroll log box to bottom
    if (this.textBoxRef.current) this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
  }

  render() {
    const { log } = this.props;
    console.log(log); // TODO: delete

    const logBody: JSX.Element[] = [];
    let turn = 0;

    // since there is no entry in the log for the first turn, we need to manually add it
    logBody.push(<div key={0}>{this.logStartTurn(turn)}</div>);

    for (let i = 0; i < log.length; i++) {
      const entry = log[i];
      let lines: string[];
      if (entry.action.type == "GAME_EVENT" && entry.action.payload.type == "endTurn" ) {
        // special case for start of new turn
        turn++;
        lines = [this.logStartTurn(entry.turn)];
      } else {
        lines = this.parseLogEntry(entry);
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
