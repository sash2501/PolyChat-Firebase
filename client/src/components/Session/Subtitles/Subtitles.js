import React, { useState, useEffect } from 'react'

import './Subtitles.css'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecognition()

mic.continuous = true
mic.interimResults = true
mic.lang = 'en-US'

function Subtitles({ subUser, subText}) {
  //console.log("sub in subtitlejs",singleSub.user)
  console.log("user in subtitlejs",subUser);
  console.log("text in subtitlejs",subText);
  const [subtitlesHere, setSubtitlesHere] = useState([])
  // if(subtitles !== null) {
  // setSubtitlesHere(subtitles)
  // }
  console.log(subtitlesHere)

  //const trimmedName = name.trim().toLowerCase();
  // if(user === trimmedName) {
  //   isSentByCurrentUser = true;
  // }
  // if(savedNotes.length>0) {
  // setSubtitles(savedNotes)
  // }
  // console.log("insubtitlejs",savedNotes)

// if(savedNotes.length > 0) {
//   savedNotes.map((n) => {
                
//                 return (                    
//                     console.log("sentences",n)
//                 );})
// }
  return (
    <>
        {/* <div className="">
        {subtitles.map(n => (
            <p key={n}>{n}</p>
          ))}
        </div> */}
        {/* {subtitles.map((subtitle, index) => <p>{subtitle.user}</p>)} */}
        <div className="subBox">
        <h3>{subUser}: {subText}</h3>
        </div>
    </>
  );
  

}

export default Subtitles;