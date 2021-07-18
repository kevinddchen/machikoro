import React from "react";

export class MachikoroBoard extends React.Component {

  render() {

    const G = this.props.G;
    const ctx = this.props.ctx;
    const active = this.props.isActive;
    const player = this.props.playerID;
    
    // menu
    const canRoll = (n) => (active && (G.state === 0)&& ( n === 2 ? G.land_0[player] : true));
    const canKeep = (active && (G.state === 0) && (ctx.numMoves === 1));
    const canUndo = (active && G.state === 2);
    const canEnd = (active && (G.state === 1 || G.state === 2));
    const menuTdStyle = (bool) => ({
      backgroundColor: bool ? "red" : "white",
      padding: "3px",
    });
    const rollBody = (
      <tr>
        <td style={menuTdStyle(canRoll(1))}>
          <button onClick={() => (canRoll(1) && this.props.moves.rollDice(1))}>Roll 1</button>
        </td>
        <td style={menuTdStyle(canRoll(2))}>
          <button onClick={() => (canRoll(2) && this.props.moves.rollDice(2))}>Roll 2</button>
        </td>
        <td style={menuTdStyle(canKeep)}>
          <button onClick={() => (canKeep && this.props.moves.commitRoll())}>Keep</button>
        </td>
        <td style={menuTdStyle(canUndo)}>
          <button onClick={() => (canUndo && this.props.undo())}>Undo</button>
        </td>
        <td style={menuTdStyle(canEnd)}>
          <button onClick={() => (canEnd && this.props.events.endTurn())}>End Turn</button>
        </td>
      </tr>
    );

    // establishments
    const canBuyEst = (est) => {
      const buyable = active && (G.state === 1) && (G.est_buyable[est] > 0) && (G.money[player] >= G.est_cost[est]);
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
    const canBuyLand = (land, p) => (player == p) && active && (G.state === 1) && (G.money[player] >= G.land_cost[land]) && !G[`land_${land}`][player];
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
    const miniDivStyle = {
      display: "flex", 
      justifyContent: "center",
    };

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
    
    const playerBody = [];
    const data = this.props.matchData;
    for (let p=0; p<data.length; p++) {
      const td = []
      td.push(
        <table><tbody><tr>
          <td style={coinTdStyle}>
            <img width="25" src="./assets/coin.png" alt=""/>
            <div style={coinDivStyle}>{G.money[data[p].id]}</div>
          </td>
          <td>{data[p].name}</td>
        </tr></tbody></table>
      );
      td.push(
        <table><tbody>
          <tr>
            <td style={landTdStyle(0, p)} onClick={() => (canBuyLand(0, p) && this.props.moves.buyLand(0))}>
              <img style={landImgStyle(0, p)} src="./assets/land0.gif" alt=""/>
            </td>
            <td style={landTdStyle(1, p)} onClick={() => (canBuyLand(1, p) && this.props.moves.buyLand(0))}>
              <img style={landImgStyle(1, p)} src="./assets/land1.gif" alt=""/>
            </td>
          </tr>
          <tr>
            <td style={landTdStyle(2, p)} onClick={() => (canBuyLand(2, p) && this.props.moves.buyLand(0))}>
              <img style={landImgStyle(2, p)} src="./assets/land2.gif" alt=""/>
            </td>
            <td style={landTdStyle(3, p)} onClick={() => (canBuyLand(3, p) && this.props.moves.buyLand(0))}>
              <img style={landImgStyle(3, p)} src="./assets/land3.gif" alt=""/>
            </td>
          </tr>
        </tbody></table>
      );
      for (let est=0; est<15; est++) {
        for (let i=G[`est_${est}`][p]; i>0; i--) {
          td.push(<div style={miniDivStyle}><img width="100px" src={`./assets/est${est}_mini.png`} alt=""/></div>);
        }
      }
      playerBody.push(<td>{td}</td>);
    }

    // log
    const parseLine = (str) => (str.replace('/#./g', (x) => this.props.matchData[x[1]].name));
    const logDivStyle = {
      height: "200px",
      width: "auto",
      border: "double",
      overflow: "auto",
      fontSize: "12px",
    };
    const logBody = [];
    for (let i=0; i<G.log.length; i++) {
      let line = G.log[i].replace(/#./g, (x) => ((x[1].name === undefined) ? `"${x[1]}"` : this.props.matchData[x[1]].name));
      //let line = G.log[i];
      logBody.push(<div style={{whiteSpace: "pre"}}>{line}</div>);
    }
    
    // render board
    return (
      <div>
        <table><tbody>
          <tr valign="top">
            <td>
              <table><tbody>{rollBody}</tbody></table>
              <table><tbody>{estBody}</tbody></table>
              <div id="log_box" style={logDivStyle}>{logBody}</div>
            </td>
            {playerBody}
          </tr>
        </tbody></table>
      </div>
    );
  }

  componentDidUpdate() {
    let box = document.getElementById("log_box");
    box.scrollTop = box.scrollHeight;

    // handle commit roll
    if (this.props.G.state === 0){
      if (this.props.G.land_3[this.props.ctx.currentPlayer]) {
        if (this.props.ctx.numMoves > 1) this.props.moves.commitRoll();
      } else {
        if (this.props.ctx.numMoves > 0) this.props.moves.commitRoll();
      }
    }

  }

}