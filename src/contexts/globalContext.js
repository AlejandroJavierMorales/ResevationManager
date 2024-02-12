import { createContext, useState } from "react";

const GlobalContext = createContext()


const GlobalProvider = ({ children }) => {


    const [actualPage, setActualPage] = useState('reservations_table'); //indica la pagina o componente sobre el cua estoy trabajando en todo momento
    const [fromPage, setFromPage] = useState({ //este objeto indica de que pagina se realiza el llamado
        from: '', //de que pagina vengo
        flag: '',//indicador para realizar alguna accion
    });
    const [errorPromise, setErrorPromise] = useState('');
    const [enableSpinner, setEnableSpinner] = useState(false)
    const [reservation, setReservation] = useState({});
    const [client, setClient] = useState({});
    const [searchResOptions, setSearchResOptions] = useState({ //Objeto que contiene las opciones de busqueda de reservas seleccionadas
        code: {
            search: false,
            codeReservation: ''
        },
        date: {
            search: false,
            reservationDate: false,
            checkInDate: false,
            period: false,
            date1: '',
            date2: ''
        },
        client: {
            search: false,
            idClient: ''
        },
        bank: {
            search: false,
            idBank: ''
        },
        dniClient: {
            search: false,
            dni: ''
        },
        nameClient: {
            search: false,
            name: ''
        }
    })

    return (
        <GlobalContext.Provider value={{ actualPage, setActualPage, reservation, setReservation, errorPromise, setErrorPromise, fromPage, setFromPage, searchResOptions, setSearchResOptions, enableSpinner, setEnableSpinner, client, setClient }}>
            {children}
        </GlobalContext.Provider>
    )
}
export { GlobalContext, GlobalProvider };


