import './Log.css';
import React from 'react';

class Log extends React.Component {

  parseName = (x) => this.props.names[x[1]];

  componentDidUpdate() {
    // scroll log box to bottom
    let log = document.getElementById("log");
    log.scrollTop = log.scrollHeight;
  }

  render() {

    const { gamelog } = this.props;

    // parse player names from the log, which are searched by a '#'
    // replace '$' with emoji
    const logBody = [];
    for (let i=0; i<gamelog.length; i++) {
      let line = gamelog[i];
      line = line.replace(/\$/g, "\uD83D\uDFE4");
      line = line.replace(/#./g, this.parseName);
      logBody.push(<div className="log_div">{line}</div>);
    }

    return (
      <div id="log" className="log_box">{logBody}</div>
    );

  }
  
}

export default Log;
