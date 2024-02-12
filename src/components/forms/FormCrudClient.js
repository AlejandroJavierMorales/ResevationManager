import React, { useEffect, useState } from 'react';
import formCrudStyle from './_formCrudReservation.module.scss'
import { useForm } from 'react-hook-form';
import { useAuxCrudFunctions, useFirebaseReservations, useGlobalContext, useModal } from '../../hooks/index';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';



const FormCrudClient = ({closeModal}) => {

    const { getClients, addClient, editClient } = useFirebaseReservations();
    /* const dispatch = useDispatch(); */
    const { clientToModify: clientToEdit, listClients: clients } = useSelector(state => state.reservations);
    const { deactivateForm, activateForm, setButtonsState } = useAuxCrudFunctions();


    let today = moment((Date.now())).format('YYYY-MM-DD');

    const[closeForm, setCloseForm] = useState(false);
    const { register, handleSubmit, formState: { errors }, setError, clearErrors, watch, setValue, reset } = useForm();
    const { actualPage, setActualPage, setClient, fromPage, setFromPage, client } = useGlobalContext();
    const navigate = useNavigate();
    const [crudAction, setCrudAction] = useState('');

    const [controls, setControls] = useState({//objeto que contiene el estado de cada boton de control (disabled true o false)
        add: false,
        edit: true,
        delete: true,
        cancel: true
    });


    const form = document.querySelectorAll('.input');
    const buttons = document.querySelectorAll('.btnForm');

    const handleCloseCrudRes = async (e) => {
        e && e.preventDefault();
        setActualPage('clientsTable')
        setFromPage({from:'', flag:''})
        await getClients();
        /* navigate('/view_clients'); */
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
            setClient({});
            handleCloseCrudRes(e)
        } else if (control === 'add') {
            setControls(setButtonsState('add'));
            activateForm(form, buttons);
            setCrudAction('add');
        } else if (control === 'edit') {
            setControls(setButtonsState('edit'));
            activateForm(form, buttons);
            setCrudAction('edit');
        } else if (control === 'delete') {
            setControls(setButtonsState('delete'));
            setCrudAction('delete');
        };
    }
    const handleForm = (data, e) => {
        
        let fecha = new Date(data.date + ' 12:00' );

        if (fromPage.flag === 'edit') {
            setClient((prev) => ({
                ...prev,
                addedDate: fecha,
                dni: data.dni,
                name: data.name,
                surname: data.surname,
                email: data.email,
                street: data.street,
                town: data.town,
                state: data.state,
                country: data.country,
                nacionality: data.nacionality,
                vehicle: data.vehicle,
                patent: data.patent,
                postal_code: data.postal_code,
                phone: data.phone,
                id: clientToEdit.id
            }));
        } else {

            setClient((prev) => ({

                ...prev,
                addedDate: fecha,
                dni: data.dni,
                name: data.name,
                surname: data.surname,
                email: data.email,
                street: data.street,
                town: data.town,
                state: data.state,
                country: data.country,
                nacionality: data.nacionality,
                vehicle: data.vehicle,
                patent: data.patent,
                postal_code: data.postal_code,
                phone: data.phone
            }));
        }
        setActualPage('clientsTable');
        // limpiar campos
        e.target.reset();
        deactivateForm(form, buttons);
        setControls(setButtonsState('init'));
        setCloseForm(true);
    }

    useEffect(() => {
        if (client?.dni && crudAction === 'add') {//crudAction se define segun el button presionado (add,edit,search,delete,cancel)
            if (addClient(client)) {
                setClient({});
                handleCloseCrudRes();
            };
        } else if (client?.dni && crudAction === 'edit') {
            if (editClient(client)) {
                setClient({});
                handleCloseCrudRes();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client])



    useEffect(() => {
        document.querySelector('.add').disabled = controls?.add;
        document.querySelector('.edit').disabled = controls?.edit;
        document.querySelector('.delete').disabled = controls?.delete;
        document.querySelector('.cancel').disabled = controls?.cancel;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls])

    useEffect(() => {
        if (actualPage==='clientsTable'){
            navigate('/view_clients');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actualPage])

    const setFormValues = (action) => {
        
        if (action === 'add') {
            setValue('date', today);
        } else if (action === 'edit') {
            setValue('dni', clientToEdit?.dni);
            setValue('date', clientToEdit?.addedDate);
            setValue('name', clientToEdit?.name);
            setValue('surname', clientToEdit?.surname);
            setValue('phone', clientToEdit?.phone);
            setValue('email', clientToEdit?.email);
            setValue('street', clientToEdit?.street);
            setValue('postal_code', clientToEdit?.postal_code);
            setValue('town', clientToEdit?.town);
            setValue('state', clientToEdit?.state);
            setValue('country', clientToEdit?.country);
            setValue('nacionality', clientToEdit?.nacionality);
            setValue('vehicle', clientToEdit?.vehicle);
            setValue('patent', clientToEdit?.patent);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }

    useEffect(() => {
 /*        if (actualPage==='clients_table'){ */
            
        /*     navigate('/view_clients');
        }
 */     
        closeForm && closeModal();
       
        const getAllClients = async()=>{
            await getClients()
        }
        getAllClients();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clients])

    useEffect(() => {
        const form = document.querySelectorAll('.input');
        const buttons = document.querySelectorAll('.btnForm');
        /* setActualPage('formCrudReservation'); */
     /*    const getData = async () => {
 
        }
        getData() */
        if ((fromPage.from === 'clientTable' || fromPage.from === 'root') && fromPage.flag === 'add') {

            handleControls(fromPage.flag) //setea controles para agregar una nueva reserva
            activateForm(form, buttons)//no ESTA FUNCIONANDO - VER enun UseEffect
            reset();//reset Form
            setFormValues('add');
        } else if ((fromPage.from === 'clientTable' || fromPage.from === 'root') && fromPage.flag === 'edit') {
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
                    {/* <div className='row d-flex justify-content-between'>
                        <div className='col-9'>
                            <h5 className={`w-100 text-center ${formCrudStyle.titleForm}`}>ABM de Cliente</h5>
                        </div>
                        <div className='closeContainer col-3'>
                            <span onClick={(e) => handleCloseCrudRes(e)} className='closeCrudRes btn btn-secondary'>CERRAR</span>
                        </div>
                        <p>Vista De Cliente</p>
                    </div> */}

                    <form onSubmit={handleSubmit(handleForm)} className={`ms-4 mb-5 mt-4 form ${formCrudStyle.formMain}`}>
                        <div className='container-fluid formBody'>
                            <div className='row d-flex justify-content-center align-items-start'>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-between align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputDate">FECHA</label>
                                        <div className='col-9'>
                                            <input
                                                type='date'
                                                {...register("date", {
                                                    required: { value: true, message: 'por favor, Ingrese la Fecha de Alta del Cliente' },
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
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputDni">DNI</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("dni", {
                                                    required: { value: true, message: 'por favor, Ingrese el DNI' },
                                                    pattern: { value: /^\d{8}$/, message: 'Ingrese un valor numérico válido de 8 dígitos' }
                                                })
                                                }
                                                className="form-control my-2 input"
                                                placeholder="DNI"
                                                disabled={true}
                                                id="inputDni"
                                            />
                                            {(errors?.dni?.type === 'required' || errors?.dni?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.dni?.message}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputSurname">NOMBRE</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("name", {
                                                    required: { value: true, message: 'por favor, Ingrese el/los Nombre/s' },
                                                    /* minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Nombre/s"
                                                disabled={true}
                                                id="inputName"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.name?.type === 'pattern' || errors?.name?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.name?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputSurname">APELLIDO</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("surname", {
                                                    required: { value: true, message: 'por favor, Ingrese el Apellido' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Apellido"
                                                disabled={true}
                                                id="inputSurname"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.surname?.type === 'pattern' || errors?.surname?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.surname?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-5 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputPhone">TELEFONO</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("phone", {
                                                    required: { value: true, message: 'por favor, Ingrese el Telefono' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Telefono"
                                                disabled={true}
                                                id="inputSurname"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.surname?.type === 'pattern' || errors?.surname?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.surname?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-7 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputEmail">E-MAIL</label>
                                        <div className='col-9'>
                                            <input
                                                type='email'
                                                {...register("email", {
                                                    required: { value: true, message: 'por favor, Ingrese el E-mail' },
                                                    pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Ingrese un Email válido' }
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Email"
                                                disabled={true}
                                                id="inputEmail"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.email?.type === 'pattern' || errors?.email?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.email?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputStreet">CALLE</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("street", {
                                                    required: { value: true, message: 'por favor, Ingrese la Calle' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Calle"
                                                disabled={true}
                                                id="inputStreet"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.street?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.street?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputPostalCode">CODIGO POSTAL</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("postal_code", {
                                                    required: { value: true, message: 'por favor, Ingrese el Codigo Postal' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Codigo Postal"
                                                disabled={true}
                                                id="inputPostalCode"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.postal_code?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.postal_code?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputTown">CIUDAD</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("town", {
                                                    required: { value: true, message: 'por favor, Ingrese la Ciudad' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Ciudad"
                                                disabled={true}
                                                id="inputTown"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.town?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.town?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputState">PROVINCIA</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("state", {
                                                    required: { value: true, message: 'por favor, Ingrese la Provincia' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Provincia"
                                                disabled={true}
                                                id="inputState"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.state?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.state?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputCountry">PAIS</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("country", {
                                                    required: { value: true, message: 'por favor, Ingrese el Pais' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Pais"
                                                disabled={true}
                                                id="inputCountry"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.country?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.country?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputVehicle">VEHÍCULO</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("vehicle", {
                                                    required: { value: true, message: 'por favor, Ingrese el Vehículo' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Vehiculo"
                                                disabled={true}
                                                id="inputVehicle"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.vehicle?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.vehicle?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputPatent">PATENTE</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("patent", {
                                                    required: { value: true, message: 'por favor, Ingrese la Patente' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Patente"
                                                disabled={true}
                                                id="inputPatent"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.patent?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.patent?.message}</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6 col-12'>
                                    <div className='row d-flex justify-content-center align-items-center p-0 m-0'>
                                        <label className={`col-3 m-0 `} htmlFor="inputNacionality">NACIONALIDAD</label>
                                        <div className='col-9'>
                                            <input
                                                type='text'
                                                {...register("nacionality", {
                                                    required: { value: true, message: 'por favor, Ingrese la Nacionalidad' },
                                                    /*  minLength: { value: 10, message: 'el formato de fecha correcto es ##/##/####' }, */
                                                })
                                                }
                                                className="form-control my-2  input"
                                                placeholder="Nacionalidad"
                                                disabled={true}
                                                id="inputNacionality"
                                            />
                                            <span className="text-danger text-small d-block mb-2">
                                                {(errors?.nacionality?.type === 'required') && <span className="text-danger text-small d-block mb-2">{errors?.nacionality?.message}</span>}
                                            </span>
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

export { FormCrudClient };