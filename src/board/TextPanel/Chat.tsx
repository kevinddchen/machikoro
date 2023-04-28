import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';

import { MachikoroG } from 'game';

/**
 * @extends BoardProps<MachikoroG>
 * @prop {string[]} names - List of player names.
 */
interface ChatProps extends BoardProps<MachikoroG> {
  names: string[];
}

/**
 * Chat messages from players. Messages are ephemeral and are lost upon refresh.
 * @prop {RefObject} entryBoxRef - Reference to the chat entry box.
 * @prop {RefObject} textBoxRef - Reference to the chat text box.
 */
export default class Chat extends React.Component<ChatProps, object> {
  private entryBoxRef: React.RefObject<HTMLInputElement>;
  private textBoxRef: React.RefObject<HTMLDivElement>;

  constructor(props: ChatProps) {
    super(props);
    this.entryBoxRef = React.createRef();
    this.textBoxRef = React.createRef();
  }

  // --- Methods --------------------------------------------------------------

  /**
   * Parse the chat log into a list of strings.
   * @returns An array of strings.
   */
  private parseChat = (): string[] => {
    const { chatMessages, names } = this.props;

    const lines: string[] = [];
    for (const message of chatMessages) {
      // when debugging, sometimes the sender is empty
      if (message.sender.length === 0) {
        continue;
      }

      const sender = names[parseInt(message.sender)];
      const payload = (message.payload as string).trim();

      if (payload.length > 0) {
        lines.push(`\t${sender}: ${payload}`);
      }
    }
    return lines;
  };

  /**
   * When 'Enter' is pressed in the chat entry box, send the message and clear.
   * @param e
   */
  private entryHandleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      this.sendChatAndClear();
    }
  };

  // Send the chat message and reset the field
  private sendChatAndClear = (): void => {
    const { sendChatMessage } = this.props;
    if (this.entryBoxRef.current) {
      sendChatMessage(this.entryBoxRef.current.value);
      this.entryBoxRef.current.value = '';
    }
  };

  // --- React ----------------------------------------------------------------

  componentDidUpdate() {
    // scroll chat box to bottom
    if (this.textBoxRef.current) {
      this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
    }
  }

  componentDidMount() {
    // scroll chat box to bottom
    if (this.textBoxRef.current) {
      this.textBoxRef.current.scrollTop = this.textBoxRef.current.scrollHeight;
    }
  }

  // --- Render ---------------------------------------------------------------

  render() {
    const lines = this.parseChat();
    const tbody: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      tbody.push(
        <div key={i} className='chat_div'>
          {lines[i]}
        </div>
      );
    }

    return (
      <div className='div-row'>
        <div className='chat-window' ref={this.textBoxRef}>
          <ul className='message-list'>{tbody}</ul>
        </div>
        <div className='chat-input'>
          <input
            id='chat-message'
            type='text'
            className='message-input'
            placeholder='Type your message here'
            ref={this.entryBoxRef}
            onKeyDown={(e) => this.entryHandleKeyDown(e)}
          ></input>
          <button className='send-button' onClick={this.sendChatAndClear}>
            Send
          </button>
        </div>
      </div>
    );
  }
}
