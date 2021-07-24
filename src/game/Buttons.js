import './Buttons.css';
import React from 'react';
import classNames from 'classnames';

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
        <td className={classNames("buttons_td", {"active": canRoll(1)})}>
          <button className="buttons_button" onClick={rollOne}>Roll 1</button>
        </td>
        <td className={classNames("buttons_td", {"active": canRoll(2)})}>
          <button className="buttons_button" onClick={rollTwo}>Roll 2</button>
        </td>
        <td className={classNames("buttons_td", {"active": canKeep()})}>
          <button className={canKeep() ? "buttons_button" : "buttons_hide"}
                  onClick={keep}>Keep({roll})</button>
        </td>
        <td className={classNames("buttons_td", {"active": canEnd()})}>
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
