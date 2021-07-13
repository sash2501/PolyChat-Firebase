import React, { useState, useEffect, useRef } from "react";
//import Peer from 'peer';
import Peer from "simple-peer";
import queryString from 'query-string';
import styled from "styled-components";
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { useParams, useLocation, useHistory } from "react-router-dom";


import InfoBar from '../Chat/MessageBar/MessageBar';
import MessageDisplayer from '../Chat/MessageDisplayer/MessageDisplayer';
import IconList from '../IconList/IconList';
import Input from '../Chat/Input/Input';
import Video from '../Video/Video'
import Subtitles from '../Subtitles/Subtitles';
// import VideoGrid from '../VideoGrid/VideoGrid'

//import OnlinePeople from '../OnlinePeople/OnlinePeople';

import './Call.css';
// client-side
const io = require("socket.io-client");
const ENDPOINT = 'http://localhost:5000'
//const stackTokens: IStackTokens = { childrenGap: 20 };

let socket;

const itemStyles: React.CSSProperties = {
  alignItems: 'center',
  background: '#2dbd6e',
  display: 'flex',
  height: 50,
  justifyContent: 'center',
  width: 50,
};

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const buttonStyle = { borderRadius: '5px', boxShadow: '-4px 10px 35px -1px rgba(0, 0, 0, 0.75)'}

const stackTokens: IStackTokens = {
    childrenGap: `10 10`, //rowGap + ' ' + columnGap,
    padding: `10px 10px 10px 10px`, //`${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
  };

const Call = ( {location}) => {

  location = useLocation();
  const history = useHistory();
  const [username, setUserName] = useState('');
  const [roomname, setRoomName] = useState(''); //initialize as empty string
  const [message, setMessage] = useState(''); //store message
  const [messageList, setMessageList] = useState([]); //store all messages
  const [sub, setSub] = useState(''); //store subs
  const [subList, setSubList] = useState([]); //store all subs
  const [usersInRoom, setUsersInRoom] = useState('');
  const [myStream, setMyStream] = useState(null)  
  //----------------------------------------------------
  const [peersList, setPeersList] = useState([]); //ui reflection of state
  const userVideo = useRef();
  const peersRef = useRef([]); //related to ui and visuals
  const [callEnded, setCallEnded] = useState(false);
  //Subtitle
  const [subUser, setSubUser] = useState('');
  const [subText, setSubText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  //Notes
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [myPeer, setmyPeer] = useState(null);
  const [isScreen, setIsScreen] = useState(false);
  const [raiseSocketID, setRaisedSocketID] = useState('');
  const [lowerSocketID, setLoweredSocketID] = useState('');
  const [isRaised, setIsRaised] = useState(false);
  
  //NoteEditor
  const editor = document.getElementById("editor")
  const textAreaRef = useRef(null);

  //Board
  
  useEffect( () => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setUserName(name);
    setRoomName(room);


    //socket = io.connect("/");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        //userVideo.current.srcObject = stream;
        setMyStream(stream);
        stream.getVideoTracks()[0].enabled = false; 
        stream.getAudioTracks()[0].enabled = false;
        socket.emit("join room", {name, room}, error => {
          if(error) {
            history.push('/login');
            alert(error);

        }});

        
        socket.on("all users", users => {
          console.log("users in room thru socket", users);
          setUsersInRoom(users);
            const peers = [];
            users.forEach(user => {
                console.log(user.id);
                const peer = createPeer(user.id, socket.id, stream);
                peersRef.current.push({
                    peerID: user.id,
                    peer,
                })
                peers.push({
                  peerID: user.id,
                  peer,
                  });
            })
            //console.log("peerlisist after create peer", peers);
            setPeersList(peers);
        })

        socket.on("user joined", payload => {
            console.log("user joined");
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
                peerID: payload.callerID,
                peer,
            })

            const peerObj = {              
              peerID: payload.callerID,
              peer
            }
            
            console.log("user joined obj", peerObj);
            
            setPeersList(users => [...users, peerObj]);
            //console.log("[eerslist after add peer", peersList);
        });

        socket.on("receiving returned signal", payload => {
            const item = peersRef.current.find(p => p.peerID === payload.id);
            item.peer.signal(payload.signal);
        });

        socket.on('user left', id => {

          const peerObj = peersRef.current.find(p => p.peerID === id);
          if(peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter(p => p.peerID !== id);
          peersRef.current = peers;
          setPeersList(peers);
          //peersList[callerID].destroy();
          setCallEnded(true);
          console.log(id," left");
        })
    })


    // return () => {
    //     //disconnect useEffect hook -  unmounting of component
    //     socket.emit('disconnect');

    //     socket.off() //remove the one client instance
    //   }
   
  }, [ENDPOINT]);
  
  ///handling messages recieved - store the messages
  useEffect(() => {
    socket.on('message', (message)=>{
      setMessageList(messageList => [...messageList, message]);
    });

    socket.on("roomData", ({users }) => {
      setUsersInRoom(users);
    });

    socket.on('transcript', (transcript)=> {
          console.log("transcript object",transcript)
          const subTrial = {              
              user: transcript.user,
              text: transcript.text,
            }
            console.log("user and text",transcript.user, transcript.text);
          setSubUser(transcript.user);
          setSubText(transcript.text);

          setSubList([subTrial]);
          
          console.log(subTrial)
          setSub(subTrial);
          console.log("sub",sub)         
          
    })

    socket.on('notes', (notes) => {
      console.log("notes object", notes);
      console.log("notes text", notes.text)
      setNote(notes.text)
    })

    socket.on('raise', (person) => {
      console.log("received raising",person.id,person.name)
      setRaisedSocketID(person.id);
      setLoweredSocketID('');
    })

    socket.on('lower', (person) => {
      console.log("received lowering",person.id,person.name)
      setLoweredSocketID(person.id);
      setRaisedSocketID('')
    })
  },[]);

  console.log("sub out",sub)
  console.log("sublist out",subList);
          

  function createPeer(userToSignal, callerID, stream) {
        console.log("in create peer", callerID, username);
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socket.emit("sending signal", { userToSignal, callerID, signal , username})
        })
        // myPeer.current = peer;
        return peer;
    }

  function addPeer(incomingSignal, callerID, stream) {
      console.log("in addPeer", callerID);
      const peer = new Peer({
          initiator: false,
          trickle: false,
          stream,
      })

      peer.on("signal", signal => {
          socket.emit("returning signal", { signal, callerID })
      })

      peer.signal(incomingSignal);
      peer.on('close', () => {
          console.log("closing peer");
      })
      return peer;
    }

  //sending messages
  const sendMessage = (event) => {
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', message, () => setMessage(''));
    }
  }

  const sendTranscript = (transcript) => {
    console.log("Sending sub");
    console.log("Sub is full with", transcript);

    if(transcript) {
      
      socket.emit('sendTranscript', transcript, () => console.log("sending it rn transcript"));
    }
  }

  const toggleRaise = () => {
    if(!isRaised) {
      userhandRaise()
    }
    else {
      userhandLower()
    }
    setIsRaised(!isRaised)    
  }

  const userhandRaise = () => {
    console.log(username," raised their hand");
    var event = "raise"
    socket.emit('userRaise',{username, event}, () => console.log("username is raising hand in client"));
  }

  const userhandLower = () => {
    console.log(username," raised their hand");
    var event = "lower"    
    socket.emit('userRaise',{username, event}, () => console.log("username is lowering hand in client"));
  }

  const sendNotes = (value) => {
    console.log("Sending notes", value)    
      if(value.length>=0) {
        console.log("emiting notes")
        socket.emit('sendNotes', value ,() => console.log("sending notes to server"));
    }    
  }

  if(editor) {
    editor.addEventListener("keyup", (evt) => {
      const text = editor.value
      console.log("editor txt",text)
      socket.emit('sendNotes', text ,() => console.log("sending notes to server"));
    })
  }
  if(editor) editor.value = note
  if(showNote) {
    document.querySelectorAll(".notesContainer").forEach(a=>a.style.display = "block");
  } else {
    document.querySelectorAll(".notesContainer").forEach(a=>a.style.display = "none");
  }

  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand('copy');
    e.target.focus();
  };


  console.log("transcipt passed", sub);

  console.log(message, messageList);
  const peerList_duplicateLess = peersList.filter((v,i) => {
    return peersList.map((peer)=> peer.peerID).indexOf(v.peerID) === i
  })

  //console.log("peerslist final",peersList);  
  console.log("users in room", usersInRoom);
  console.log("result wout duplicate", peerList_duplicateLess);
  //console.log("location",location)
  // console.log("sub  sent",sub)
  // console.log("showSubtitle",showSubtitle)
  // console.log("mypeer",myPeer)
  // console.log("note in end", note)
  console.log("lowerid", lowerSocketID)

  console.log("screen set",isScreen)


  return (
    <div className="callPage">
    <Stack vertical>
      <Stack horizontal>
        <Stack vertical>
          <IconList user={username} room={roomname} media={myStream} myPeer={myPeer} users={usersInRoom}  sub={sub} sendSub={sendTranscript} setShowSubtitle={setShowSubtitle} showSubtitle={showSubtitle} myStream={myStream} showNote={showNote} setShowNote={setShowNote} setIsScreen={setIsScreen} toggleRaise={toggleRaise} isRaised={isRaised}/> 
          <Stack horizontal>  
            <div className="notesContainer">      
              <h2><center>Meeting Notes</center></h2>
              <textarea rows="30" id="editor" className="notesArea" placeholder="Type Your Text..." ref={textAreaRef}></textarea> 
                <center><DefaultButton 
                  text="Copy to Clipboard" 
                  onClick={copyToClipboard} 
                  iconProps={{ iconName: 'Copy' }}
                  style={buttonStyle}/></center>
            </div>    
            <div className="videoGrid">
            {/* <Stack horizontal> */}
              <Stack className="videoStack"
                  horizontal
                  wrap={true}
                  disableShrink={false}
                  horizontalAlign="center"
                  verticalAlign="center"
                  tokens={stackTokens} 
                  overflow= 'auto'
                  grow={true}
                >
                    {/* <StyledVideo id="myVideo" muted ref={userVideo} autoPlay playsInline /> */}
                    {peerList_duplicateLess.map((peer, id) => {
                        console.log("passed video peer",peer)
                        return (                    
                            <Video key={peer.peerID} peer={peer.peer} videoId={peer.peerID} normalRef={myStream} users={usersInRoom} setmyPeer={setmyPeer} isScreen={isScreen} raiseSocketID={raiseSocketID} lowerSocketID={lowerSocketID}/>
                        );
                    })}
                </Stack>
            </div>
          </Stack>
        </Stack>
        <div className="messageContainer">
          <div className="container">
            <InfoBar />   
            <MessageDisplayer messages={messageList} name={username} />   
            <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>
          </div>
        </div>
      </Stack>      
      {showSubtitle && (<Subtitles subUser={subUser} subText={subText}/>)}
    </Stack>
    
    </div>
  )
}

export default Call;