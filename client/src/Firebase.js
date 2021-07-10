import firebase from 'firebase';

const config = {
    projectId: 'reactchat-a43b2',
    apiKey: 'AIzaSyBqtuF1-HruRo46GIsla6NyvDPdTB_IbMA',
    databaseURL: "https://polychat-b50ca-default-rtdb.asia-southeast1.firebasedatabase.app"
  };
firebase.initializeApp(config);

export default firebase;