import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
//import Peer from 'peer';
import Peer from "simple-peer";
import queryString from 'query-string';
// import styled from "styled-components";
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';
import { DefaultButton } from '@fluentui/react/lib/Button';


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
const ENDPOINT = 'http://localhost:5001'
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

// const StyledVideo = styled.video`
//     height: 40%;
//     width: 50%;
// `;
// const videoConstraints = {
//     height: window.innerHeight / 2,
//     width: window.innerWidth / 2
// };

const stackTokens: IStackTokens = {
    childrenGap: `10 10`, //rowGap + ' ' + columnGap,
    padding: `10px 10px 10px 10px`, //`${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
  };

const Call = ( {location}) => {

  console.log("loacation rn", location);
  location = useLocation();
  console.log("location", location.search);
  // const { url } = useParams();
  // console.log("url", url);

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
  //let myPeer;
  const [subUser, setSubUser] = useState('');
  const [subText, setSubText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [myPeer, setmyPeer] = useState(null);
  
  useEffect( () => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setUserName(name);
    //const name = localStorage.getItem('nickname');
    //setUserName(localStorage.getItem('nickname'))
    //const room= "Room1";
    setRoomName(room);


    //socket = io.connect("/");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        //userVideo.current.srcObject = stream;
        setMyStream(stream);
        socket.emit("join room", {name, room}, error => {if(error) alert(error)});

        
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


  console.log("transcipt passed", sub);
  // const getUsersList = (event) => {
  //   event.preventDefualt();

  //   socket.emit('sendUserList', )
  // }

  console.log(message, messageList);
  const peerList_duplicateLess = peersList.filter((v,i) => {
    return peersList.map((peer)=> peer.peerID).indexOf(v.peerID) === i
  })

  // if(peersList.length === 1)  {
  //   //console.log("length is only 1");
  //   peersList.map((peer) => {
  //     myPeer = peer;
  //   })
  //   console.log(myPeer.peerID);

  // }

  //console.log("peerslist final",peersList);  
  console.log("users in room", usersInRoom);
  console.log("result wout duplicate", peerList_duplicateLess);
  //console.log("location",location)
  console.log("sub  sent",sub)
  console.log("showSubtitle",showSubtitle)
  console.log("mypeer",myPeer)
 //console.log("myownSTream",myStream);
  return (
    <div>
    <Stack Vertical>
      <Stack horizontal>
      <Stack vertical>
        <IconList room={roomname} media={myStream} myPeer={myPeer} users={usersInRoom}  sub={sub} sendSub={sendTranscript} setShowSubtitle={setShowSubtitle} showSubtitle={showSubtitle} myStream={myStream}/> 
        <div className="videoGrid">
        {/* <Container> */}
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
                    <Video key={peer.peerID} peer={peer.peer} videoId={peer.peerID} normalRef={myStream} users={usersInRoom} setmyPeer={setmyPeer}/>
                );
            })}
            </Stack>
        {/* </Container>   */}
        </div>
      </Stack>
      <div className="messageContainer">
        <div className="textcontainer">
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