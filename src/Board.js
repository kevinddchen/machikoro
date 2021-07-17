import React from "react";

export class MachikoroBoard extends React.Component {

  clickEst(est) {
    console.log("est");
    this.props.moves.buyEst(est);
  }

  clickRoll(n) {
    console.log("roll");
    this.props.moves.rollDice(n);
  }

  render() {

    const active = this.props.isActive;
    const G = this.props.G;
    const player = G.currPlayer;
    
    const canRoll = active && G.state === 0;
    const canRollTwo = canRoll && G.landmark_1[player];
    const canBuy = active && G.state === 1;
    const canBuyEst = (est) => (canBuy && (G.est_buyable[est] > 0) && (G.money[player] >= G.est_cost[est]));

    const rollOneCellStyle = {
      backgroundColor: canRoll ? "red" : "white",
      padding: "3px",
    };
    const rollTwoCellStyle = {
      backgroundColor: canRollTwo ? "red" : "white",
      padding: "3px",
    };
    const estCellStyle = est => ({
      position: "relative",
      cursor: "pointer",
      backgroundColor: canBuyEst(est) ? "red" : "white",
      padding: "3px",
      paddingBottom: "0px",
    });
    const estTextStyle = {
      position: "absolute",
      top: "5px",
      left: "6px",
      color: "white",
      fontSize: "14px",
    }

    // establishments
    const tbody = [];
    for (let row=0; row<3; row++) {
      const tr = [];
      for (let col=0; col<5; col++) {
        const est = row*5 + col;
        const src = `./assets/est${est+1}_e.gif`;
        tr.push(
          <td key={col} style={estCellStyle(est)} onClick={() => (canBuyEst(est) && this.clickEst(est))}>
            <div style={estTextStyle}>{this.props.G.est_buyable[est]}({this.props.G.est_remaining[est]})</div>
            <img width="100" src={src}/>
          </td>
        );
      }
      tbody.push(<tr key={row}>{tr}</tr>);
    }

    return (
      <div>
        <table><tbody>
          <tr>
            <td style={rollOneCellStyle}><button onClick={() => (canRoll && this.clickRoll(1))}>Roll 1</button></td>
            <td style={rollTwoCellStyle}><button onClick={() => (canRollTwo && this.clickRoll(2))}>Roll 2</button></td>
          </tr>
        </tbody></table>
        <table><tbody>
          {tbody}
        </tbody></table>
      </div>
    );
  }
}