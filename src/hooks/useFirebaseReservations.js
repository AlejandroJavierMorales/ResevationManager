import { addDoc, collection, doc, getDoc, getDocs, query, where, orderBy, deleteDoc, updateDoc, limit } from 'firebase/firestore';
import { db } from '../services/firestore'
import { setReservationsList, setRoomsList, setBanksList, setClientsList } from '../store/slices/reservations';
import { useDispatch, useSelector } from 'react-redux';
import { useGlobalContext } from './useGlobalContext';


const useFirebaseReservations = () => {
    const dispatch = useDispatch();
    const { setErrorPromise, searchResOptions, enableSpinner, setEnableSpinner, fromPage } = useGlobalContext()
    const { checkinToRegister: newCheckin, reservationToModify: reservation } = useSelector(state => state.reservations)


    //Funcion que adecua el recordset de reservas al formato de datos
    //que mostrare en la Table de Reservas. Debo llamarla luego de cada busqueda
    const formatForReservationsTable = async (reservationsRefId, orderby) => {
        const snapRooms = await getDocs(collection(db, 'rooms'));
        const roomsArray = snapRooms.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const snapClients = await getDocs(collection(db, 'clients'));
        const clientsArray = snapClients.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const snapBanks = await getDocs(collection(db, 'banks'));
        const banksArray = snapBanks.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const data = [];
        for (const document of reservationsRefId) {
            const reservationData = document;
            const roomId = reservationData.room;
            const bankId = reservationData.bank;
            const clientId = reservationData.client;
            // Obtén los datos de la habitación y el banco asociados a la reserva
            /* const roomSnapshot = await roomsRef.doc(roomId).get(); */
            const roomSnapshot = roomsArray.find(elem => elem.id === roomId);
            /* const qRoomsref = doc(db, 'rooms', roomId); */
            /* const roomSnapshot = await getDoc(qRoomsref); */
            const bankSnapshot = banksArray.find(elem => elem.id === bankId);
            /* const qBanksref = doc(db, 'banks', bankId);
            const bankSnapshot = await getDoc(qBanksref); */
            const clientSnapshot = clientsArray.find(elem => elem.id === clientId);
            /*  const qClientsref = doc(db, 'clients', clientId);
             const clientSnapshot = await getDoc(qClientsref); */
            if (roomSnapshot.name && bankSnapshot.name && clientSnapshot.dni) {
                /* const roomData = roomSnapshot.data();
                const bankData = bankSnapshot.data();
                const clientData = clientSnapshot.data(); */
                const roomData = roomSnapshot;
                const bankData = bankSnapshot;
                const clientData = clientSnapshot;
                // Agrega la información necesaria a la matriz de datos
                let newClient = `DNI ${clientData.dni} - ${clientData.name} ${clientData.surname}`;
                data.push({
                    year: reservationData.code.split('_')[0],//Para ordenar por code
                    number: reservationData.code.split('_')[1],//año_nroReserva
                    id: reservationData.id,
                    code: reservationData.code,
                    date: reservationData.date,
                    client: newClient,
                    client_id: clientId,
                    pax: reservationData.pax,
                    room: roomData.name,
                    room_id: roomId,
                    inDate: reservationData.inDate,
                    outDate: reservationData.outDate,
                    price: reservationData.price,
                    paid: reservationData.paid,
                    bank: bankData.name,
                    bank_id: bankId,
                    checkin: reservationData.checkin,
                    phone: clientData.phone
                });
            }
            if (orderby === '' || !orderby) {
                data.sort((a, b) => {
                    // Primero, comparamos por year
                    const yearComparison = b.year - a.year;
                    // Si los years son iguales, entonces comparamos por number
                    if (yearComparison === 0) {
                        return b.number - a.number;
                    }
                    // Si los years son diferentes, retornamos la comparación por year
                    return yearComparison;
                });
            } else if (orderby === 'inDate') {
                // eslint-disable-next-line array-callback-return
                data.sort((a, b) => {
                    const inDateComparison = b.inDate - a.inDate;
                    if (inDateComparison === 0) {
                        // Primero, comparamos por year
                        const yearComparison = b.year - a.year;
                        // Si los years son iguales, entonces comparamos por number
                        if (yearComparison === 0) {
                            return b.number - a.number;
                        }
                        // Si los years son diferentes, retornamos la comparación por year
                        return yearComparison;
                    }
                    return inDateComparison;
                });
            } else if (orderby === 'date') {
                // eslint-disable-next-line array-callback-return
                data.sort((a, b) => {
                    const inDateComparison = b.date - a.date;
                    if (inDateComparison === 0) {
                        // Primero, comparamos por year
                        const yearComparison = b.year - a.year;
                        // Si los years son iguales, entonces comparamos por number
                        if (yearComparison === 0) {
                            return b.number - a.number;
                        }
                        // Si los years son diferentes, retornamos la comparación por year
                        return yearComparison;
                    }
                });
            }
        }
        return (data);
    }

    const getLastCodeReservation = async ()=>{
        const reservationsRef = collection(db, 'reservations');
            const q = query(reservationsRef, orderBy("code", "desc"), limit(100)/*  where('room', '!=', null), where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
            const snapshot = await getDocs(q)

            /* const snapshot = await reservationsRef.where('room', '!=', null).where('bank', '!=', null).get(); */
            if (snapshot.size > 0) {
                const reservationsByCode = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                return reservationsByCode[0]?.code;
            }else{
                return false;
            }
    }

    const getReservationsForTable = async () => {

        setEnableSpinner(true);

        try {
            dispatch(setReservationsList([]));
            //si vengo de la pagina de busqueda:
            //armar query segun criterio seleccionado

            //si no, traer todas las reservas
            const reservationsRef = collection(db, 'reservations');
            const q = query(reservationsRef, orderBy("code", "desc"), limit(100)/*  where('room', '!=', null), where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
            const snapshot = await getDocs(q)

            /* const snapshot = await reservationsRef.where('room', '!=', null).where('bank', '!=', null).get(); */
            if (snapshot.size > 0) {
                const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                const data = await formatForReservationsTable(reservationsRefId, '')

                dispatch(setReservationsList(data));//Actueliza reservations en el Store de Redux
                setEnableSpinner(false);
                return data
            } else {
                setEnableSpinner(false);
                dispatch(setReservationsList([]));
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }



    const getReservations = async () => {
        const collectionRef = collection(db, "reservations");
        const q = query(collectionRef, orderBy("date", "desc"), /* limit(1) */);
        setEnableSpinner(true);
        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size > 0) {
                const reservationsColllection = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                //Setear la Variable global de Redux que contendra las Reservas traidas de la base de datos
                dispatch(setReservationsList(reservationsColllection));
                setEnableSpinner(false);
                /* setProducts(productsColllection);
                setErrorPromise(''); */
            } else {
                setEnableSpinner(false);
                dispatch(setReservationsList([]));
            }
        } catch (err) {
            //Manejasr un Estadeo de Error Global en Redux
            /* setErrorPromise('Error: No se han encontrado Productos en la base de datos...'); */
            console.log(err);
        }
    };

    const addReservation = async (reservation) => {
        console.log(`Nueva Reserva: ${JSON.stringify(reservation,null,2)}`)
        if (reservation.code) {
            const productsColllection = collection(db, 'reservations');
            try {
                await addDoc(productsColllection, reservation);
                setErrorPromise('');
                return (true);
            } catch (err) {
                console.error('Error al Registrar la Reserva', err);
                setErrorPromise('No se pudo Registrar la Reserva en la base de datos..');
                return (false);
            }
        } else {
            return (false);
        }
    }

    const editReservation = async (reservation, id ) => {
        console.log('RESERVA A EDITAR: ' + JSON.stringify(reservation,null,2))
        console.log('ID: '+ id)
        if (reservation.code) {
            const qref = doc(db, 'reservations', id);
            try {
                await updateDoc(qref, reservation);
                setErrorPromise('');
                return (true);
            } catch (err) {
                console.error('Error al Registrar la Reserva', err);
                setErrorPromise('No se pudo Registrar la Reserva en la base de datos..');
                return (false);
            }
        } else {
            return (false);
        }
    }


    const deleteReservation = async (id) => {
        const qref = doc(db, 'reservations', id);
        try {
            const result = await getDoc(qref);
            if (result.exists) {
                //Borrar la reserva
                await deleteDoc(qref);
                return true;
                /* await getReservationsForTable(); */

            } else {
                setErrorPromise("No se encontro la Reserva...");
                return false;
            }

        } catch (err) {
            setErrorPromise("Error: no se pudo concretar la Eliminación de la Reserva seleccionada...");
            return false;
        }
    }

    //Search Reservations
    const searchReservations = async () => {
        dispatch(setReservationsList([]));
        setEnableSpinner(true);
        const reservationsRef = collection(db, 'reservations');
        try {
            //verificar Opciones de Busqueda Seleccionadas searchResOptions
            if (searchResOptions.date?.search) {
                //Buscamos por fecha
                if (searchResOptions.date?.reservationDate) {
                    //buscamos por fecha de reserva
                    if (searchResOptions?.date.period) {
                        const q = query(reservationsRef, where('date', '>=', searchResOptions.date.date1), where('date', '<=', searchResOptions.date.date2), orderBy("date", "desc"));
                        const snapshot = await getDocs(q);
                        if (snapshot.size > 0) {
                            const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                            const data = await formatForReservationsTable(reservationsRefId, 'date');
                            dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                            setEnableSpinner(false);
                        } else {
                            setEnableSpinner(false);
                            dispatch(setReservationsList([]));
                        }
                    } else {
                        const q = query(reservationsRef, where('date', '==', searchResOptions.date.date1)/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                        const snapshot = await getDocs(q);
                        if (snapshot.size > 0) {
                            const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                            const data = await formatForReservationsTable(reservationsRefId, 'date');
                            dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                            setEnableSpinner(false);
                        } else {
                            setEnableSpinner(false);
                            dispatch(setReservationsList([]));
                        }
                    }
                } else if (searchResOptions?.date?.checkInDate) {
                    //buscamos por fecha de ingreso
                    if (searchResOptions?.date?.period) {
                        const q = query(reservationsRef, where('inDate', '>=', searchResOptions.date.date1), where('inDate', '<=', searchResOptions.date.date2), orderBy("inDate", "desc"));
                        const snapshot = await getDocs(q);
                        if (snapshot.size > 0) {
                            const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                            const data = await formatForReservationsTable(reservationsRefId, 'inDate');
                            dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                            setEnableSpinner(false);
                        } else {
                            setEnableSpinner(false);
                            dispatch(setReservationsList([]));
                        }
                    } else {
                        const q = query(reservationsRef, where('inDate', '==', searchResOptions.date.date1)/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                        const snapshot = await getDocs(q);
                        if (snapshot.size > 0) {
                            const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                            const data = await formatForReservationsTable(reservationsRefId, 'inDate');
                            dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                            setEnableSpinner(false);
                        } else {
                            setEnableSpinner(false);
                            dispatch(setReservationsList([]));
                        }
                    }
                }
            } else if (searchResOptions.client.search) {
                //Buscamos por cliente
                const q = query(reservationsRef, where('client', '==', searchResOptions.client.idClient)/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                const snapshot = await getDocs(q);
                if (snapshot.size > 0) {
                    const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                    const data = await formatForReservationsTable(reservationsRefId, '');
                    dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                    setEnableSpinner(false);
                } else {
                    setEnableSpinner(false);
                    dispatch(setReservationsList([]));
                }
            } else if (searchResOptions.bank.search) {
                //Buscamos por Banco
                const q = query(reservationsRef, where('bank', '==', searchResOptions.bank.idBank)/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                const snapshot = await getDocs(q);
                if (snapshot.size > 0) {
                    const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                    const data = await formatForReservationsTable(reservationsRefId, '');
                    dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                    setEnableSpinner(false);
                } else {
                    setEnableSpinner(false);
                    dispatch(setReservationsList([]));
                }
            } else if (searchResOptions.code.search) {
                //Busqueda porCodigo de Reserva
                const q = query(reservationsRef, where('code', '==', searchResOptions.code.codeReservation)/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                const snapshot = await getDocs(q);
                if (snapshot.size > 0) {
                    const reservationsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                    const data = await formatForReservationsTable(reservationsRefId, '');
                    dispatch(setReservationsList(data));//Actualiza reservations en el Store de Redux
                    setEnableSpinner(false);
                } else {
                    dispatch(setReservationsList([]));
                    setEnableSpinner(false);
                }
            }
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }

    }


    const getRooms = async () => {
        const collectionRef = collection(db, "rooms");
        const q = query(collectionRef, orderBy("code", "asc"), /* limit(1) */);
        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size > 0) {
                const roomsColllection = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                //Setear la Variable global de Redux que contendra las Habitaciones traidas de la base de datos
                dispatch(setRoomsList(roomsColllection));
                return roomsColllection;
            }
        } catch (err) {
            /* setErrorPromise('Error: No se han encontrado Productos en la base de datos...'); */
            console.log(err);
        }
    }

    const getClients = async () => {
        const collectionRef = collection(db, "clients");
        const q = query(collectionRef, orderBy("dni", "asc"), /* limit(1) */);
        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size > 0) {
                const clientsColllection = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                //Setear la Variable global de Redux que contendra las Reservas traidas de la base de datos
                dispatch(setClientsList(clientsColllection));
                return clientsColllection;
                /* setProducts(productsColllection);
                setErrorPromise(''); */
            }
        } catch (err) {
            //Manejasr un Estadeo de Error Global en Redux
            /* setErrorPromise('Error: No se han encontrado Productos en la base de datos...'); */
            console.log(err);
        }
    }

    const getBanks = async () => {
        const collectionRef = collection(db, "banks");
        const q = query(collectionRef, orderBy("code", "asc"), /* limit(1) */);
        try {
            const querySnapshot = await getDocs(q)
            if (querySnapshot.size > 0) {
                const banksColllection = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                //Setear la Variable global de Redux que contendra las Reservas traidas de la base de datos
                dispatch(setBanksList(banksColllection));
                /* setProducts(productsColllection);
                setErrorPromise(''); */
            }
        } catch (err) {
            //Manejasr un Estadeo de Error Global en Redux
            /* setErrorPromise('Error: No se han encontrado Productos en la base de datos...'); */
            console.log(err)
        }
    }

    const searchClient = async () => {
        dispatch(setReservationsList([]));
        setEnableSpinner(true);

        const clientsRef = collection(db, 'clients');
        try {
            if (searchResOptions.nameClient.search) {
                //Buscamos por cliente
                /* console.log(`Nombre del Cliente: ${searchResOptions.nameClient.name}`) */
                const q = query(clientsRef, where('surname', '==', searchResOptions.nameClient.name, orderBy("surname", "asc"))/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                const snapshot = await getDocs(q);
                if (snapshot.size > 0) {
                    const clientsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                    /*  const data = await formatForReservationsTable(clientsRefId, ''); */
                    dispatch(setClientsList(clientsRefId));//Actualiza reservations en el Store de Redux
                    setEnableSpinner(false);
                    return clientsRefId
                } else {
                    setEnableSpinner(false);
                    dispatch(setClientsList([]));
                }
            } else if (searchResOptions.dniClient.search) {
                //Buscamos por cliente
                const q = query(clientsRef, where('dni', '==', searchResOptions.dniClient.dni)/* , where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
                const snapshot = await getDocs(q);
                if (snapshot.size > 0) {
                    const clientsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));//Agregando id ara tomarlo en la tabla....................
                    /* const data = await formatForReservationsTable(clientsRefId, ''); */
                    dispatch(setClientsList(clientsRefId));//Actualiza reservations en el Store de Redux
                    setEnableSpinner(false);
                    return clientsRefId
                } else {
                    setEnableSpinner(false);
                    dispatch(setClientsList([]));
                }
            }

        } catch (err) {
            console.log(err);
        }
    }

    const addClient = async (client) => {
        console.log(`Nuevo Cliente ${client} `)
        if (client.dni) {
            const clientsColllection = collection(db, 'clients');
            try {
                await addDoc(clientsColllection, client);
                setErrorPromise('');
                return (true);
            } catch (err) {
                console.error('Error al Registrar el Cliente', err);
                setErrorPromise('No se pudo Registrar el Cliente en la base de datos..');
                return (false);
            }
        } else {
            return (false);
        }
    }

    const deleteClient = async (id) => {
        const qref = doc(db, 'clients', id);
        try {
            const result = await getDoc(qref);
            if (result.exists) {
                //Borrar la reserva
                await deleteDoc(qref);
                return true;
                /* await getReservationsForTable(); */

            } else {
                setErrorPromise(`El cliente con ID: ${id} No Existe`);
                return false;
            }

        } catch (err) {
            setErrorPromise("Error: no se pudo concretar la Eliminación del Cliente seleccionado...");
            return false;
        }
    }

    const editClient = async (client, id = client.id) => {
        if (client.dni) {
            const qref = doc(db, 'clients', id);
            try {
                await updateDoc(qref, client);
                setErrorPromise('');
                return (true);
            } catch (err) {
                console.error('Error al Registrar el Cliente', err);
                setErrorPromise('No se pudo Registrar el Cliente en la base de datos..');
                return (false);
            }
        } else {
            return (false);
        }
    }

    const getClientReservations = async (id) => {
        const reservationsRef = collection(db, 'reservations');
        const q = query(reservationsRef, where('client', '==', id)/*  where('room', '!=', null), where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
        const snapshot = await getDocs(q)

        /* const snapshot = await reservationsRef.where('room', '!=', null).where('bank', '!=', null).get(); */
        if (snapshot.size > 0) {

            console.log('NO SE PUEDE BORRAR EL CLIENTE PORQUE TINE RESERVAS REGISTRADAS')
            return snapshot.docs
        } else {
            return false
        }
    }
    const getReservationById = async (id) => {
        const reservationsRef = collection(db, 'reservations');
        const q = query(reservationsRef, where('code', '==', id)/*  where('room', '!=', null), where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
        const snapshot = await getDocs(q)
        console.log('Snapshot: ' + snapshot.docs);

        /* const snapshot = await reservationsRef.where('room', '!=', null).where('bank', '!=', null).get(); */
        if (snapshot.size > 0) {
            const reservationData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            return reservationData;
        } else {
            console.log(`No se encontró la reserva con id ${id}`)
            return false
        }
    }



    const getClientById = async (id) => {

        const clientsRef = collection(db, 'clients');
        const q = query(clientsRef, where('id', '==', id)/*  where('room', '!=', null), where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
        const snapshot = await getDocs(q)

        /* const snapshot = await reservationsRef.where('room', '!=', null).where('bank', '!=', null).get(); */
        if (snapshot.size > 0) {
            const clientsRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            console.log(JSON.stringify(clientsRefId, null, 2))
            return clientsRefId
        } else {
            return false
        }
    }


    const getCheckinByReservationId = async (id) => {
        //trae de DB el checkin con reservation === id
        const checkinRef = collection(db, 'checkin');
        const q = query(checkinRef, where('reservation', '==', id)/*  where('room', '!=', null), where('bank', '!=', null), */ /* orderBy("date", "desc"), */ /* limit(1) */);
        const snapshot = await getDocs(q)

        /* const snapshot = await reservationsRef.where('room', '!=', null).where('bank', '!=', null).get(); */
        if (snapshot.size > 0) {
            const checkinRefId = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            console.log(JSON.stringify(checkinRefId, null, 2))
            return checkinRefId //retorna array de resultados
        } else {
            return false
        }
    }

    const setCheckinInDB = async () => {
        console.log("Reserva a Registrar Checkin: " + newCheckin?.reservation)
        try {
            if (newCheckin.reservation && fromPage.flag === 'checkin') {
                const resp = await getCheckinByReservationId(newCheckin?.reservation)
                console.log('RESPUESTA A GET' + JSON.stringify(resp[0], null, 2))
                console.log('RESPUESTA A GET' + JSON.stringify(resp[0]?.id))
                //Registrar el checkin en la base de datos
                if (!resp) { //no hay checkin regitrado para esta reserva
                    //Agregar checkin
                    console.log(`Nuevo Checkin ${newCheckin} `)

                    const checkinColllection = collection(db, 'checkin');
                    await addDoc(checkinColllection, newCheckin);
                    /* //actualizar en reservation (newCheckin?.reservation) el campo checkin = true
                    const { paid, ...newReservation } = reservation;
                    await editReservation({  ...newReservation, checkin: true }, newCheckin?.reservation) */
                    setErrorPromise('');
                    return (true);

                } else {
                    //Editar Checkin
                    console.log("EDIT Checkin Registrado: " + resp[0].id);
                    const qref = doc(db, 'checkin', resp[0].id);
                    try {
                        await updateDoc(qref, newCheckin);
                        //actualizar en reservation (newCheckin?.reservation) el campo checkin = true
                        await editReservation({ ...reservation, checkin: true }, newCheckin?.reservation)
                        setErrorPromise('');
                        return (true);
                    } catch (err) {
                        console.error('Error al Registrar el Checkin', err);
                        setErrorPromise('No se pudo Registrar el Checkin en la base de datos..');
                        return (false);
                    }
                }
            } else {
                return (false);
            }
        } catch (err) {
            console.error('Error al Registrar el Checkin', err);
            setErrorPromise('No se pudo Registrar el Checkin en la base de datos..');
            return (false);
        }
    }

    return {
        getReservations, getRooms, getClients, getBanks, addReservation,
        getReservationsForTable, deleteReservation, editReservation, searchReservations,
        searchClient, addClient, deleteClient, editClient, getClientReservations,
        getClientById, setCheckinInDB, getCheckinByReservationId, getReservationById,getLastCodeReservation
    }
}
export { useFirebaseReservations };