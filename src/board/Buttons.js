import '../styles/main.css';
import React from 'react';
import classNames from 'classnames';

/**
 * Buttons on top of the screen, i.e. Rolling, End Turn, and Undo.
 */

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
      <div class="div-row">
        <div class="div-column">
          <button className={classNames("button", {"button_active": canRoll(1)})} onClick={rollOne}>
            Roll 1
          </button>

          <button className={classNames("button", {"button_active": canRoll(2)})} onClick={rollTwo}>
            Roll 2
          </button>

          <button className={classNames("button", {"button_active": canKeep()}, 
            {"button_hide": !canKeep()})}
            onClick={keep}
          >
            Keep ({roll})
          </button>

          <button className={classNames("button", {"button_active": canAddTwoKeep()},
            {"button_hide": !canAddTwoKeep()})} 
            onClick={addTwoKeep}
          >
            Keep ({roll+2})
          </button>
        </div>
        <div class="div-column" align="right">
          <button className={classNames("button", {"button_active": canEnd()})} onClick={endTurn}>
            End Turn
          </button>

          <button className="button" onClick={undo}>
            Undo
          </button>
        </div>
      </div>;

    return (
      <div>{tbody}</div>
    );

  }
  
}

export default Buttons;
