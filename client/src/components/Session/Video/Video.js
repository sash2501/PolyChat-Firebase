import React, { useState, useEffect, useRef } from "react";
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';

//import styled from "styled-components";
import './Video.css'

// const VideoCell = styled.video`
//     height: 100%;
//     width: 100%;
//     display: block;
//     align-items: stretch;
// `;

const Video = (props) => {
    const ref = useRef();
    //console.log("video props",props);
    const [ismuted, setMuted] = useState(false)
    const [name, setName] = useState('')

    useEffect(() => {
        props.peer.on("stream", stream => {
            //console.log("others stream", stream.id);
            //console.log("apna stream id", props.normalRef.id);
            ref.current.srcObject = stream;

            if(stream.id === props.normalRef.id) {
                setMuted(true);
                props.setmyPeer(props.peer);
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

    return (
        <div className="videoCell">
        <Stack vertical tokens={{childrenGap: 10}}>
            <video playsInline muted={ismuted} autoPlay ref={ref} />
            <h2><center>{name}</center></h2>
        </Stack>
        </div>
    );
}

export default Video
