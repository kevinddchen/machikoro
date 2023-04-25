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
  private entryBoxRef: React.RefObject<HTMLTextAreaElement>;
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

    console.log(chatMessages);

    const lines: string[] = [];
    for (const message of chatMessages) {
      let sender: string;
      if (message.sender === '') {
        sender = '[spectator]';
      } else {
        sender = names[parseInt(message.sender)];
      }

      const payload = (message.payload as string).trim();

      if (payload.length > 0) {
        lines.push(`${sender}: ${payload}`);
      }
    }
    return lines;
  };

  /**
   * When 'Enter' is pressed in the chat entry box, send the message and clear.
   * @param e
   */
  private entryHandleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const { sendChatMessage } = this.props;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // send the contents of the entry box as a message, then clear it
      if (this.entryBoxRef.current) {
        sendChatMessage(this.entryBoxRef.current.value);
        this.entryBoxRef.current.value = '';
      }
    }
  };

  // --- Render ---------------------------------------------------------------

  render() {
    const lines = this.parseChat();
    const tbody: JSX.Element[] = [];

    for (let i = 0; i < lines.length; i++) {
      tbody.push(
        <div key={i} className='log_div'>
          {lines[i]}
        </div>
      );
    }

    return (
      <div className='div-column'>
        <div className='div-row'>
          <div className='chat_box' ref={this.textBoxRef}>
            {tbody}
          </div>
        </div>
        <div className='div-row'>
          <textarea className='chat_entry' ref={this.entryBoxRef} onKeyDown={this.entryHandleKeyDown}></textarea>
        </div>
      </div>
    );
  }
}
