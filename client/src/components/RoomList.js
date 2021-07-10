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
        chat.message = `${nickname} enter the room`;
        chat.type = 'join';
        const newMessage = firebase.database().ref('chats/').push();
        newMessage.set(chat);

        firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).on('value', (resp) => {
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
        <div>
            {showLoading &&
                <Spinner color="primary" />
            }
            <Jumbotron>
                <h3>{nickname} <Button onClick={() => { logout() }}>Logout</Button></h3>
                <h2>Room List</h2>
                <div>
                    <Link to="/addroom">Add Room</Link>
                </div>
                <ListGroup>
                    {room.map((item, idx) => (
                        <ListGroup horizontal>
                            <ListGroupItem key={idx} action onClick={() => { enterChatRoom(item.roomname) }}>
                            {item.roomname} 
                            </ListGroupItem>
                            <ListGroupItem action onClick={() => {
                                removeRoom(item.roomname, item.key)
                                }}>
                                Delete
                            </ListGroupItem>
                        </ ListGroup>
                    ))}                    
                </ListGroup>
            </Jumbotron>
        </div>
    );
}

export default RoomList;