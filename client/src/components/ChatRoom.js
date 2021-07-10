import React, { useState, useEffect } from 'react';
import ReactEmoji from 'react-emoji';
import {
    useHistory,
    Link,
    useParams
  } from "react-router-dom";
import {
    Container, 
    Row, 
    Col,
    Card,
    CardBody,
    CardSubtitle,
    Button,
    Form,
    InputGroup,
    Input,
    InputGroupAddon
} from 'reactstrap';
import { Stack, IStackTokens} from '@fluentui/react/lib/Stack';
import Moment from 'moment';
import firebase from '../Firebase';
import ScrollToBottom from 'react-scroll-to-bottom';
import '../Styles.css';
import { IPersonaSharedProps, Persona, PersonaSize, PersonaPresence } from '@fluentui/react/lib/Persona';

function ChatRoom() {
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [nickname, setNickname] = useState('');
    const [roomname, setRoomname] = useState('');
    const [newchat, setNewchat] = useState({ roomname: '', nickname: '', message: '', date: '', type: '' });
    const history = useHistory();
    const { room } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setNickname(localStorage.getItem('nickname'));
            setRoomname(room);
            firebase.database().ref('chats/').orderByChild('roomname').equalTo(roomname).on('value', resp => {
              setChats([]);
              setChats(snapshotToArray(resp));
            });
        };
      
        fetchData();
    }, [room, roomname]);

    useEffect(() => {
        const fetchData = async () => {
            setNickname(localStorage.getItem('nickname'));
            setRoomname(room);
            firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).on('value', (resp2) => {
              setUsers([]);
              const roomusers = snapshotToArray(resp2);
              setUsers(roomusers.filter(x => x.status === 'online'));
            });
        };
      
        fetchData();
    }, [room, roomname]);

    const snapshotToArray = (snapshot) => {
        const returnArr = [];

        snapshot.forEach((childSnapshot) => {
            const item = childSnapshot.val();
            item.key = childSnapshot.key;
            returnArr.push(item);
        });

        return returnArr;
    }

    const submitMessage = (e) => {
        e.preventDefault();
        const chat = newchat;
        chat.roomname = roomname;
        chat.nickname = nickname;
        chat.date = Moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
        chat.type = 'message';
        const newMessage = firebase.database().ref('chats/').push();
        newMessage.set(chat);
        setNewchat({ roomname: '', nickname: '', message: '', date: '', type: '' });
    };

    const onChange = (e) => {
        e.persist();
        setNewchat({...newchat, [e.target.name]: e.target.value});
    }

    const exitChat = (e) => {
        const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
        chat.roomname = roomname;
        chat.nickname = nickname;
        chat.date = Moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
        chat.message = `${nickname} left the room :(`;
        chat.type = 'exit';
        const newMessage = firebase.database().ref('chats/').push();
        newMessage.set(chat);
    
        firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).once('value', (resp) => {
          let roomuser = [];
          roomuser = snapshotToArray(resp);
          const user = roomuser.find(x => x.nickname === nickname);
          if (user !== undefined) {
            const userRef = firebase.database().ref('roomusers/' + user.key);
            userRef.update({status: 'offline'});
          }
        });
    
        history.goBack();
    }

    console.log(nickname, roomname)

    return (
        <div className="ChatContainers chatPage">
            <center><div className="menuBar fullHeading">
                <div className="roomNameContainer"><h3>{nickname} </h3></div>
                <div className="commandBar"><h3>Team: {roomname} </h3></div>
            </div></center>
                <Stack horizontal>
                    <Stack className="chatPanel" vertical>
                            <Card className="boxShadows headingBreak">
                                <Card className="UsersCard">
                                    <Button variant="primary" type="button" onClick={() => { exitChat() }}>
                                        Exit Chat
                                    </Button>
                                </Card>
                                <Card className="UsersCard">
                                    <Link to={`/call?name=${nickname}&room=${roomname}`}>
                                        <Button variant="primary" type="button">
                                            Join Video Call
                                        </Button>
                                    </Link>
                                </Card>     
                            </Card>         
                            <div className="usersOnline boxShadows">
                                <h3>Participants</h3>    
                                {users.map((item, idx) => (
                                    <Card>
                                    <Persona 
                                    className="persona"
                                    text={item.nickname}
                                    size={PersonaSize.size48}
                                    presence={PersonaPresence.online }
                                    />
                                    </Card>
                                ))}      
                            </div>     
                    </Stack>
                    <ScrollToBottom className="ChatContent">
                        {chats.map((item, idx) => (
                            <div key={idx} className="MessageBox">
                                {item.type ==='join'||item.type === 'exit'?
                                    <div className="ChatStatus">
                                        <span className="ChatDate">{item.date}</span>
                                        <span className="ChatContentCenter">{ReactEmoji.emojify(item.message)}</span>
                                    </div>:
                                    <div className="ChatMessage">
                                        <div className={`${item.nickname === nickname? "RightBubble":"LeftBubble"}`}>
                                        {item.nickname === nickname ? 
                                            <span className="MsgName">Me</span>:<span className="MsgName">{item.nickname}</span>
                                        }
                                        <span className="MsgDate"> at {item.date}</span>
                                        <p>{ReactEmoji.emojify(item.message)}</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        ))}
                    </ScrollToBottom>                        
                    {/* </Stack> */}
                </Stack>
                <footer className="StickyFooter">
                    <Form className="MessageForm" onSubmit={submitMessage}>
                        <InputGroup>
                        <Input type="text" name="message" id="message" placeholder="Enter message here" value={newchat.message} onChange={onChange} />
                            <InputGroupAddon addonType="append">
                                <Button variant="primary" type="submit">Send</Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </Form>
                </footer>
        </div>
    );
}

export default ChatRoom;