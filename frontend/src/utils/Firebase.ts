import { browserLocalPersistence, browserSessionPersistence, setPersistence } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { cityChoice } from "../contexts/AuthContext";
export const setPersistenceType = async (rememberMe : boolean) => {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistenceType);
}


export async function getUserDocument( userCredential : any){
    const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid))
    const data = docSnap.data()
    console.log(data)
    return data;
}

export async function setUserDocumentOnRegister( userCredential : any, city : cityChoice | null){
    const docRef = doc(db, 'users', userCredential.user.uid)
    
    await setDoc(docRef, {
        email : userCredential.user.email,
        username : userCredential.user.displayName,
        createdAt: new Date().toISOString(),
        cityChoiceForAnalysis : city,
        user_uid : userCredential.user.uid,
    })

    console.log(`Documento salvo no firebase com id: ${userCredential.user.uid}`)
}