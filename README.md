
# PolyChat AKA Sassycode's Teams

A public messaging and meeting platform to connect to individuals



![Logo](img/PolyChat-Logo.png)


## Features

- [X] User login
- [X] Creating and joining public teams channels
- [X] Real-time speech-to-text transcription
- [X] In-call messaging
- [X] Teams chatting before and after the call
- [X] Collaborative meeting notes
- [X] Enabling/disabling microphone 
- [X] Enabling/disabling camera
- [X] Raising/Lowering hand to speak in meeting
- [ ] Screen Sharing
- [ ] Collaborative white board

    
## Installation

Install polychat with npm

Clone this repository with :
```bash
git clone ""
```

Installing Server Side dependecies. Go to root folder.

```bash
  cd server
  npm install
  npm start
```

Installing Client/ Frontend Side dependecies in a new terminal window. Go to root folder.
```bash
  cd client
  npm install
  npm start
```
    
## Tech Stack

**Client:** 
- [React](https://reactjs.org/)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Firebase - Realtime Database](https://firebase.google.com/docs/database)
- [Simple-Peer](https://github.com/feross/simple-peer#readme) 
- [FluentUI](https://www.microsoft.com/design/fluent/#/)

**Server:** 
- [Nodejs](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Socketio](https://socket.io/)


## Screenshots

Login Page

![App Screenshot](img/Login.png)

Add Room Page

![App Screenshot](img/AddRoom.png)

Room List Page

![App Screenshot](img/RoomList.png)

Chat Room

![App Screenshot](img/ChatPage.png)

Video Call Room

![App Screenshot](img/PolyChat_Pic.png)  