import React, { useState } from 'react';
import {
    useHistory
} from "react-router-dom";
import {
    Alert,
    Jumbotron,
    Spinner,
    Form,
    Button,
    FormGroup, 
    Label, 
    Input
} from 'reactstrap';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import firebase from '../Firebase';

function AddRoom() {
    const history = useHistory();
    const [room, setRoom] = useState({ roomname: '' });
    const [showLoading, setShowLoading] = useState(false);
    const ref = firebase.database().ref('rooms/');

    const save = (e) => {
        e.preventDefault();
        setShowLoading(true);
        ref.orderByChild('roomname').equalTo(room.roomname).once('value', snapshot => {
            if (snapshot.exists()) {
                return (
                    <div>
                        <Alert color="primary">
                            Room name already exist!
                        </Alert>
                    </div>
                );
            } if (!room.roomname) {
                history.goBack();
            }
            else {
                const newRoom = firebase.database().ref('rooms/').push();
                newRoom.set(room);
                history.goBack();
                setShowLoading(false);
            }
        });
    };

    const onChange = (e) => {
        e.persist();
        setRoom({...room, [e.target.name]: e.target.value});
    }

    return (
        <div className="wholePage styleAdd" >
            {showLoading &&
                <center><ProgressIndicator label="Loading" description="Hang Tight!" /></center>
            }
            <div className="aboutContainer centered">
                <h2>Please enter new Room</h2>
                <Form onSubmit={save}>
                    <FormGroup>
                        <Label>Room Name</Label>
                        <Input type="text" name="roomname" id="roomname" placeholder="Enter Room Name" value={room.roomname} onChange={onChange} />
                    </FormGroup>
                    <Button variant="primary" type="submit">
                        Add
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default AddRoom;