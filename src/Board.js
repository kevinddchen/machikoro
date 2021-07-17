import React from "react";

export class MachikoroBoard extends React.Component {

  render() {

    const G = this.props.G;
    const ctx = this.props.ctx;
    const active = this.props.isActive;
    const player = this.props.playerID;
    
    // rolling 
    const canRoll = (n) => (active && G.state === 0 && ( n === 2 ? G.land_0[player] : true));
    const clickRoll = (n) => (canRoll(n) && this.props.moves.rollDice(n));
    const rollCellStyle = (n) => ({
      backgroundColor: canRoll(n) ? "red" : "white",
      padding: "3px",
    });
    const canEnd = (active && G.state === 2);
    const endCellStyle = {
      backgroundColor: canEnd ? "red" : "white",
      padding: "3px",
    }
    const rollBody = (
      <tr>
        <td style={rollCellStyle(1)}><button onClick={() => {clickRoll(1)}}>Roll 1</button></td>
        <td style={rollCellStyle(2)}><button onClick={() => {clickRoll(2)}}>Roll 2</button></td>
        <td width="50"></td>
        <td><button disabled="true" onClick={() => {this.props.undo()}}>Undo</button></td>
        <td style={endCellStyle}><button onClick={() => {canEnd && this.props.events.endTurn()}}>End Turn</button></td>
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
    const clickEst = (est) => (canBuyEst(est) && this.props.moves.buyEst(est));
    const estCellStyle = (est) => ({
      position: "relative",
      cursor: canBuyEst(est) ? "pointer" : "unset",
      backgroundColor: canBuyEst(est) ? "red" : "white",
      padding: "3px",
      paddingBottom: "0px",
    });
    const estImageStyle = (est) => ({
      filter: G.est_buyable[est] > 0 ? "unset" : "grayscale(100%)",
      width: "100px",
    })
    const estTextStyle = {
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
          <td style={estCellStyle(est)} onClick={() => {clickEst(est)}}>
            <img style={estImageStyle(est)} src={`./assets/est${est}.gif`}/>
            <div style={estTextStyle}>{G.est_buyable[est]}({G.est_remaining[est]})</div>
          </td>
        );
      }
      estBody.push(<tr>{tr}</tr>);
    }

    // landmarks
    const canBuyLand = (land, i_player) => (
      active && (G.state === 1) && (G.money[player] >= G.land_cost[land]) && !G[`land_${land}`][player]
    );
    const clickLand = (land, i_player) => {canBuyLand(land, i_player) && this.props.moves.buyLand(land)};
    const landCellStyle = (land, i_player) => ({
      cursor: canBuyLand(land, i_player) ? "pointer" : "unset",
      backgroundColor: canBuyLand(land, i_player) ? "red" : "white",
      padding: "3px",
      paddingBottom: "0px",
    });
    const landImageStyle = (land, i_player) => ({
      filter: G[`land_${land}`][i_player] ? "unset" : "grayscale(100%)",
      width: "75px",
    })

    // players
    const coinCellStyle = {
      position: "relative",
    };
    const coinTextStyle = {
      position: "absolute",
      textAlign: "center",
      top: "5px",
      width: "100%",
      color: "white",
      fontSize: "14px",
    };
    
    const playerBody = [];
    const data = this.props.matchData;
    for (let i=0; i<data.length; i++) {
      playerBody.push(
        <td>
          <table><tbody><tr>
            <td width="25">
              <div style={coinCellStyle}>
                <img width="25" src="./assets/coin.png"/>
                <div style={coinTextStyle}>{G.money[data[i].id]}</div>
              </div>
            </td>
            <td>{data[i].name}</td>
          </tr></tbody></table>
          <table><tbody>
            <tr>
              <td style={landCellStyle(0)} onClick={() => {clickLand(0)}}>
                <img style={landImageStyle(0, i)} src="./assets/land0.gif"/>
              </td>
              <td style={landCellStyle(1)} onClick={() => {clickLand(1)}}>
                <img style={landImageStyle(1, i)} src="./assets/land1.gif"/>
              </td>
            </tr>
            <tr>
              <td style={landCellStyle(2)} onClick={() => {clickLand(2)}}>
                <img style={landImageStyle(2, i)} src="./assets/land2.gif"/>
              </td>
              <td style={landCellStyle(3)} onClick={() => {clickLand(3)}}>
                <img style={landImageStyle(3, i)} src="./assets/land3.gif"/>
              </td>
            </tr>
          </tbody></table>
        </td>
      );
    }

    return (
      <div>
        <table><tbody>
          <tr valign="top">
            <td>
              <table><tbody>{rollBody}</tbody></table>
              <table><tbody>{estBody}</tbody></table>
            </td>
            {playerBody}
          </tr>
        </tbody></table>
      </div>
    );
  }
}