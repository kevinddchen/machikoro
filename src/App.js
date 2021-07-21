import './index.css';
import React from "react";
import Matchmaker from './matchmaking/Matchmaker';

import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer"
import { Machikoro } from "./Game";
import { MachikoroBoard } from "./Board";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: 0,
    };
  }

  componentDidMount() {
    console.log(`env: ${process.env.NODE_ENV}.`);
  }

  render() {
    if (this.state.state === 0) {
      return <Matchmaker/>;
    }
  }
}

export default App;
