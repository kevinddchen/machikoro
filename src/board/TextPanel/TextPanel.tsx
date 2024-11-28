import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';

import { MachikoroG } from 'game';

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
 * @prop names - List of player names.
 * @prop clientPlayer - Player ID of the client, or null if the
 * client is not a player.
 */
interface TextPanelProps extends BoardProps<MachikoroG> {
  names: string[];
  clientPlayer: number | null;
}

/**
 * @prop toggleState - Current toggle state.
 */
interface TextPanelState {
  toggleState: ToggleState;
}

/**
 * Game log and chat, including buttons that toggle between them.
 * @prop numReadChats - Number of read chat messages.
 * @prop logRadioRef - Reference to the log radio button.
 * @prop chatRadioRef - Reference to the chat radio button.
 */
export default class TextPanel extends React.Component<TextPanelProps, TextPanelState> {
  private numReadChats: number;
  private logRadioRef: React.RefObject<HTMLInputElement>;
  private chatRadioRef: React.RefObject<HTMLInputElement>;

  constructor(props: TextPanelProps) {
    super(props);
    this.state = {
      toggleState: ToggleState.Log,
    };
    this.numReadChats = 0; // on refresh, all chats are erased since they are ephemeral
    this.logRadioRef = React.createRef();
    this.chatRadioRef = React.createRef();
  }

  private setToggleState = (toggleState: ToggleState) => {
    this.setState({ toggleState });
  };

  // --- React ----------------------------------------------------------------

  componentDidMount() {
    // by default, select log radio button
    if (this.logRadioRef.current) {
      this.logRadioRef.current.checked = true;
    }
  }

  // --- Render ---------------------------------------------------------------

  private renderToggledState = (): React.JSX.Element => {
    const { toggleState } = this.state;

    switch (toggleState) {
      case ToggleState.Log:
        return <Logger {...this.props} />;
      case ToggleState.Chat:
        return <Chat {...this.props} />;
    }
  };

  render() {
    const { chatMessages } = this.props;
    const { toggleState } = this.state;

    let chatButtonText = 'Chat';

    const numChats = chatMessages.length;
    switch (toggleState) {
      case ToggleState.Log: {
        // if there are unread chat messages, add a number to the button
        if (numChats > this.numReadChats) {
          chatButtonText += ` (${(numChats - this.numReadChats).toString()})`;
        }
        break;
      }
      case ToggleState.Chat: {
        // update the number of read chats
        this.numReadChats = numChats;
        break;
      }
    }

    return (
      <div className='div-column'>
        <div className='radio-inputs'>
          <label className='radio'>
            <input
              type='radio'
              name='chatlog-select'
              ref={this.logRadioRef}
              onClick={() => {
                this.setToggleState(ToggleState.Log);
              }}
            />
            <span className='name'>Game Log</span>
          </label>
          <label className='radio'>
            <input
              type='radio'
              name='chatlog-select'
              ref={this.chatRadioRef}
              onClick={() => {
                this.setToggleState(ToggleState.Chat);
              }}
            />
            <span className='name'>{chatButtonText}</span>
          </label>
        </div>
        <div className='textpanel-box'>{this.renderToggledState()}</div>
      </div>
    );
  }
}
