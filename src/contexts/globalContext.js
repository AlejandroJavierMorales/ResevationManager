import { createContext, useState } from "react";

const GlobalContext = createContext()


const GlobalProvider = ({chilrdren})=>{


   const [actualPage, setActualPage] = useState('/') //indica la pagina o componente sobre el cua estoy trabajando en todo momento

    return (
        <GlobalContext.Provider value={{actualPage, setActualPage}}>
            {chilrdren}
        </GlobalContext.Provider>
    )
}
export {GlobalContext, GlobalProvider};


