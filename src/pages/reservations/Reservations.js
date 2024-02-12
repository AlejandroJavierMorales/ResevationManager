import { useDispatch, useSelector } from "react-redux";
import { AnimatedComponent, FormCrudReservations, Reservation } from "../../components";
import { useFirebaseReservations } from "../../hooks/useFirebaseReservations";
import { useEffect } from "react";
import { useGlobalContext } from "../../hooks";
import { setReservationsList } from '../../store/slices/reservations';



;
const Reservations = () => {



    const { actualPage, setActualPage, fromPage } = useGlobalContext();
    const { getReservations, getReservationsForTable } = useFirebaseReservations();
    const dispatch = useDispatch();
    const { listReservations: reservations } = useSelector(state => state.reservations)
    

    
    
    useEffect(() => {

        setActualPage('reservations_table');

        if (fromPage.from !=='searchForm') {
            const getReservations = async () => {
            const getedReservations =    await getReservationsForTable();
            console.log('RESERVAS '+ JSON.stringify(getedReservations,null,2))
            if(getedReservations?.size <= 0){
                    dispatch(setReservationsList([]));
            }
            }
            getReservations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (

        <div>

            {/* <Reservation reservations={reservations} /> */}
            {(actualPage === 'reservations_table') && <AnimatedComponent><Reservation reservations={reservations} /></AnimatedComponent>}
            {(actualPage === 'formCrudReservation') && <AnimatedComponent><FormCrudReservations /></AnimatedComponent>}


        </div>

    )
}
export { Reservations }