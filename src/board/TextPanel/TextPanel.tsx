import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import { MachikoroG } from 'game';
import { assertUnreachable } from 'common/typescript';

import Logger from './Logger';

const ToggleState = {
  Log: 'Log',
  Chat: 'Chat',
} as const;

type ToggleState = (typeof ToggleState)[keyof typeof ToggleState];

/**
 * @extends BoardProps<MachikoroG>
 * @prop {string[]} names - List of player names.
 */
interface TextPanelProps extends BoardProps<MachikoroG> {
  names: string[];
}

/**
 * @prop {ToggleState} toggleState - Current toggle state.
 */
interface TextPanelState {
  toggleState: ToggleState;
}

export default class TextPanel extends React.Component<TextPanelProps, TextPanelState> {
  constructor(props: TextPanelProps) {
    super(props);
    this.state = {
      toggleState: ToggleState.Log,
    };
  }

  private setToggleState = (toggleState: ToggleState) => {
    this.setState({ toggleState });
  };

  // --- Render ---------------------------------------------------------------

  private renderToggledState = (): JSX.Element | null => {
    const { names } = this.props;
    const { toggleState } = this.state;

    if (toggleState === ToggleState.Log) {
      return <Logger {...this.props} names={names} />;
    } else if (toggleState === ToggleState.Chat) {
      return null;
    } else {
      return assertUnreachable(toggleState);
    }
  };

  render() {
    const { toggleState } = this.state;

    return (
      <div>
        <div className={classNames('div-row', 'textpanel_box')}>{this.renderToggledState()}</div>
        <div className='div-row'>
          <button
            className={classNames('button', { button_active: toggleState === ToggleState.Log })}
            onClick={() => this.setToggleState(ToggleState.Log)}
          >
            Log
          </button>
          <button
            className={classNames('button', { button_active: toggleState === ToggleState.Chat })}
            onClick={() => this.setToggleState(ToggleState.Chat)}
          >
            Chat
          </button>
        </div>
      </div>
    );
  }
}
