import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "firebase/auth";
import { createContext, useContext, useState, type ReactNode } from "react";
import { auth } from "../firebaseConfig";

export interface cityChoice {
    name : string,
    lat : number,
    lng : number
}


export interface userAuth{
    uid : string,
    email : string,
    userName : string,
    cityChoiceForAnalysis : cityChoice | null,
    
}


interface AuthContextData{
    currentUser : userAuth | null;
    setCurrentUser : (user : userAuth) => void;
    loading : boolean;
    login : (email : string, password : string, rememberMe : boolean) => Promise<void>;
    
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthContextProvider( {children} : { children:ReactNode}){
    const [currentUser, setCurrentUser] =  useState<userAuth | null>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const login = async (email : string, password : string, rememberMe : boolean) => {
        setLoading(true);
        try {
            // Configura a persistência baseada no checkbox "Lembrar-me"
            const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);
    
            // Executa a autenticação no Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            console.log('Login efetuado com sucesso no Firebase:', userCredential.user);
            setCurrentUser({
                uid : userCredential.user.uid,
                email : email,
                userName : userCredential.user.displayName ?? email,
                cityChoiceForAnalysis : null,
            })
            
        } catch (error: any) {
            console.error('Erro ao fazer login:', error);
            throw new error;
            // Tratamento amigável para mensagens de erro comuns do Firebase
        } finally {
            setLoading(false);
        }
        };
    







    return(
        <AuthContext.Provider value={{ currentUser, setCurrentUser, login, loading}}>
            { children }
        </AuthContext.Provider>
    )

}

export function useAuth(){
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("O context do auth não devia estar aí...")
    }
    return context;
}