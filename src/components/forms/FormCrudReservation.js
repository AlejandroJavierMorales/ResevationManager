import React, { useEffect, useState } from 'react';
import formCrudStyle from './_formCrudReservation.module.scss'
import { useForm } from 'react-hook-form';
import { useAuxCrudFunctions, useFirebaseReservations, useGlobalContext, useModal } from '../../hooks/index';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';



const FormCrudReservations = () => {

    const { getLastCodeReservation, getReservationsForTable, getRooms, getClients, getBanks, addReservation, editReservation, getReservations } = useFirebaseReservations();
    const dispatch = useDispatch();
    const { reservationToModify: reservationToEdit, listReservations: reservations, listRooms: rooms, listClients: clients, listBanks: banks } = useSelector(state => state.reservations);
    const { deactivateForm, activateForm, setButtonsState } = useAuxCrudFunctions();

    let today = moment((Date.now())).format('YYYY-MM-DD');

    const { register, handleSubmit, formState: { errors }, setError, clearErrors, watch, setValue, reset } = useForm();
    const { actualPage, setActualPage, reservation, setReservation, fromPage, setFromPage } = useGlobalContext();
    const navigate = useNavigate();
    const [modal, setModal] = useState(false)
    const [crudAction, setCrudAction] = useState('');
    const { isOpen, openModal, closeModal } = useModal(false)
    const [controls, setControls] = useState({//objeto que contiene el estado de cada boton de control (disabled true o false)
        add: false,
        edit: true,
        delete: true,
        search: false,
        cancel: true
    });
    const [newLastCodeReservation, setNewLastCodeReservation] = useState('')

    const form = document.querySelectorAll('.input');
    const buttons = document.querySelectorAll('.btnForm');

    const handleCloseCrudRes = async (e) => {
        e && e.preventDefault();
        setActualPage('reservations_table')
        /*  await getReservationsForTable(); */
        navigate('/view_reservations');
    }

    const setLastCodeReservations = async () => {
        const lastCode = await getLastCodeReservation()
        if (lastCode) {
            console.log('ultima reserva'+ parseInt(lastCode.split('_')[1]))
            console.log('ultima reserva + 1'+ (parseInt(lastCode.split('_')[1])+1))
            document.getElementById('inputCode').value = lastCode.split('_')[0] + '_' + (parseInt(lastCode.split('_')[1]) + parseInt(1)).toString().padStart(3, '0');
            setNewLastCodeReservation(lastCode.split('_')[0] + '_' + (parseInt(lastCode.split('_')[1]) + parseInt(1)).toString().padStart(3, '0'));
        } else {
            const year = new Date().getFullYear();
            document.getElementById('inputCode').value = `${year}_1`;
            setNewLastCodeReservation(`${year}_1`)
        }

    }

    const handleControls = (control, e) => {
        e && e.preventDefault();
        if (control === 'init') {
            setControls(setButtonsState('init'));
            deactivateForm(form, buttons);
            setCrudAction('init');
        } else if (control === 'cancel') {
            setControls(setButtonsState('cancel'));
            deactivateForm(form, buttons);
            setCrudAction('cancel');
            document.getElementsByTagName('form')[0].reset();
            clearErrors();
            setReservation({});
            handleCloseCrudRes(e)
        } else if (control === 'add') {
            setControls(setButtonsState('add'));
            activateForm(form, buttons);
            setCrudAction('add');
        } else if (control === 'edit') {
            setControls(setButtonsState('edit'));
            activateForm(form, buttons);
            setCrudAction('edit');
        } else if (control === 'search') {
            setControls(setButtonsState('search'));
            setCrudAction('search');
            openModal();
            navigate('/search');
        } else if (control === 'delete') {
            setControls(setButtonsState('delete'));
            setCrudAction('delete');
        };
    }
    const onSubmit =  (data, e) => {
        
        /* console.log(newLastCodeReservation) */
        let fecha1 = new Date(data.date + ' 13:00');
        let fecha2 = new Date(data.inDate + ' 13:00');
        let fecha3 = new Date(data.outDate + ' 13:00');

        if (fromPage.flag === 'edit') {
            setReservation((prev) => ({
                ...prev,
                code: data?.code,
                date: fecha1,
                client: data.client,
                pax: data.pax,
                inDate: fecha2,
                outDate: fecha3,
                paid: data.paid,
                bank: data.bank,
                price: data.price,
                room: data.room,
                obs: 'nada',
                type: 'A',
                confirmed: true,
                invoice: true,
                total: reservationToEdit.total,
                nights: reservationToEdit.nights,
                checkin: reservationToEdit.checkin,
            }));
        } else {

            let nigthsDif = moment(fecha3).diff(
                moment(fecha2),
                "days"
            );
            let totalPrice = parseFloat(data.price * nigthsDif);


            setReservation((prev) => ({
                ...prev,
                code: newLastCodeReservation,
                date: fecha1,
                client: data.client,
                pax: data.pax,
                inDate: fecha2,
                outDate: fecha3,
                paid: data.paid,
                bank: data.bank,
                price: data.price,
                room: data.room,
                obs: 'nada',
                type: 'A',
                confirmed: true,
                invoice: true,
                checkin: false,
                total: totalPrice,
                nights: nigthsDif,
                /* id: reservationToEdit.id */
            }));
        }

        // limpiar campos
        e.target.reset();
        deactivateForm(form, buttons);
        setControls(setButtonsState('init'));
        /* navigate('/view_reservations'); */
    }

    useEffect(() => {

        const addEditReservation = async () => {
            /* console.log('RESERVATION '+JSON.stringify(reservation,null,2) )
            console.log('RESERVATION to Edit '+JSON.stringify(reservationToEdit,null,2) ) */
            if (reservation?.code && crudAction === 'add') {//crudAction se define segun el button presionado (add,edit,search,delete,cancel)
                setFromPage({ from: 'formCrudReservation' });
                if (await addReservation(reservation)) {
                    setReservation({});
                    handleCloseCrudRes();
                    await getReservationsForTable();
                    navigate('/view_reservations');
                };
            } else if (reservation?.code && crudAction === 'edit') {
                setFromPage({ from: 'formCrudReservation' });
                if (await editReservation(reservation, reservationToEdit.id)) {
                    setReservation({});
                    handleCloseCrudRes();
                    await getReservationsForTable();
                    navigate('/view_reservations');
                };
            }

        }
        addEditReservation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reservation])

    useEffect(() => {
        /* console.log('ROOMS: ' + rooms) */
    }, [rooms])
    useEffect(() => {
        /* console.log('CLIENTES: ' + clients) */
    }, [clients])
    useEffect(() => {
        /* console.log('BANCOS: ' + banks) */
    }, [banks])

    useEffect(() => {
        document.querySelector('.add').disabled = controls?.add;
        document.querySelector('.edit').disabled = controls?.edit;
        document.querySelector('.delete').disabled = controls?.delete;
        document.querySelector('.search').disabled = controls?.search;
        document.querySelector('.cancel').disabled = controls?.cancel;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls])

    useEffect(() => {


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actualPage])

    const setFormValues = (action) => {

        if (action === 'add') {
            setValue('code', setLastCodeReservations());
            setValue('date', today);
        } else if (action === 'edit') {
            setValue('code', reservationToEdit.code);
            setValue('date', moment((reservationToEdit.date).toDate()).format("YYYY-MM-DD"));
            setValue('room', reservationToEdit.room);
            setValue('price', reservationToEdit.price);
            setValue('client', reservationToEdit.client);
            setValue('bank', reservationToEdit.bank);
            setValue('pax', reservationToEdit.pax);
            setValue('paid', reservationToEdit.paid);
            setValue('inDate', moment((reservationToEdit.inDate).toDate()).format("YYYY-MM-DD"));
            setValue('outDate', moment((reservationToEdit.outDate).toDate()).format("YYYY-MM-DD"));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    useEffect(() => {
        const form = document.querySelectorAll('.input');
        const buttons = document.querySelectorAll('.btnForm');
        setActualPage('formCrudReservation');
        const getData = async () => {
            //traer la ultima reserva para calcular nuevo Code
            /*  await getReservations();  */
            //traer Rooms
            (await getRooms());
            //Traer Clients
            (await getClients());
            //Traer Banks
            (await getBanks())
        }
        getData()
        if ((fromPage.from === 'reservationTable' || fromPage.from === 'root') && fromPage.flag === 'add') {

            handleControls(fromPage.flag) //setea controles para agregar una nueva reserva
            activateForm(form, buttons)//no ESTA FUNCIONANDO - VER enun UseEffect
            reset();//reset Form
            setFormValues('add');
        } else if (fromPage.from === 'reservationTable' && fromPage.flag === 'edit') {
            handleControls(fromPage.flag) //setea controles para agregar una nueva reserva
            setFormValues('edit');
            activateForm(form, buttons)
            /*  }, 1000) */

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <>
            <div className={`container-fluid text-center justify-content-center mt-3 ${formCrudStyle.container_gral}`}>
                <div className={`${formCrudStyle.reservationsCrudFormContainer}  card m-2 p-2`}>
                    {(fromPage.from === 'reservationTable' &&
                        <div className='row d-flex justify-content-between'>
                            <div className='col-9'>
                                <h5 className={`w-100 text-center ${formCrudStyle.titleForm}`}>RESERVAS</h5>
                            </div>

                            <div className='closeContainer col-3'>
                                <span onClick={(e) => handleCloseCrudRes(e)} className='closeCrudRes btn btn-secondary'>CERRAR</span>
                            </div>

                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} className={`ms-4 mb-5 mt-4 form ${formCrudStyle.formMain}`}>
                        <div className='container-fluid formBody'>
                            <div className='row d-flex justify-content-center align-items-start'>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputCode">CÓDIGO</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("code", {
                                                    required: { value: true, message: 'por favor, Ingrese el Codigo de la Reserva' },
                                                    maxLength: { value: 10, message: 'el Código puede tener 10 caracteres maximo' }
                                                })
                                                }
                                                id='inputCode'
                                                className="form-control my-2 input m-0"
                                                placeholder="Codigo de Reserva"
                                                /* readOnly */
                                            />
                                            {errors?.code && <span className="text-danger text-small d-block mb-2">{errors?.code?.message}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputDate">FECHA</label>
                                        <div className='col-9'>
                                            <input
                                                type='date'
                                                {...register("date", {
                                                    required: { value: true, message: 'por favor, Ingrese la Fecha de Toma de Reserva' },
                                                    minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' },
                                                })
                                                }
                                                id="inputDate"
                                                className="form-control my-2  input m-0"
                                                placeholder="Fecha de Toma de Reserva"
                                                disabled={true}
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.date?.type === 'pattern' || errors?.date?.type === 'required' || errors?.date?.type === 'minLength') && <span className="text-danger text-small d-block mb-2">{errors?.date?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputClient">CLIENTE</label>
                                        <div className='col-9'>
                                            <select
                                                {...register("client", {
                                                    required: { value: true, message: 'por favor, seleccione un Cliente' },
                                                    pattern: { value: !/Seleccionar Cliente/, message: "Error de Patron" }

                                                })
                                                }
                                                className="form-control my-2 input m-0"
                                                disabled={true}
                                                id="inputClient"
                                            >
                                                <option value="">Seleccionar Cliente</option>
                                                {clients.length > 0 && clients.map(item => (
                                                    <option key={item.id} value={item.id}>{`${item.surname} ${item.name} - DNI: ${item.dni}`}</option>
                                                ))}
                                            </select>
                                            {(errors?.client?.type === 'focus' || errors?.client?.type === 'required' || errors?.client?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.client?.message}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputPax">PASAJEROS</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("pax", {
                                                    required: { value: true, message: 'por favor, Ingrese Cantidad de Pasajeros' },
                                                    pattern: { value: /^[0-9]+$/, message: 'Ingrese un valor numérico válido' }
                                                })
                                                }
                                                className="form-control my-2 input"
                                                placeholder="Cantidad de Pasajeros"
                                                disabled={true}
                                                id="inputPax"
                                            />
                                            {(errors?.pax?.type === 'required' || errors?.pax?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.pax?.message}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputCheckIn">CHECK-IN</label>
                                        <div className='col-9'>
                                            <input
                                                type='date'
                                                {...register("inDate", {
                                                    required: { value: true, message: 'por favor, Ingrese la Fecha de Ingreso' },
                                                    minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' },
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Fecha de Ingreso"
                                                disabled={true}
                                                id="inputCheckIn"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.inDate?.type === 'pattern' || errors?.inDate?.type === 'required' || errors?.inDate?.type === 'minLength') && <span className="text-danger text-small d-block mb-2">{errors?.inDate?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputCheckOut">CHECK-OUT</label>
                                        <div className='col-9'>
                                            <input
                                                type='date'
                                                {...register("outDate", {
                                                    required: { value: true, message: 'por favor, Ingrese la Fecha de Egreso' },
                                                    minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' },
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Fecha de Egreso"
                                                disabled={true}
                                                id="inputCheckOut"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.outDate?.type === 'pattern' || errors?.outDate?.type === 'required' || errors?.outDate?.type === 'minLength') && <span className="text-danger text-small d-block mb-2">{errors?.outDate?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputRoom">HABITACIÓN</label>
                                        <div className='col-9'>
                                            <select
                                                {...register("room", {
                                                    required: { value: true, message: 'por favor, seleccione una Categoria' },
                                                    pattern: { value: !/Seleccionar Habitacion/, message: "Error de Patron" }
                                                })
                                                }
                                                className="form-control my-2 input category"
                                                disabled={true}
                                                id='inputRoom'
                                            >
                                                <option value="">Seleccionar Habitacion</option>
                                                {rooms.length > 0 && rooms.map(item => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </select>
                                            {(errors?.room?.type === 'focus' || errors?.room?.type === 'required' || errors?.room?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.room?.message}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputPrice">PRECIO</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("price", {
                                                    required: { value: true, message: 'por favor, Ingrese Precio de la Noche de Alojamiento' },
                                                    pattern: { value: /^\d{1,8}(\.\d{1,3})?$/, message: 'El precio puede tener hasta 3 decimales ######.###' }
                                                })
                                                }
                                                className="form-control my-2 input"
                                                placeholder="Precio por Noche"
                                                disabled={true}
                                                id="inputPrice"
                                            />
                                            {(errors?.price?.type === 'required' || errors?.price?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.price?.message}</span>}
                                        </div>
                                    </div>

                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputPaid">PAGO</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("paid", {
                                                    required: { value: true, message: 'por favor, Ingrese Monto Abonado de la Reserva' },
                                                    pattern: { value: /^\d{1,8}(\.\d{1,3})?$/, message: 'El precio puede tener hasta 3 decimales ######.###' }
                                                })
                                                }
                                                className="form-control my-2 input"
                                                placeholder="Pago Reserva"
                                                disabled={true}
                                                id="inputPaid"
                                            />
                                            {(errors?.paid?.type === 'required' || errors?.paid?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.paid?.message}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputBank">BANCO</label>
                                        <div className='col-9'>
                                            <select
                                                {...register("bank", {
                                                    required: { value: true, message: 'por favor, seleccione un Banco' },
                                                    pattern: { value: !/Seleccionar Banco/, message: "Error de Patron" }
                                                })
                                                }
                                                className="form-control my-2 input category"
                                                disabled={true}
                                                id="inputBank"
                                            >
                                                <option value="">Seleccionar Banco</option>
                                                {banks.length > 0 && banks.map(item => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </select>
                                            {(errors?.bank?.type === 'focus' || errors?.bank?.type === 'required' || errors?.bank?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.bank?.message}</span>}
                                        </div>
                                    </div>

                                </div>
                                <div className='col-md-6 col-12'>
                                </div>
                                <div className='col-12'>
                                    <button
                                        type="submit"
                                        className="btn btn-secondary btnForm"
                                        disabled={true}
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>

                    </form>
                    <div className='controlsContainer container-fluid d-flex justify-content-center'>
                        <div className='row d-flex justify-content-evenly w-100 m-0 p-0'>
                            <div className='mt-1 col-5 col-sm-3'>
                                <button onClick={(e) => handleControls('add', e)} className='btn btn-secondary w-100 add'>Agregar</button>
                            </div>
                            <div className=' mt-1 col-5 col-sm-3'>
                                <button onClick={(e) => handleControls('edit', e)} className='btn btn-secondary w-100 edit'>Modificar</button>
                            </div>
                            <div className=' mt-1 col-5 col-sm-2'>
                                <button onClick={(e) => handleControls('delete', e)} className='btn btn-secondary w-100 delete'>Borrar</button>
                            </div>
                            <div className=' mt-1 col-5 col-sm-2'>
                                <button onClick={(e) => handleControls('search', e)} className='btn btn-secondary w-100 search'>Buscar</button>
                            </div>
                            <div className='mt-1 col-5 col-sm-2'>
                                <button onClick={(e) => handleControls('cancel', e)} className='btn btn-secondary w-100 btnForm cancel' >Cancelar</button>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
            {/*  <div>
                <Modal isOpen={isOpen} closeModal={closeModal} title={'Búsqueda de productos'}>
                    <SearchBar />
                    <table className='tableContainer mt-4 border rounded p-1'>
                        <thead >
                            <tr >
                                <th className='border rounded p-1 py-2'>Producto</th>
                                <th className='border rounded p-1 py-2'>Descripción</th>
                                <th className='border rounded p-1 py-2'></th>
                            </tr>


                        </thead>
                        <tbody >
                            {products?.length > 0 &&
                                products.map(item => (
                                    <tr key={item?.id} className='border rounded p-1'>
                                        <td className='border rounded p-1'>{item?.name}</td>
                                        <td className='border rounded p-1'>{item?.description} </td>
                                        <td className='border rounded p-1'><img className='imgEditProd' src={imgEdit} alt="icono edit" width={18} title='Editar' /></td>
                                    </tr>
                                ))
                            }

                        </tbody>
                    </table>
                </Modal>
            </div> */}
        </>
    );
}

export { FormCrudReservations };