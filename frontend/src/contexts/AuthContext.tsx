import { createContext, useContext, useState, type ReactNode } from "react";

export interface cityChoice {
    name : string,
    lat : number,
    lng : number
}


export interface userAuth{
    uid : string,
    email : string,
    userName : string,
    cityChoiceForAnalysis : cityChoice | null;
}


interface AuthContextData{
    currentUser : userAuth | null,
    setCurrentUser : (user : userAuth) => void;
    
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthContextProvider( {children} : { children:ReactNode}){
    const [currentUser, setCurrentUser] =  useState<userAuth | null>(null)

    return(
        <AuthContext.Provider value={{ currentUser, setCurrentUser}}>
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