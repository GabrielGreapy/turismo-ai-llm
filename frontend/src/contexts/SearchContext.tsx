import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextType {
    searchTerm : string;
    setSearchTerm : (term : string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);


export function SearchContextProvider({ children } : { children : ReactNode }) {
    const [searchTerm, setSearchTerm] = useState<string>('')

    return(
        <SearchContext.Provider value={{ searchTerm,  setSearchTerm}}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch(){
    const context = useContext(SearchContext)
    if(!context) {
        throw new Error("useSearch deve ser utilizado dentro de um SearchContextProvider");
    }
    return context
}