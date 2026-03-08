import { useState } from 'react'
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default function Auth() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        await createUserWithEmailAndPassword(auth, email, password)
    }
    return (
        <div>
            <input type="text" onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            <button onClick={signIn}>Sign in</button>
        </div>
    )
}