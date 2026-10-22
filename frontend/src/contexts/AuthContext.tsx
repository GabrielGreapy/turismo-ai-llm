
import { createContext, useContext, useState, type ReactNode } from "react";

interface userContextType {
    userCity : string | null,

}

const UserContext = createContext<userContextType | undefined>(undefined);


export function SearchContextProvider({ children } : { children : ReactNode }) {
    const [userCity, setUserCity] = useState<string>('Picuí')

    return(
        <UserContext.Provider value={{ userCity }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser(){
    const context = useContext(UserContext)
    if(!context) {
        throw new Error("useSearch deve ser utilizado dentro de um SearchContextProvider");
    }
    return context
}