import { useContext } from "react";
import { GlobalContext } from "../contexts"


const useGlobalContext = ()=>{

    const globalContext = useContext(GlobalContext);

    return (globalContext);

}
export {useGlobalContext};