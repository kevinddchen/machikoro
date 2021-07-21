import React from "react";
//import { parser } from "./LogParser"

export class MachikoroBoard extends React.Component {

  render() {

    const G = this.props.G;
    const ctx = this.props.ctx;
    const active = this.props.isActive;
    const player = this.props.playerID;

    function niceName({name, id}) {
      return (name === undefined) ? `player${id}` : name;
    }
    
    // menu
    const endTurn = () => {
      if (G.repeat_turn) {
        this.props.events.endTurn( {next: player} );
      } else {
        this.props.events.endTurn();
      }
    }
    const canRoll = (n) => (
      active && G.state === "roll" && ( n === 2 ? G.land_0[player] : true) &&
      (ctx.numMoves === 0 || (ctx.numMoves === 1 && G.land_3[player]))
    );
    const canKeep = active && G.state === "roll" && ctx.numMoves > 0;
    const canSkip = active && ["tv", "office1", "office2"].includes(G.state);
    const canEnd = active && (G.state === "buy" || G.state === "end");
    const menuTdStyle = (bool) => ({
      backgroundColor: bool ? "red" : "white",
      padding: "3px",
    });
    const canUndo = active;
    const rollBody = (
      <tr>
        <td style={menuTdStyle(canRoll(1))}>
          <button onClick={() => (canRoll(1) && this.props.moves.rollDice(1))}>Roll 1</button>
        </td>
        <td style={menuTdStyle(canRoll(2))}>
          <button onClick={() => (canRoll(2) && this.props.moves.rollDice(2))}>Roll 2</button>
        </td>
        <td style={menuTdStyle(canKeep)}>
          <button onClick={() => (canKeep && this.props.moves.commitRoll())}>
            Keep{ canKeep ? `(${G.roll})` : null}</button> 
        </td>
        <td style={menuTdStyle(canSkip)}>
          <button onClick={() => (canSkip && this.props.moves.skip())}>Skip</button>
        </td>
        <td style={menuTdStyle(canEnd)}>
          <button onClick={() => (canEnd && endTurn())}>End Turn</button>
        </td>
        <td width="100px"></td>
        <td>
          <button onClick={() => (canUndo && this.props.undo())}>Undo</button>
        </td>
      </tr>
    );

    // establishments
    const canBuyEst = (est) => {
      const buyable = active && G.state === "buy" && G.est_buyable[est] > 0 && G.money[player] >= G.est_cost[est];
      if (est === 6) return (buyable && G.est_6[player] === 0);
      if (est === 7) return (buyable && G.est_7[player] === 0);
      if (est === 8) return (buyable && G.est_8[player] === 0);
      return buyable;
    };
    const estTdStyle = (est) => ({
      position: "relative",
      cursor: canBuyEst(est) ? "pointer" : "unset",
      backgroundColor: canBuyEst(est) ? "red" : "white",
      padding: "3px",
      paddingBottom: "0px",
    });
    const estImgStyle = (est) => ({
      filter: G.est_buyable[est] > 0 ? "unset" : "grayscale(100%)",
      width: "100px",
    });
    const estDivStyle = {
      position: "absolute",
      top: "5px",
      left: "5px",
      color: "white",
      fontSize: "14px",
    };
    const estBody = [];
    for (let row=0; row<3; row++) {
      const tr = [];
      for (let col=0; col<5; col++) {
        const est = row*5 + col;
        tr.push(
          <td style={estTdStyle(est)} onClick={() => (canBuyEst(est) && this.props.moves.buyEst(est))}>
            <img style={estImgStyle(est)} src={`./assets/est${est}.gif`} alt=""/>
            <div style={estDivStyle}>{G.est_buyable[est]}({G.est_remaining[est]})</div>
          </td>
        );
      }
      estBody.push(<tr>{tr}</tr>);
    }

    // landmarks
    const canBuyLand = (land, p) => active && player == p && G.state === "buy" && G.money[player] >= G.land_cost[land] && !G[`land_${land}`][player];
    const landTdStyle = (land, p) => ({
      cursor: canBuyLand(land, p) ? "pointer" : "unset",
      backgroundColor: canBuyLand(land, p) ? "red" : "white",
      padding: "3px",
      paddingBottom: "0px",
    });
    const landImgStyle = (land, p) => ({
      filter: G[`land_${land}`][p] ? "unset" : "grayscale(100%)",
      width: "50px",
    });

    // players
    const coinTdStyle = {
      position: "relative",
    };
    const coinDivStyle = {
      position: "absolute",
      textAlign: "center",
      top: "5px",
      width: "100%",
      color: "white",
      fontSize: "14px",
    };
    const canTV = (p) => active && G.state === "tv" && p != player;
    const nameTdStyle = (p) => ({
      cursor: canTV(p) ? "pointer" : "unset",
      backgroundColor: canTV(p) ? "red" : "white",
      padding: "3px",
    });
    const nameDivStyle = {
      height: "25px",
      width: "80px", 
      background: "white",
      overflow: "hidden",
    };
    const canOffice = (p, est) => 
      active && ![6, 7, 8].includes(est) && 
      ((G.state === "office1" && p == player ) || (G.state === "office2" && p != player ));
    const miniDivStyle = (p, est) => ({
      cursor: canOffice(p, est) ? "pointer" : "unset",
      background: canOffice(p, est) ? "red" : "white",
      display: "flex", 
      justifyContent: "center",
    });
    const playerBody = [];
    for (let p=0; p<this.props.matchData.length; p++) {
      const td = []
      td.push(
        <table><tbody><tr>
          <td style={coinTdStyle}>
            <img width="25" src="./assets/coin.png" alt=""/>
            <div style={coinDivStyle}>{G.money[p]}</div>
          </td>
          <td style={nameTdStyle(p)} onClick={() => (canTV(p) && this.props.moves.doTV(p))}>
            <div style={nameDivStyle}>{niceName(this.props.matchData[p])}
            </div>
          </td>
        </tr></tbody></table>
      );
      td.push(
        <table><tbody>
          <tr>
            <td style={landTdStyle(0, p)} onClick={() => (canBuyLand(0, p) && this.props.moves.buyLand(0))}>
              <img style={landImgStyle(0, p)} src="./assets/land0.gif" alt=""/>
            </td>
            <td style={landTdStyle(1, p)} onClick={() => (canBuyLand(1, p) && this.props.moves.buyLand(1))}>
              <img style={landImgStyle(1, p)} src="./assets/land1.gif" alt=""/>
            </td>
          </tr>
          <tr>
            <td style={landTdStyle(2, p)} onClick={() => (canBuyLand(2, p) && this.props.moves.buyLand(2))}>
              <img style={landImgStyle(2, p)} src="./assets/land2.gif" alt=""/>
            </td>
            <td style={landTdStyle(3, p)} onClick={() => (canBuyLand(3, p) && this.props.moves.buyLand(3))}>
              <img style={landImgStyle(3, p)} src="./assets/land3.gif" alt=""/>
            </td>
          </tr>
        </tbody></table>
      );
      for (let est=0; est<15; est++) {
        for (let i=G[`est_${est}`][p]; i>0; i--) {
          td.push(
            <div style={miniDivStyle(p, est)} onClick={() => (canOffice(p, est) && this.props.moves.doOffice(p, est))}>
              <img width="100px" src={`./assets/est${est}_mini.png`} alt=""/>
            </div>);
        }
      }
      playerBody.push(<td>{td}</td>);
    }

    // log
    const logDivStyle = {
      height: "600px",
      width: "250px",
      border: "double",
      overflow: "auto",
      fontSize: "12px",
    };
    const logBody = [];
    // parse player names from the log, which are searched by a '#'
    const parseName = (x) => niceName(this.props.matchData[x[1]]);
    G.log.map( (line) => (logBody.push(<div style={{whiteSpace: "pre"}}>{line.replace(/#./g, parseName)}</div>)));

    // render board
    return (
      <div>
        <table><tbody>
          <tr valign="top">
            <td>
              <table><tbody>{rollBody}</tbody></table>
              <table><tbody>{estBody}</tbody></table>
            </td>
            {playerBody}
            <td><div id="log_box" style={logDivStyle}>{logBody}</div></td>
          </tr>
        </tbody></table>
      </div>
    );
  }

  componentDidUpdate() {
    // scroll log box to bottom
    let logBox = document.getElementById("log_box");
    logBox.scrollTop = logBox.scrollHeight;

    // auto commitRoll
    if (this.props.isActive && this.props.G.state === "roll"){
      if (this.props.G.land_3[this.props.ctx.currentPlayer]) {
        if (this.props.ctx.numMoves > 1) this.props.moves.commitRoll();
      } else {
        if (this.props.ctx.numMoves > 0) this.props.moves.commitRoll();
      }
    }

  }

}