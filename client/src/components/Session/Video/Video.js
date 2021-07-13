import React, { useState, useEffect, useRef } from "react";
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';

import styled from "styled-components";
import './Video.css'

const VideoCell = styled.video`
    height: 100%;
    width: 100%;
    display: block;
    align-items: stretch;
`;

const stackStyles = {
    root: { backgroundColor: 'rgba(255, 122, 122, 0.596)', borderRadius: '5px'}
  };

const raisedStyles = {
    root: { backgroundColor: 'yellow', borderRadius: '5px'}
  };

const Video = (props) => {
    const ref = useRef();
    //console.log("video props",props);
    const [ismuted, setMuted] = useState(false)
    const [isRaised, setIsRaised] = useState(false);
    const [name, setName] = useState('')
    const myPeer=useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            //console.log("others stream", stream.id);
            //console.log("apna stream id", props.normalRef.id);
            ref.current.srcObject = stream;

            if(stream.id === props.normalRef.id) {
                setMuted(true);
                myPeer.current=props.peer;
                //setmyPeer(props.peer);
                //if(props.isRaised) setRaise(true);
            }
        })
        
        props.peer.on('close', () => {
            //ref.current.remove();
            console.log("closing peer in video element");
        })

        props.users.forEach(user => {
                //console.log("usersss in video comp",user.id, user.name);      
                if(user.id === props.videoId) {
                    setName(user.name)
                }      
            })
        
        

        //console.log("ref video ka",ref);
        //console.log("ref passed wala", props.NormalRef)
    }, []);

    useEffect(() => {
        if(props.raiseSocketID) {
            console.log("video received rasing hand", props.raiseSocketID)
            if(props.raiseSocketID === props.videoId && isRaised === false) setIsRaised(true)
            console.log("israised state", isRaised)
        }

    })

    useEffect(() => {
        if(props.lowerSocketID) {
            console.log("video received lowering hand", props.lowerSocketID)
            if(props.lowerSocketID === props.videoId) {
                setIsRaised(false)
                console.log("israised state", isRaised)
            }
        }
    })
    console.log("mypeer", myPeer)
    console.log("video socket id",props.videoId);
    console.log("lowerSocketID", props.lowerSocketID);

    return (
        <div className="videoCell">
        <Stack vertical tokens={{childrenGap: 10}} 
        styles={isRaised? raisedStyles: stackStyles}>
            <VideoCell playsInline muted={ismuted} autoPlay ref={ref} />
            <h2><center>{name}</center></h2>
        </Stack>
        </div>
    );
}

export default Video
