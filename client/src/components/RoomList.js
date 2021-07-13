import React, { useState, useEffect } from 'react';
import {
    Link,
    useHistory
  } from "react-router-dom";
import {
    Jumbotron,
    Spinner,
    ListGroup,
    ListGroupItem,
    Button
} from 'reactstrap';
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';

import Moment from 'moment';
import firebase from '../Firebase';

function RoomList() {
    const [room, setRoom] = useState([]);
    const [showLoading, setShowLoading] = useState(true);
    const [nickname, setNickname] = useState('');
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            setNickname(localStorage.getItem('nickname'));
            firebase.database().ref('rooms/').on('value', resp => {
                //console.log("resp",resp);
                setRoom([]);
                setRoom(snapshotToArray(resp));
                setShowLoading(false);
            });
        };
      
        fetchData();
    }, []);

    const snapshotToArray = (snapshot) => {
        const returnArr = [];

        snapshot.forEach((childSnapshot) => {
            //console.log("childSnapshot",childSnapshot);
            const item = childSnapshot.val();
            item.key = childSnapshot.key;
            returnArr.push(item);
        });

        console.log("returnArr",returnArr);

        return returnArr;
    }

    const enterChatRoom = (roomname) => {
        const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
        chat.roomname = roomname;
        chat.nickname = nickname;
        chat.date = Moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
        chat.message = `${nickname} just entered :D`;
        chat.type = 'join';
        const newMessage = firebase.database().ref('chats/').push();
        newMessage.set(chat);

        firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).once('value', (resp) => {
            console.log("room resp",resp);
            let roomuser = [];
            roomuser = snapshotToArray(resp);
            console.log(roomuser)
            const user = roomuser.find(x => x.nickname === nickname);
            if (user !== undefined) {
              const userRef = firebase.database().ref('roomusers/' + user.key);
              userRef.update({status: 'online'});
            } else {
              const newroomuser = { roomname: '', nickname: '', status: '' };
              newroomuser.roomname = roomname;
              newroomuser.nickname = nickname;
              newroomuser.status = 'online';
              const newRoomUser = firebase.database().ref('roomusers/').push();
              newRoomUser.set(newroomuser);
            }
        });
    
        history.push('/chatroom/' + roomname);
    }

    const removeRoom = (roomname, roomkey) => {
        console.log("clciked");
        console.log(roomname, roomkey);
        
        firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).once('value', (resp) => {
            let roomusers = [];       
            roomusers = snapshotToArray(resp); 
            if(roomusers.length > 0) {
                console.log("Removing RoomUsers");                
                roomusers.forEach((user) => {
                    console.log("child",user.key)
                    firebase.database().ref('roomusers/').child(user.key).remove();
                }) 
            }
            }
        );

        firebase.database().ref('chats/').orderByChild('roomname').equalTo(roomname).once('value', (resp) => {
            let roomusers = [];       
            roomusers = snapshotToArray(resp); 
            if(roomusers.length > 0) {
            console.log("Removing RoomChats");    
            roomusers.forEach((user) => {
                console.log("child",user.key)
                firebase.database().ref('chats/').child(user.key).remove();
            }) }
            }
        );

        firebase.database().ref('rooms/').child(roomkey).remove();
}

    const logout = () => {
        localStorage.removeItem('nickname');
        history.push('/login');
    }

    return (
        <div className="wholePage">
            {showLoading &&
                <center><ProgressIndicator label="Loading" description="Hang Tight!" /></center>

            }
            {/* <Jumbotron> */}
                <center>
                <div className="menuBar headingBreak">
                    <div className="roomNameContainer"><h1>{nickname} </h1></div>
                    <div className="commandBar"><Button onClick={() => { logout() }}>Logout</Button></div>
                </div>
                <div className="aboutContainer"><h2>Create Public Room</h2>
                <Stack horizontal horizontalAlign="center" tokens={{childrenGap: 30}}>
                    <Stack.Item>
                    <h4>Create Room: </h4>
                    </Stack.Item>
                    <Stack.Item>
                    <Link to="/addroom"><DefaultButton
                                className="roomBtn" 
                                iconProps={{iconName: 'AddHome'}}
                                text="Add Room" /></Link>
                    </Stack.Item>
                </ Stack></div>
                </center>
                <center>
                <Stack className="aboutContainer" vertical>
                    <h2>Public Room List</h2>
                    {room.map((item, idx) => (
                        <Stack className="aboutContainer" horizontal>
                            <Stack.Item key={idx}>
                            <DefaultButton className="roomBtn" onClick={() => { enterChatRoom(item.roomname) }} text={item.roomname} />
                            </Stack.Item>
                            <Stack.Item>
                            <DefaultButton 
                                onClick={() => {
                                removeRoom(item.roomname, item.key)
                                }} 
                                iconProps={{iconName: 'Delete'}}
                                text="Delete Room" />
                            </Stack.Item>
                        </ Stack>
                    ))} 
                </Stack></center>
            {/* </Jumbotron> */}
        </div>
    );
}

export default RoomList;