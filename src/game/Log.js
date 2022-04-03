import '../styles/main.css';
import React from 'react';

class Log extends React.Component {

  parseName = (x) => this.props.names[x[1]];

  componentDidUpdate() {
    // scroll log box to bottom
    let log = document.getElementById("log");
    log.scrollTop = log.scrollHeight;
  }

  render() {

    const { log } = this.props;

    const logBody = [];
    for (let i=0; i<log.length; i++) {
      let { id, msg } = log[i];
      msg = msg.replace(/\$/g, "\uD83D\uDFE4"); // replace '$' with coin emoji
      msg = msg.replace(/#./g, this.parseName); // parse player names, which are searched by a '#'
      logBody.push(<div key={id} className="log_div">{msg}</div>);
    }

    return (
      <div id="log" className="log_box">{logBody}</div>
    );

  }
  
}

export default Log;
