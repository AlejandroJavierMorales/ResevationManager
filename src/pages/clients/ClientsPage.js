/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Client } from "../../components/bases/client/Client";
import { useFirebaseReservations, useGlobalContext } from "../../hooks";
import { AnimatedComponent } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { setClientsList } from "../../store/slices/reservations";



const ClientsPage = () => {

    const { actualPage, setActualPage, fromPage } = useGlobalContext();
    const dispatch = useDispatch();
    const { getClients } = useFirebaseReservations();
    const { listClients: clients } = useSelector(state => state.reservations)



    useEffect(()=>{
        console.log('ACTUAL PAGE: ' + actualPage)
    },[actualPage])

    useEffect(() => {

        setActualPage('clientsTable');
        
        
        const getAllClients = async () => {
            const getedClients = await getClients();
            /* console.log('CLIENTES ' + JSON.stringify(getedClients, null, 2)) */
            if (getedClients.size <= 0) {
                dispatch(setClientsList([]));
            }


        }
        if (fromPage.from !== 'searchForm') {
            getAllClients();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <AnimatedComponent><Client clients={clients} /></AnimatedComponent>
            {/* {(actualPage === 'clients_table') && <AnimatedComponent><Client clients={clients} /></AnimatedComponent>}
            {(actualPage === 'formCrudClient') && <AnimatedComponent><FormCrudClient /></AnimatedComponent>}  */}
        </>

    )
}
export { ClientsPage }