import React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { IIconProps, initializeIcons } from '@fluentui/react';

// import onlineIcon from '../../icons/onlineIcon.png';
// import closeIcon from '../../icons/closeIcon.png';

import './Input.css';
initializeIcons();

const send: IIconProps = { iconName: 'Send' };

const Input = ({ message, setMessage, sendMessage }) => (
  <form className="form">
    <input
      className="input"
      type="text"
      placeholder="Type a message..."
      value={message}
      onChange={({ target: { value } }) => setMessage(value)}
      onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
    />
    <IconButton className="sendButton" 
    iconProps={send}
    title="Send"
    onClick={(event) => sendMessage(event)} />
  </form>  
)
export default Input;