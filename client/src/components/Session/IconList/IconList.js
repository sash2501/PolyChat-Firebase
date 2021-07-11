import React, { useState, useEffect } from "react";
import { IIconProps, initializeIcons, IContextualMenuProps } from '@fluentui/react';
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';
import { IconButton, PrimaryButton, DefaultButton, CommandButton, IButtonStyles }  from '@fluentui/react/lib/Button';
import { Link } from "react-router-dom";
import { Panel } from '@fluentui/react/lib/Panel';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';

import { useBoolean, useId } from '@fluentui/react-hooks';

// import onlineIcon from '../../icons/onlineIcon.png';
// import closeIcon from '../../icons/closeIcon.png';

import './IconList.css';
import OnlinePeople from '../OnlinePeople/OnlinePeople'
import Subtitles from '../Subtitles/Subtitles'

initializeIcons();
const stackTokens: IStackTokens = { childrenGap: 20 };
const endCall: IIconProps = { iconName: 'DeclineCall' };
const micOffIcon: IIconProps = { iconName: 'MicOff' };
const micOnIcon: IIconProps = { iconName: 'Microphone' };
const camOffIcon: IIconProps = { iconName: 'VideoOff' };
const camOnIcon: IIconProps = { iconName: 'Video' };
const screenCast: IIconProps = { iconName: 'ScreenCast' };
const people: IIconProps = { iconName: 'People' };
const peopleAdd: IIconProps = { iconName: 'PeopleAdd' };
const mailAdd: IIconProps = { iconName: 'NewMail' };
const cc: IIconProps = { iconName: 'TextCallout' };
const editNote: IIconProps = { iconName: 'EditNote' };
const raiseHand: IIconProps = { iconName: 'HandsFree' };

const modelProps = {
  isBlocking: false,
  styles: { main: { maxWidth: 450 } },
};

const dialogContentProps = {
  type: DialogType.largeHeader,
  title: 'Participants in the call',
};

const buttonStyle = { borderRadius: '5px', boxShadow: '-4px 10px 35px -1px rgba(0, 0, 0, 0.75)'} //, width: '40px', height: '28px'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecognition()

mic.continuous = true
mic.interimResults = true
mic.lang = 'en-US'

const InfoBar = ({ user, room, media, myPeer, users, sub, setSub, sendSub, setShowSubtitle, showSubtitle, myStream, showNote, setShowNote, setIsScreen}) => {

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'emailMessage',
        text: 'Email message',
        iconProps: { iconName: 'NewMail' },
        href: "mailto:?subject=Join PolyChat Meeting&amp;body="+user+" is inviting you to a meeting. Join the meeting: http://localhost:3000/ Join the Room: "+room,
        target: '_blank'
      },
      {
        key: 'gmailInvite',
        text: 'Gmail invite',
        iconProps: { iconName: 'Mail' },
        href: "https://mail.google.com/mail/u/0/?fs=1&su=Join+Sassycode's+Team+meeting&body="+user+"+is+inviting+you+to+a+meeting.%0A%0AJoin+the+meeting:%0Ahttp://localhost:3000/%0A%0AJoin+Room:"+room+"&tf=cm",
        target: "_blank"
      },
    ],
  };

  //const [muted, { toggle: setMuted }] = useBoolean(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isOpen, { setTrue: openMessage, setFalse: dismissMessage }] = useBoolean(false);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true); 
  const [isListening, setIsListening] = useState(false)
  const [note, setNote] = useState(null)
  const [savedNotes, setSavedNotes] = useState([])
  const titleId = useId('title');

  useEffect(() => {
    handleListen()
    //console.log("listening mic")
  }, [isListening])

  const handleListen = () => {
    if (isListening) {
      mic.start()
      mic.onend = () => {
        //console.log('continue..')
        mic.start()
      }
    } else {
      mic.stop()
      mic.onend = () => {
        //console.log('Stopped Mic on Click')
      }
    }
    mic.onstart = () => {
      //console.log('Mics on')
    }

    mic.onresult = event => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
      //console.log(transcript)
      setNote(transcript)
      //setSub(transcript)
      if(transcript) {

        sendSub(transcript)
      }
      // setSavedNotes([...savedNotes, transcript])

      console.log("savedNotes in toggle",savedNotes)
      mic.onerror = event => {
        //console.log(event.error)
      }
    }
  }

  const handleSaveNote = () => {
    
    setSavedNotes([...savedNotes, note])
   
    setNote('')
  }

  const toggleCamera = () => {
        // Toggle Webcam on/off
        media.getVideoTracks()[0].enabled = !media.getVideoTracks()[0].enabled;
        //this.setState({ isCameraOn: !this.state.isCameraOn })
        setCameraOff(!cameraOff);

  }
  const toggleMicrophone= () => {
        // Toggle Mic on/off
        media.getAudioTracks()[0].enabled = !media.getAudioTracks()[0].enabled;

        setIsListening(prevState => !prevState)
        // setSavedNotes([...savedNotes, note])
        console.log("savedNotes in toggle",savedNotes)
        setNote('')
        setMuted(!muted);
    }

  const toggleSubtitle = () => {
    setShowSubtitle(!showSubtitle)    
        
  }

  const toggleNotes = () => {
    console.log("toggleNotes",showNote)
    setShowNote(!showNote)
  }

  const toggleSceen = () => {
    console.log("setting screen");
    setIsScreen(true);
  }
  
    

    function reload() {
      console.log("reloading")
      window.location.reload();
}

reload = function() {
  window.location.href = "http://localhost:3000/";
}

//console.log("call location in iconlist",window.location)
console.log("setmyPeer in iconlist",myPeer, myStream)


  return(
    <>
     <div className="box">
          {/* <button onClick={handleSaveNote} disabled={!note}>
              Save Note
          </button>
          <p>{note}</p> */}
          {/* {savedNotes.map(n => (
            <p key={n}>{n}</p>
          ))} */}
        </div>
  <div className="menuBar">
    <div className="roomNameContainer" >
      <h3>Room: {room}</h3>
    </div>
    <div className="commandBar">
      <Stack horizontal tokens={stackTokens} wrap={true}>
        <IconButton
          className="iconBtn"
          toggle
          checked={muted}
          title={muted ? 'Mic muted' : 'Mic unmuted'}
          iconProps={muted ? micOffIcon : micOnIcon}
          onClick={toggleMicrophone}
          style={buttonStyle}
        />          
       
        <IconButton
          className="iconBtn"
          toggle
          checked={cameraOff}
          title={cameraOff ? 'Cam Off' : 'Cam On'}
          iconProps={cameraOff ? camOffIcon : camOnIcon}
          onClick={toggleCamera}
          style={buttonStyle}
        />  
        {/* <DefaultButton 
          text="Screen" 
          onClick={toggleSceen} 
          iconProps={screenCast}
          style={buttonStyle}
        /> */}
        <Link to={`/`}>
          <DefaultButton 
          text="End Call" 
          iconProps={endCall}
          style={buttonStyle}
          onClick={reload}
          />  
        </Link> 
        <IconButton 
          className="iconBtn"
          iconProps={cc}
          title="Subtitle"
          onClick={toggleSubtitle}
          style={buttonStyle}
        />
        <IconButton 
          id="noteBtn"
          className="iconBtn"
          iconProps={editNote}
          title="Notes"
          onClick={toggleNotes}
          style={buttonStyle}
        />
        {/* <IconButton 
          className="iconBtn"
          iconProps={raiseHand}
          title="Hands"
          style={buttonStyle}
        /> */}
        <DefaultButton 
          secondaryText="See User List" 
          onClick={toggleHideDialog} 
          text="Participants" 
          iconProps={people}
          style={buttonStyle}
        />      
        <Dialog
          hidden={hideDialog}
          onDismiss={toggleHideDialog}
          dialogContentProps={dialogContentProps}
          modalProps={modelProps}
          minWidth={100}
        >
            <OnlinePeople users={users}/>
            <DialogFooter>
              <Stack tokens={{childrenGap: 10}} horizontal horizontalAlign='center'>
                <CommandButton 
                  text="Add Participants"
                  iconProps={peopleAdd}
                  menuProps={menuProps}
                />
                {/* <IconButton 
                  iconProps={mailAdd}
                  href="mailto:?subject=I wanted you to see this site&amp;body=Check out this site http://www.website.com."
                  target="_blank"
                  title="Share Mail"
                /> */}
                {/* <a href="mailto:?subject=I wanted you to see this site&amp;body=Check out this site http://www.website.com."
                  title="Share by Email"
                  target="_blank"
                  rel="noopener noreferrer">
                  <img src="http://png-2.findicons.com/files/icons/573/must_have/48/mail.png"/>
                </a> */}
                {/* <a href="https://mail.google.com/mail/u/0/?fs=1&su=Join+Sassycode's+Team+meeting&body=User+is+inviting+you+to+a+meeting.%0A%0AJoin+the+meeting:%0Ahttp://localhost:3000/%0A%0AJoin+Room:+_roomname_&tf=cm"
                  title="Share by Gmail"
                  target="_blank"
                  rel="noopener noreferrer">
                  <img src="https://img.icons8.com/ios/20/000000/google-logo--v1.png"/>
                </a> */}
              </Stack>
            </DialogFooter>
          </Dialog>
      </Stack>      
    </div>
  </div>
  </>
);
};

export default InfoBar;