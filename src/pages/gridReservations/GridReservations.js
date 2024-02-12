import React, { useEffect } from 'react'
import { GridComponent } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import { useFirebaseReservations } from '../../hooks'
import { setReservationsList } from '../../store/slices/reservations'

const GridReservations = ()=> {

  const { listReservations: reservations } = useSelector(state => state.reservations)
  const dispatch = useDispatch();
  const {  getReservationsForTable } = useFirebaseReservations();


  useEffect(() => {

    /* setActualPage('reservations_table'); */

   /*  if (fromPage.from !=='searchForm') { */
        const getReservations = async () => {
        const getedReservations =    await getReservationsForTable();
        console.log('RESERVAS '+ JSON.stringify(getedReservations,null,2))
        if(getedReservations?.size <= 0){
                dispatch(setReservationsList([]));
        }
        }
        getReservations();
   /*  } */
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])



  return (
    <div>
      <GridComponent reservations={reservations}/>
    </div>
  )
}
export {GridReservations}
