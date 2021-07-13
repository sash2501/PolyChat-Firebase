import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import {
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

function Login() {
    const history = useHistory();
    const [creds, setCreds] = useState({ nickname: '' });
    const [showLoading, setShowLoading] = useState(false);
    const ref = firebase.database().ref('users/');

    const login = (e) => {
        e.preventDefault();
        setShowLoading(true);
        ref.orderByChild('nickname').equalTo(creds.nickname).once('value', snapshot => {
            if (snapshot.exists()) {
                localStorage.setItem('nickname', creds.nickname);
                history.push('/roomlist');
                setShowLoading(false);
            } else {
                const newUser = firebase.database().ref('users/').push();
                newUser.set(creds);
                localStorage.setItem('nickname', creds.nickname);
                history.push('/roomlist');
                setShowLoading(false);
            }
        });
    };

    const onChange = (e) => {
        e.persist();
        setCreds({...creds, [e.target.name]: e.target.value});
    }

    return (
        <div className="wholePage styleAdd">
            {showLoading &&
                <center><ProgressIndicator label="Loading" description="Hang Tight!" /></center>
            }
            <div className="centered">
            <h1><center> SASSYCODE'S TEAMS </center></h1> 
            <center><div className="aboutContainer lessOpaque">
                <h2>
                    Welcome to Sassycode's Teams! 
                </h2>
                <p>
                    Get started by creating a new user name, or logging in to your created user name.
                </p>
                <p>
                    Once logged in, Join a public room or create one of your own and connect with your team!
                </p>
            </div>
            <div className="loginContainer">
            {/* <Jumbotron> */}
                <Form onSubmit={login}>
                    <FormGroup>
                        <Label>Username</Label>
                        <Input type="text" name="nickname" id="nickname" placeholder="Enter Your Username" value={creds.nickname} onChange={onChange} />
                    </FormGroup>
                    <Button variant="primary" type="submit">
                        Login
                    </Button>
                </Form>
            {/* </Jumbotron> */}
            </div></center>
            </div>
        </div>
    );
}

export default Login;