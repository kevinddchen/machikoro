import '../styles/game.css';
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
      canAddTwoKeep,
      addTwoKeep,
      canEnd, 
      endTurn, 
      undo 
    } = this.props;

    const tbody = 
      <tr>
        <td className={classNames("button_td", {"button_active": canRoll(1)})}>
          <button className="button_button" onClick={rollOne}>
            Roll 1
          </button>
        </td>
        <td className={classNames("button_td", {"button_active": canRoll(2)})}>
          <button className="button_button" onClick={rollTwo}>
            Roll 2
          </button>
        </td>
        <td className={classNames("button_td", {"button_active": canKeep()})}>
          <button className={classNames("button_button", {"button_hide": !canKeep()})}
            onClick={keep}
          >
            Keep({roll})
          </button>
        </td>
        <td className={classNames("button_td", {"button_active": canAddTwoKeep()})}>
          <button className={classNames("button_button", {"button_hide": !canAddTwoKeep()})}
            onClick={addTwoKeep}
          >
            Keep({roll+2})
          </button>
        </td>
        <td className={classNames("button_td", {"button_active": canEnd()})}>
          <button className="button_button" onClick={endTurn}>
            End Turn
          </button>
        </td>
        <td>
          <button className="button_button" onClick={undo}>
            Undo
          </button>
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
