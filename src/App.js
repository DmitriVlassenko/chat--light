import './App.css';
import { useState, useRef } from 'react'
import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyBL0MwP_ve90rffYEEetyCbYUDbjQKn5po",
    authDomain: "multichatlight.firebaseapp.com",
    projectId: "multichatlight",
    storageBucket: "multichatlight.appspot.com",
    messagingSenderId: "199982853499",
    appId: "1:199982853499:web:ce3596ec4b7662ed7f61de",
    measurementId: "G-C45V0PZK85"
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header>
        <h1>💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }

  return (
      <>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </>
  )
}

function SignOut() {
  return auth.currentUser && (
      <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
    const dummy = useRef()
    const messagesRef = firestore.collection('messages')
    const query = messagesRef.orderBy('createdAt')
    const [messages] = useCollectionData(query, { idField: 'id' })
    const [formValue, setFormValue] = useState('')
    const sendMessage = async(e) => {
        e.preventDefault()
        const {uid, photoURL } = auth.currentUser

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        })
        setFormValue('')
        dummy.current.scrollIntoView({ behavior: 'smooth' })
    }

  return (
      <>
      <main>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
          <button type={"submit"}>send</button>
      </form>
      </>
  )
}

function ChatMessage(props) {
    const {text, uid , photoURL} = props.message
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved'

  return (
      <div className={`message ${messageClass}`}>
          <img src={photoURL || 'https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/user.png'} alt={'userLogo'}/>
          <p>{text}</p>
      </div>
  )
}

export default App;
