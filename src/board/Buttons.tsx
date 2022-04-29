import '../styles/main.css';
import React from 'react';
import classNames from 'classnames';

interface ButtonsProps {
  canRoll: (n: number) => boolean;
  rollOne: () => void;
  rollTwo: () => void;
  roll: number;
  canKeep: () => boolean; 
  keep: () => void; 
  canAddTwoKeep: () => boolean;
  addTwoKeep: () => void;
  canEndTurn: () => boolean;
  endTurn: () => void;
  undo: () => void;
}

/**
 * Buttons on top of the screen, i.e. Rolling, End Turn, and Undo.
 */
export default class Buttons extends React.Component<ButtonsProps, {}> {

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
      canEndTurn, 
      endTurn, 
      undo 
    } = this.props;

    const tbody = 
      <div className="div-row">
        <div className="div-column">
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
        <div className="div-column"> align="right" TODO: Fix
          <button className={classNames("button", {"button_active": canEndTurn()})} onClick={endTurn}>
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
