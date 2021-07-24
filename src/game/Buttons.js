import './Buttons.css';
import React from 'react';

class Buttons extends React.Component {

  render() {

    const { 
      canRoll, 
      rollOne, 
      rollTwo, 
      roll, 
      canKeep, 
      keep, 
      canEnd, 
      endTurn, 
      undo 
    } = this.props;

    const tbody = 
      <tr>
        <td className={canRoll(1) ? "buttons_td_on" : "buttons_td"}>
          <button className="buttons_button" onClick={rollOne}>Roll 1</button>
        </td>
        <td className={canRoll(2) ? "buttons_td_on" : "buttons_td"}>
          <button className="buttons_button" onClick={rollTwo}>Roll 2</button>
        </td>
        <td className={canKeep() ? "buttons_td_on" : "buttons_td"}>
          <button className={canKeep() ? "buttons_button" : "buttons_hide"}
                  onClick={keep}>Keep({roll})</button>
        </td>
        <td className={canEnd() ? "buttons_td_on" : "buttons_td"}>
          <button className="buttons_button" onClick={endTurn}>End Turn</button>
        </td>
        <td>
          <button className="buttons_button" onClick={undo}>Undo</button>
        </td>
      </tr>;

    return (
      <div>
        <table><tbody>{tbody}</tbody></table>
      </div>
    );

  }
  
}

export default Buttons;
