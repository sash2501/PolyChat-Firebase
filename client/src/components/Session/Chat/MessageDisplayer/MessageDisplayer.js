import React from "react";
import ScrollToBottom from 'react-scroll-to-bottom';
import './MessageDisplayer.css';

import Message from './MessageBubble/Message';

const MessageDisplayer = ( {messages, name}) => {
  return(
  <ScrollToBottom className="messages">
    {messages.map((message, index) => <div key={index}><Message message={message} name={name}/></div>)}
  </ScrollToBottom>
)}
export default MessageDisplayer;