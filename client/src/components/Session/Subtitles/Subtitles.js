import React, { useState, useEffect } from 'react'

import './Subtitles.css'

function Subtitles({ subUser, subText}) {
  //console.log("sub in subtitlejs",singleSub.user)
  console.log("user in subtitlejs",subUser);
  console.log("text in subtitlejs",subText);
  const [subtitlesHere, setSubtitlesHere] = useState([])
  // if(subtitles !== null) {
  // setSubtitlesHere(subtitles)
  // }
  console.log(subtitlesHere)

  return (
    <>
        <div className="subBox">
        {subUser? (<h3>{subUser}: {subText}</h3>) : <h3>Can't hear a thing!</h3>}
        </div>
    </>
  );
  

}

export default Subtitles;