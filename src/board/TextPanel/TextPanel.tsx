import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import classNames from 'classnames';

import { MachikoroG } from 'game';
import { assertUnreachable } from 'common/typescript';

import Chat from './Chat';
import Logger from './Logger';

/**
 * Toggle state between log and chat.
 */
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

/**
 * Game log and chat, including buttons that toggle between them.
 */
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
    const { toggleState } = this.state;

    if (toggleState === ToggleState.Log) {
      return <Logger {...this.props} />;
    } else if (toggleState === ToggleState.Chat) {
      return <Chat {...this.props} />;
    } else {
      return assertUnreachable(toggleState);
    }
  };

  render() {
    const { toggleState } = this.state;

    return (
      <div className='div-column'>
        <div className='radio-inputs'>
          <label className='radio'>
            <input
              type="radio" 
              name="chatlog-select"
              className={classNames({ button_active: toggleState === ToggleState.Log })}
              onClick={() => this.setToggleState(ToggleState.Log)}
            />
            <span className="name">Game Log</span>
          </label>
          <label className='radio'>
            <input
              type="radio"
              name="chatlog-select"
              // className={classNames({ button_active: toggleState === ToggleState.Chat })}
              onClick={() => this.setToggleState(ToggleState.Chat)}
            />
            <span className="name">Chat</span>
          </label>
        </div>
        <div className='textpanel-box'>{this.renderToggledState()}</div>
      </div>
    );
  }
}
