/* eslint-disable react-hooks/exhaustive-deps */
import { useForm } from 'react-hook-form';
import formCrudStyle from './_formCrudReservation.module.scss'
import { useEffect, useRef, useState } from 'react';
import { useFirebaseReservations, useGlobalContext } from '../../hooks';
import { useDispatch, useSelector } from 'react-redux';
import moment, { now } from 'moment';
import { setCheckInToRegister, setReservationToModify } from '../../store/slices/reservations';
import Swal from 'sweetalert2';
import { AllowCheckin } from '../../utils/index'



const FormCheckIn = ({ isOpen, closeModal, newCheckin = false, checkInReservation }) => {

    const { register, handleSubmit, formState: { errors }, setError, clearErrors, watch, setValue, reset } = useForm();
    const { actualPage, setActualPage, fromPage, setFromPage } = useGlobalContext();
    const { editReservation, getReservationById, getClients, getRooms, setCheckinInDB, getCheckinByReservationId, getReservationsForTable } = useFirebaseReservations();
    const { checkinToRegister: checkInToRegister, reservationToModify: reservationToCheckIn, listReservations: reservations, listClients: clients } = useSelector(state => state.reservations);
    const dispatch = useDispatch();
    const paidAmount = useRef();
    const [errorCheckin, setErrorCheckin] = useState({status: 'allowed', message: 'no hay error'})

const traerReservaporId = async ()=>{
//Validados todos los datos del formulario:
const res = await getReservationById(reservationToCheckIn.code)
console.log('id DE RESERVA A BUSCAR:  ' +reservationToCheckIn.code )
console.log('RESERVA A ENVIAR A ALLOW:  ' + JSON.stringify(res, null, 2) )
return res

}


    const handleForm = async (data, e) => {
        let fecha = new Date(data.date + ' 12:00');
        e.preventDefault();
        paidAmount.current = data.paid

        const res= await traerReservaporId()
        const allowed = await AllowCheckin(res, paidAmount.current)
      /*   console.log('allowed: '+ JSON.stringify(allowed.status,null,2)) */
        if (allowed.status === 'allowed') { //si se validan las condiciones para hacer checkin
            //resertear marcador de errores que impiden el checkin
            setErrorCheckin({status: 'allowed', message: ''});
        
            //Buscar por reservations._id si ya hay checkin (confirmed===true) y en caso afirmativo Avissar pero dejar sobrescribir si el usuario confirma
            const resp = await getCheckinByReservationId(reservationToCheckIn.id);

            if (resp) {//Si ya hay chechin realizado y el usuario confirma que lo quiere hacer => editar el existente y sobreecribir info
                try {
                    const result = await Swal.fire({
                        title: "Ya existe Checkin para esta Reserva, desea sobreescribirlo?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Si, Generar Checkin!",
                    });
                    if (result.isConfirmed) {
                        //Regenerar Checkin
                        Swal.fire("Ok!", "Se procede a regenerar el Checkin", "success");
                        loadCheckinData(fecha, data.obs)
                    }
                } catch (err) {
                    console.log(err);
                }

            } else {//Si para reservations._id no hay checkin => Generar Checkin
                try {
                    const result = await Swal.fire({
                        title: "Desea registrar el Checkin para esta Reserva?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Si, Generar Checkin!",
                    });
                    if (result.isConfirmed) {
                        //Regenerar Checkin
                        Swal.fire("Ok!", "Se procede a regenerar el Checkin", "success");
                        loadCheckinData(fecha, data.obs)
                    }
                } catch (err) {
                    console.log(err);
                }
            }

        } else {
            //marcar el error en el final del formulario
            if (allowed.status === 'paymentError') {
                setErrorCheckin({status: 'paymentError',
                message: 'Error de Pago: Debe Ingresar el pago Total de La Estadia para Realizar el Checkin'})
            }
        }



    }

    //Carga los datos del checkin en checkinTo Register (Objeto global)
    const loadCheckinData = async (fecha, obs) => {
        if (fromPage.from === 'reservationTable' && fromPage.flag === 'checkin') {
            //setear el objeto checkin con los datos a egistrar
            dispatch(
                setCheckInToRegister({
                    date: fecha,
                    confirmed: true,
                    reservation: reservationToCheckIn.id,
                    obs: obs
                    //...
                }));
            //en useEffect [checkinToRegiter] => registrar checkin en base de datos y actualizar fomPage.flag=''
        }
         //Actualizar el pago de la reserva, si es necesario ()
         const resEdited =await editReservation({...reservationToCheckIn, paid: paidAmount.current, checkin: true}, reservationToCheckIn.id)
         console.log('Resultado de edicion de Reserva '+ resEdited) 
          //Genera Checkin real en la base de datos
    }

    const setFormValues = async (action, dataClient) => {


        const rooms = await getRooms();

        let room = '';
        if (rooms) {
            room = rooms.filter(room => room.id === reservationToCheckIn.room)
        }


        if (action === 'checkinFromReservation') {
            //Datos de Reserva
            setValue('code', reservationToCheckIn.code);
            setValue('date', moment(now()).format("YYYY-MM-DD"));
            setValue('reservationDate', moment((reservationToCheckIn.date).toDate()).format("YYYY-MM-DD"));
            setValue('room', room[0].name);
            setValue('pax', reservationToCheckIn.pax);
            setValue('price', reservationToCheckIn.price);
            setValue('nights', reservationToCheckIn.nights);
            setValue('remainToPay', parseFloat(reservationToCheckIn.total - reservationToCheckIn.paid))
            setValue('total', reservationToCheckIn.total);
            setValue('paid', reservationToCheckIn.paid);
            setValue('inDate', moment((reservationToCheckIn.inDate).toDate()).format("YYYY-MM-DD"));
            setValue('outDate', moment((reservationToCheckIn.outDate).toDate()).format("YYYY-MM-DD"));
            //Datos del Cliente
            setValue('name', dataClient.name);
            setValue('surname', dataClient.surname);
            setValue('dni', dataClient.dni);
            setValue('telephone', dataClient.phone);
            setValue('nacionality', dataClient.nacionality);
            setValue('email', dataClient.email);
            setValue('street', dataClient.street);
            setValue('town', dataClient.town);
            setValue('postal_code', dataClient.postal_code);
            setValue('state', dataClient.state);
            setValue('country', dataClient.country);
            setValue('vehicleMark', dataClient.vehicle);
            setValue('vehiclePatent', dataClient.patent);
            setValue('checkinObs', dataClient.obs);//Campo agregado al Form para escribir Observacones del Checkin si fuera necesario
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    useEffect(()=>{

        console.log(JSON.stringify(errorCheckin,null,2))
    },[errorCheckin])

    useEffect(() => {
        /* console.log('CheckinToRegister ' + JSON.stringify(checkInToRegister, null,2)) */

        //Guardar en Bae de datos el checkin
        const getData = async () => {

           
            const resp = await setCheckinInDB(); //registra en base de datos el checkin con los datos del objetoGlobal checkinToRegister (del store de redux)

            if (resp) {
                //cerrar el modal y mostrar la grilla de reservas

                await getReservationsForTable();
                closeModal();
                //desde aca
            }
        }
        if (checkInToRegister !== "") {

            //Si se registro el Pago Totao => Permite hacer el Checkin
            //Si NO, mostrar Mensaje y No Hacer Nada
            /* if(MontoAbonado === MontoReserva){ 
                getData();
            } */
            getData();
        }


    }, [checkInToRegister])

    useEffect(() => {
        /* console.log('de table '+JSON.stringify(clients,null,2));
        console.log('de checkin '+JSON.stringify(reservationToCheckIn,null,2)); */
        let checkinClient = [];
        //sacar de clients los datos del cliente actual (checkInReservation.client)
        checkinClient = clients.filter(cli => cli.id === reservationToCheckIn.client)
        if (checkinClient[0]?.id) {
            /* console.log('Encontrado '+JSON.stringify(checkinClient[0],null,2)) */
            setFormValues('checkinFromReservation', checkinClient[0])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clients]);


    useEffect(()=>{
        //Reserva seleccionada en Reservation.jsx para hacer el checkin
        console.log(`Reserva seleccionada en la tabla: ${JSON.stringify(reservationToCheckIn,null,2)}`)
    },[reservationToCheckIn])

    useEffect(() => {

        dispatch(setCheckInToRegister({})); //Inicializo el objeto del checkin

        if (newCheckin === false/* fromPage.from === 'reservationTable' && fromPage.flag === 'checkin'  */) {
            getClients();
            getRooms();
        } else {
            //si vengo del boton de Checkin (New Check-In)
            //Habilitar todos los controlesd del form para cargar los datos manualmente
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={`ms-4 mb-5 mt-4 form ${formCrudStyle.reservationsCrudFormContainer}`}>
            <form onSubmit={handleSubmit(handleForm)} className={`ms-4 mb-5 mt-4 form ${formCrudStyle.formMain}`}>
                <div className='container-fluid formBody m-0 p-0'>
                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                        <div className='row d-flex justify-content-between align-items-center p-0 m-0 col-md-6 col-12'>
                            <div className='col-2'>
                                <label className={`text-center ${formCrudStyle.labelInputForm}`} >FECHA</label>
                            </div>
                            <div className='col-9 col-md-10'>
                                <input
                                    type='date'
                                    {...register("date", {
                                        required: { value: true, message: 'por favor, Ingrese la Fecha De Registro de Check-In' },
                                        minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' },
                                    })
                                    }
                                    id="ChekinDate"
                                    className="form-control input m-0 "
                                    placeholder="Fecha"
                                    disabled={false}
                                />
                                <span className="text-danger text-small d-block mb-2">
                                    {(errors?.date?.type === 'pattern' || errors?.date?.type === 'required' || errors?.date?.type === 'minLength') && <span className="text-danger text-small d-block mb-2">{errors?.date?.message}</span>}
                                </span>
                            </div>
                        </div>
                        <div className='reservationContainer card mt-2'>
                            <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                <div className='col-12 '><h5>RESERVA</h5></div>
                                {/* <label className={`col-3 m-0 `} >RESERVA</label> */}
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="code" className={` ${formCrudStyle.labelInputForm}`}>CÓDIGO</label></div>
                                    <input
                                        type='text'
                                        {...register("code", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' }
                                        })
                                        }
                                        id='reservationCode'
                                        className="form-control my-2 input m-0"
                                        placeholder="Código"
                                        disabled={false}
                                    />
                                    {errors?.code && <span className="text-danger text-small d-block mb-2">{errors?.code?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="code" className={` ${formCrudStyle.labelInputForm}`}>FECHA DE RESERVA</label></div>
                                    <input
                                        type='date'
                                        {...register("reservationDate", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' }
                                        })
                                        }
                                        id='reservationDate'
                                        className="form-control my-2 input m-0"
                                        placeholder="Fecha de Reserva"
                                        disabled={false}
                                    />
                                    {errors?.reservationDate && <span className="text-danger text-small d-block mb-2">{errors?.reservationDate?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="code" className={` ${formCrudStyle.labelInputForm}`}>FECHA DE INGRESO</label></div>
                                    <input
                                        type='date'
                                        {...register("inDate", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' }
                                        })
                                        }
                                        id='reservationInDate'
                                        className="form-control my-2 input m-0"
                                        placeholder="Fecha de Ingreso"
                                        disabled={false}
                                    />
                                    {errors?.inDate && <span className="text-danger text-small d-block mb-2">{errors?.inDate?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="code" className={` ${formCrudStyle.labelInputForm}`}>FECHA DE EGRESO</label></div>
                                    <input
                                        type='date'
                                        {...register("outDate", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' }
                                        })
                                        }
                                        id='reservationOutDate'
                                        className="form-control my-2 input m-0"
                                        placeholder="Fecha de Egreso"
                                        disabled={false}
                                    />
                                    {errors?.outDate && <span className="text-danger text-small d-block mb-2">{errors?.outDate?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="code" className={` ${formCrudStyle.labelInputForm}`}>NOCHES</label></div>
                                    <input
                                        type='text'
                                        {...register("nights", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                        })
                                        }
                                        id='reservationNights'
                                        className="form-control my-2 input m-0"
                                        placeholder="Noches"
                                        disabled={false}
                                    />
                                    {(errors?.nights?.type === 'required' || errors?.nights?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.nights?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="price" className={` ${formCrudStyle.labelInputForm}`}>PRECIO/NOCHE [$]</label></div>
                                    <input
                                        type='text'
                                        {...register("price", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            pattern: { value: /^\d{1,8}(\.\d{1,3})?$/, message: 'El precio puede tener hasta 3 decimales ######.###' }
                                        })
                                        }
                                        id='reservationPrice'
                                        className="form-control my-2 input m-0"
                                        placeholder="Precio por Noche"
                                        disabled={false}
                                    />
                                    {(errors?.price?.type === 'required' || errors?.price?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.price?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="total" className={` ${formCrudStyle.labelInputForm}`}>TOTAL ESTADÍA [$]</label></div>
                                    <input
                                        type='text'
                                        {...register("total", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                        })
                                        }
                                        id='total'
                                        className="form-control my-2 input m-0"
                                        placeholder="Total Estadia"
                                        disabled={false}
                                    />
                                    {(errors?.total?.type === 'required' || errors?.total?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.total?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="paid" className={` ${formCrudStyle.labelInputForm}`}>MONTO ABONDO [$]</label></div>
                                    <input
                                        type='text'
                                        {...register("paid", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                        })
                                        }
                                        id='reservationPaid'
                                        className="form-control my-2 input m-0"
                                        placeholder="Monto Abonado"
                                        disabled={false}
                                    />
                                    {(errors?.paid?.type === 'required' || errors?.paid?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.paid?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="remainToPay" className={` ${formCrudStyle.labelInputForm}`}>PENDIENTE DE PAGO [$]</label></div>
                                    <input
                                        type='text'
                                        {...register("remainToPay", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                        })
                                        }
                                        id='reservationRemainToPay'
                                        className="form-control my-2 input m-0"
                                        placeholder="Resta Abonar"
                                        disabled={false}
                                    />
                                    {(errors?.remainToPay?.type === 'required' || errors?.remainToPay?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.remainToPay?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="pax" className={` ${formCrudStyle.labelInputForm}`}>PASAJEROS</label></div>
                                    <input
                                        type='text'
                                        {...register("pax", {
                                            required: { value: true, message: 'por favor, Ingrese la Cantidad de Pasajeros' },
                                            pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                        })
                                        }
                                        id='pax'
                                        className="form-control my-2 input m-0"
                                        placeholder="Pasajeros"
                                        disabled={false}
                                    />
                                    {(errors?.pax?.type === 'required' || errors?.pax?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.pax?.message}</span>}
                                </div>

                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="room" className={` ${formCrudStyle.labelInputForm}`}>HABITACIÓN</label></div>
                                    <input
                                        type='text'
                                        {...register("room", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='reservationRoom'
                                        className="form-control my-2 input m-0"
                                        placeholder="Habitación"
                                        disabled={false}
                                    />
                                    {errors?.room && <span className="text-danger text-small d-block mb-2">{errors?.room?.message}</span>}
                                </div>
                            </div>
                        </div>
                        <div className='clientContainer card mt-3'>
                            <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                <div className='col-12 mt-2'><h5>CLENTE</h5></div>
                                {/* <label className={`col-3 m-0 `} >CLIENTE</label> */}
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="name" className={` ${formCrudStyle.labelInputForm}`}>NOMBRE</label></div>
                                    <input
                                        type='text'
                                        {...register("name", {
                                            required: { value: true, message: 'por favor, Ingrese el Nombre' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientName'
                                        className="form-control my-2 input m-0"
                                        placeholder="Nombre"
                                        disabled={false}
                                    />
                                    {errors?.name && <span className="text-danger text-small d-block mb-2">{errors?.name?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="surname" className={` ${formCrudStyle.labelInputForm}`}>APELLIDO</label></div>
                                    <input
                                        type='text'
                                        {...register("surname", {
                                            required: { value: true, message: 'por favor, Ingrese el Apellido' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientSurename'
                                        className="form-control my-2 input m-0"
                                        placeholder="Apellido"
                                        disabled={false}
                                    />
                                    {errors?.surname && <span className="text-danger text-small d-block mb-2">{errors?.surname?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="dni" className={` ${formCrudStyle.labelInputForm}`}>DOCUMENTO NRO.</label></div>
                                    <input
                                        type='text'
                                        {...register("dni", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            minLength: { value: 8, message: 'el DIN debe tener 8 dígitos numéricos' },
                                            maxLength: { value: 8, message: 'el DIN debe tener 8 dígitos numéricos' },
                                            pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                        })
                                        }
                                        id='clientDni'
                                        className="form-control my-2 input m-0"
                                        placeholder="Documento de Identidad"
                                        disabled={false}
                                    />
                                    {(errors?.dni?.type === 'required' || errors?.dni?.type === 'pattern' || errors?.dni?.type === 'minLength' || errors?.dni?.type === 'maxLength') && <span className="text-danger text-small d-block mb-2">{errors?.dni?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="telephone" className={` ${formCrudStyle.labelInputForm}`}>TELÉFONO</label></div>
                                    <input
                                        type='text'
                                        {...register("telephone", {
                                            required: { value: true, message: 'por favor, Ingrese un Telefono' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientTelephone'
                                        className="form-control my-2 input m-0"
                                        placeholder="Teléfono"
                                        disabled={false}
                                    />
                                    {errors?.telephone && <span className="text-danger text-small d-block mb-2">{errors?.telephone?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="nacionality" className={` ${formCrudStyle.labelInputForm}`}>NACIONALIDAD</label></div>
                                    <input
                                        type='text'
                                        {...register("nacionality", {
                                            required: { value: true, message: 'por favor, Ingrese la Nacionalidad' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientNationality'
                                        className="form-control my-2 input m-0"
                                        placeholder="Nacionalidad"
                                        disabled={false}
                                    />
                                    {/* {errors?.code && <span className="text-danger text-small d-block mb-2">{errors?.code?.message}</span>} */}
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div><label htmlFor="email" className={` ${formCrudStyle.labelInputForm}`}>E-MAIL</label></div>
                                    <input
                                        type='text'
                                        {...register("email", {
                                            required: { value: true, message: 'por favor, Ingrese un Email Válido' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientEmail'
                                        className="form-control my-2 input m-0"
                                        placeholder="Email"
                                        disabled={false}
                                    />
                                    {errors?.email && <span className="text-danger text-small d-block mb-2">{errors?.email?.message}</span>}
                                </div>
                            </div>
                            <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                <div className='col-12 mt-2'><h6>DOMICILIO</h6></div>
                                {/* <label className={`col-3 m-0 `} >DOMICILIO</label> */}
                                <div className='col-md-6 col-12'>
                                    <div><label htmlFor="street" className={` ${formCrudStyle.labelInputForm}`}>CALLE</label></div>
                                    <input
                                        type='text'
                                        {...register("street", {
                                            required: { value: true, message: 'por favor, Calle / Numero / Barrio' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientStreet'
                                        className="form-control my-2 input m-0"
                                        placeholder="Calle y Nro"
                                        disabled={false}
                                    />
                                    {errors?.street && <span className="text-danger text-small d-block mb-2">{errors?.street?.message}</span>}
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div><label htmlFor="town" className={` ${formCrudStyle.labelInputForm}`}>LOCALIDAD</label></div>
                                    <input
                                        type='text'
                                        {...register("town", {
                                            required: { value: true, message: 'por favor, Ingrese Localidad' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientTown'
                                        className="form-control my-2 input m-0"
                                        placeholder="Localidad"
                                        disabled={false}
                                    />
                                    {errors?.town && <span className="text-danger text-small d-block mb-2">{errors?.town?.message}</span>}
                                </div>
                                <div className='col-md-3 col-6'>
                                    <div><label htmlFor="postal_code" className={` ${formCrudStyle.labelInputForm}`}>CÓDIGO POSTAL</label></div>
                                    <input
                                        type='text'
                                        {...register("postal_code", {
                                            required: { value: true, message: 'por favor, Ingrese Código Postal' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientPostalCode'
                                        className="form-control my-2 input m-0"
                                        placeholder="Código Postal"
                                        disabled={false}
                                    />
                                    {errors?.postal_code && <span className="text-danger text-small d-block mb-2">{errors?.postal_code?.message}</span>}
                                </div>
                                <div className='col-md-5 col-sm-6 col-12'>
                                    <div><label htmlFor="state" className={` ${formCrudStyle.labelInputForm}`}>PROVINCIA</label></div>
                                    <input
                                        type='text'
                                        {...register("state", {
                                            required: { value: true, message: 'por favor, Ingrese la Provincia' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientState'
                                        className="form-control my-2 input m-0"
                                        placeholder="Provincia"
                                        disabled={false}
                                    />
                                    {errors?.state && <span className="text-danger text-small d-block mb-2">{errors?.state?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-6 col-12'>
                                    <div><label htmlFor="country" className={` ${formCrudStyle.labelInputForm}`}>PAIS</label></div>
                                    <input
                                        type='text'
                                        {...register("country", {
                                            required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientCountry'
                                        className="form-control my-2 input m-0"
                                        placeholder="Pais"
                                        disabled={false}
                                    />
                                    {errors?.country && <span className="text-danger text-small d-block mb-2">{errors?.country?.message}</span>}
                                </div>
                            </div>
                            <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                <div className='col-12 mt-2'><h6>VEHICULO</h6></div>
                                {/* <label className={`col-3 m-0 `} >VEHICULO</label> */}
                                <div className='col-md-8 col-sm-8 col-12'>
                                    <div><label htmlFor="vehicleMark" className={` ${formCrudStyle.labelInputForm}`}>MARCA/MODELO</label></div>
                                    <input
                                        type='text'
                                        {...register("vehicleMark", {
                                            required: { value: true, message: 'por favor, Ingrese Marca/Modelo del Vehiculo' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientVehicleMark'
                                        className="form-control my-2 input m-0"
                                        placeholder="Marca"
                                        disabled={false}
                                    />
                                    {errors?.vehicleMark && <span className="text-danger text-small d-block mb-2">{errors?.vehicleMark?.message}</span>}
                                </div>
                                <div className='col-md-4 col-sm-4 col-12'>
                                    <div><label htmlFor="vehiclePatent" className={` ${formCrudStyle.labelInputForm}`}>PATENTE</label></div>
                                    <input
                                        type='text'
                                        {...register("vehiclePatent", {
                                            required: { value: true, message: 'por favor, Ingrese Nro. de Patente del Vehículo' },
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='clientVehiclePatent'
                                        className="form-control my-2 input m-0"
                                        placeholder="Patente"
                                        disabled={false}
                                    />
                                    {errors?.vehiclePatent && <span className="text-danger text-small d-block mb-2">{errors?.vehiclePatent?.message}</span>}
                                </div>
                                <div className='col-12'>
                                    <div><label htmlFor="obs" className={` ${formCrudStyle.labelInputForm}`}>OBSERVACIONES</label></div>
                                    <input
                                        type='text'
                                        {...register("obs", {
                                            /* required: { value: true, message: 'por favor, Ingrese Nro. de Patente del Vehículo' }, */
                                            /* maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' } */
                                        })
                                        }
                                        id='obs'
                                        className="form-control my-2 input m-0"
                                        placeholder=""
                                        disabled={false}
                                    />
                                    {/*  {errors?.vehiclePatent && <span className="text-danger text-small d-block mb-2">{errors?.vehiclePatent?.message}</span>} */}
                                
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='container col-12 mt-3'>
                    <button type="submit" className="btn btn-secondary" disabled={false}>
                        Confirmar Checkin
                    </button>
                    {(errorCheckin.status === 'paymentError') && <span className="text-danger text-small d-block mb-2 mt-2 rounded w-100 text-center">{errorCheckin.message}</span>}
                </div>
              
            </form>
            
        </div>
    )
}

export { FormCheckIn };