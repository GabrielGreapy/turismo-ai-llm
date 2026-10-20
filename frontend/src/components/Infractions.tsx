import { collection, getCountFromServer, query, where } from "firebase/firestore"
import { db } from "../firebaseConfig"
import { useEffect, useState } from "react";


export default function Infractions(){
    const [infractions, setInfractions] = useState<number>(0)
    const fetchInfractions = async () => {
        const dbRef = collection(db, "alerts");
        try{
            const q = query( dbRef , where("resolvida", "==", false))
            const snapshot = await getCountFromServer(q)
            const count =  snapshot.data().count
            setInfractions(count)

        }catch(error){
            console.log("Erro ao tentar pegar as infrações: " ,error)
        }
    }
    useEffect( () => {
        fetchInfractions()
    }, [])

    return(
        <h3 className="text-[36px] font-bold text-[#041627] mt-2 tracking-tight">0{infractions}</h3>
    )
}