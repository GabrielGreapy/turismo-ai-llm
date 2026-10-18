import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebaseConfig"
import { useEffect, useState } from "react";


export default function Infractions(){
    const [infractions, setInfractions] = useState<number>(0)
    const fetchInfractions = async () => {
        const dbRef = collection(db, "analyzed_cache");
        try{
            const q = await query( dbRef , where("analise_ai.alertas.nivel_risco", "==", "Médio"))
            const snapshot = getCountFromServer(q)
            const count = (await snapshot).data().count
            setInfractions(count)

        }catch(error){
            console.log("Erro ao tentar pegar as infrações: " ,error)
        }
    }
    useEffect( () => {
        fetchInfractions()
    }, [])

    return(
        <h3 className="text-[36px] font-bold text-[#041627] mt-2 tracking-tight">{infractions}</h3>
    )
}