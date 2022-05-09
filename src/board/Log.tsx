import 'styles/main.css';

import React from 'react';

import type { MachikoroG } from 'game';

interface LogProps {
  G: MachikoroG;
  names: string[];
}

/**
 * Player-viewable game log
 */
export default class Log extends React.Component<LogProps, object> {
  private logRef: React.RefObject<HTMLDivElement>;

  constructor(props: LogProps) {
    super(props);
    this.logRef = React.createRef();
  }

  parseName = (x: string): string => this.props.names[parseInt(x[1])];

  componentDidUpdate() {
    // scroll log box to bottom
    if (this.logRef.current) this.logRef.current.scrollTop = this.logRef.current.scrollHeight;
  }

  render() {
    const { G } = this.props;

    const logBody: JSX.Element[] = [];
    for (let i = 0; i < G.log.length; i++) {
      const { id } = G.log[i];
      let { line } = G.log[i];
      line = line.replace(/\$/g, '\uD83D\uDFE4'); // replace '$' with coin emoji
      line = line.replace(/#\d+/g, this.parseName); // parse player names, searched by '#N' where N is the playerID
      logBody.push(
        <div key={id} className='log_div'>
          {line}
        </div>
      );
    }

    return (
      <div ref={this.logRef} id='log' className='log_box'>
        {logBody}
      </div>
    );
  }
}
