import 'styles/main.css';

import { BoardProps } from 'boardgame.io/react';
import React from 'react';

import { MachikoroG } from 'game';

/**
 * Chat messages from players. Messages are ephemeral and are lost upon refresh.
 * @prop {RefObject} entryBoxRef - Reference to the chat entry box.
 * @prop {RefObject} textBoxRef - Reference to the chat text box.
 */
export default class Chat extends React.Component<BoardProps<MachikoroG>, object> {
  private entryBoxRef: React.RefObject<HTMLTextAreaElement>;
  private textBoxRef: React.RefObject<HTMLDivElement>;

  constructor(props: BoardProps<MachikoroG>) {
    super(props);
    this.entryBoxRef = React.createRef();
    this.textBoxRef = React.createRef();
  }

  // --- Methods --------------------------------------------------------------

  private entryHandleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      console.log(this.entryBoxRef.current);
      if (this.entryBoxRef.current) {
        console.log(this.entryBoxRef.current.value);
        this.entryBoxRef.current.value = '';
      }
    }
  };

  // --- Render ---------------------------------------------------------------

  render() {
    return (
      <div className='div-column'>
        <div className='div-row'>
          <div className='chat_box'></div>
        </div>
        <div className='div-row'>
          <textarea className='chat_entry' ref={this.entryBoxRef} onKeyDown={this.entryHandleKeyDown}></textarea>
        </div>
      </div>
    );
  }
}
