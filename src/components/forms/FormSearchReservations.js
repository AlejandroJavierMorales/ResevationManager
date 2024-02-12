import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useFirebaseReservations, useGlobalContext } from '../../hooks';
import { useNavigate } from 'react-router-dom';

const FormSearchReservation = ({ closeModal }) => {
    const { handleSubmit, register, watch, setValue, errors } = useForm();
    const { getClients, getBanks, searchReservations } = useFirebaseReservations();
    const { listClients: clients, listBanks: banks } = useSelector(state => state.reservations);
    const { searchResOptions, setSearchResOptions, setFromPage, fromPage } = useGlobalContext();
    const [modal, setModal] = useState(false);


    //constantes de estado de opciones de busqueda    
    const isSearchOption = watch('searchGral', 'code');
    const isCodeSelected = isSearchOption === 'code'
    const isDateSelected = isSearchOption === 'date';
    const isClientSelected = isSearchOption === 'client';
    const isBankSelected = isSearchOption === 'bank';
    const isSearchOptionDate = watch('searchDate', 'reservationDate');
    const isReservationDateSelected = isSearchOptionDate === 'reservationDate'
    const isCheckInDateSelected = isSearchOptionDate === 'checkInDate'
    const isPeriodChecked = watch('period', false); // Valor predeterminado: false

    const navigate = useNavigate();

    const handleForm = (data, e) => {
        e.preventDefault();
        //Busqueda por Codigo
        if (isCodeSelected) {
            setSearchResOptions({
                code: {
                    search: true,
                    codeReservation: data.codeReservation
                },
                date: {
                    search: false
                },
                client: {
                    search: false,
                    idClient: ''
                },
                bank: {
                    search: false,
                    idBank: ''
                }
            });
        }
        //Busqueda por Fecha
        if (isDateSelected && isReservationDateSelected) {
            if (isPeriodChecked) {
                //buscar por fecha de reserva en el periodo indicado
                const [year, month, day] = data.inDate.split('-');
                const selectedDate = new Date(year, month - 1, day, '13');
                const [year1, month1, day1] = data.outDate.split('-');
                const selectedDate2 = new Date(year1, month1 - 1, day1, '13');
                setSearchResOptions({
                    code: {
                        search: false,
                        codeReservation: ''
                    },
                    date: {
                        search: true,
                        reservationDate: true,
                        checkInDate: false,
                        period: true,
                        date1: selectedDate, //cargar fecha desde
                        date2: selectedDate2 //cargar fecha hasta
                    }
                });
            } else {
                //buscar por fecha de reserva
                const [year, month, day] = data.dateSearch.split('-');
                const selectedDate = new Date(year, month - 1, day, '13');
                setSearchResOptions({
                    code: {
                        search: false,
                        codeReservation: ''
                    },
                    date: {
                        search: true,
                        reservationDate: true,
                        checkInDate: false,
                        period: false,
                        date1: selectedDate, //cargar fecha de usqueda
                        date2: ''
                    }
                });
            }
        } else if (isDateSelected && isCheckInDateSelected) {
            if (isPeriodChecked) {
                //buscar por fecha de Ingreso en el periodo indicado
                const [year, month, day] = data.inDate.split('-');
                const selectedDate = new Date(year, month - 1, day, '13');
                const [year1, month1, day1] = data.outDate.split('-');
                const selectedDate2 = new Date(year1, month1 - 1, day1, '13');
                setSearchResOptions({
                    code: {
                        search: false,
                        codeReservation: ''
                    },
                    date: {
                        search: true,
                        reservationDate: false,
                        checkInDate: true,
                        period: true,
                        date1: selectedDate, //cargar fecha desde
                        date2: selectedDate2 //cargar fecha hasta
                    }
                });
            } else {
                //buscar por fecha de Ingreso
                const [year, month, day] = data.dateSearch.split('-');
                const selectedDate = new Date(year, month - 1, day, '13');
                setSearchResOptions({
                    code: {
                        search: false,
                        codeReservation: ''
                    },
                    date: {
                        search: true,
                        reservationDate: false,
                        checkInDate: true,
                        period: false,
                        date1: selectedDate, //cargar Fecha de busqueda
                        date2: ''
                    },
                    client: {
                        search: false,
                        idClient: ''
                    },
                    bank: {
                        search: false,
                        idBank: ''
                    }
                });
            }
        }
        //Busqueda por Cliente
        if (isClientSelected) {
            //Busqueda por Cliente (Falta agregar busqueda por Nombre y Dni)
            setSearchResOptions({
                code: {
                    search: false,
                    codeReservation: ''
                },
                date: {
                    search: false
                },
                client: {
                    search: true,
                    idClient: data.client //cargar Id del Cliente
                },
                bank: {
                    search: false,
                    idBank: ''
                }
            });
        }
        if (isBankSelected) {
            //Busqueda por Banco
            setSearchResOptions({
                code: {
                    search: false,
                    codeReservation: ''
                },
                date: {
                    search: false
                },
                client: {
                    search: false,
                    idClient: ''
                },
                bank: {
                    search: true,
                    idBank: data.bank //cargar id del Banco
                }
            });
        }
        setModal(true);//setea el estado modal para cerrar  el Modal al traer los resulados de busqueda
        setFromPage({ from: "searchForm", flag: "search" });
    }

    useEffect(() => {

        const getNewListRes = async () => {
            await searchReservations();//buscaReservar segun criterios y actualiza recordset del Store con dispatch
            modal && closeModal();
            if (searchResOptions.code.search !== false || searchResOptions.date.search !== false || searchResOptions.client.search !== false || searchResOptions.bank.search !== false) {
                console.log(searchResOptions.code.codeReservation)
                navigate('/view_reservations');
            }
        }
        getNewListRes();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchResOptions])

    useEffect(() => {
        /*  if (isDateSelected) {
             console.log('buscar por fecha')
         }
         if (isClientSelected) {
             console.log('buscar por cliente')
         }
         if (isBankSelected) {
             console.log('buscar por banco')
         }
         if (isPeriodChecked) {
             console.log(isPeriodChecked)
         } */

    }, [isPeriodChecked, isDateSelected, isClientSelected, isBankSelected])

    useEffect(() => {
        setValue('searchGral', 'date');
    }, [setValue]);

    useEffect(() => {

        const getData = async () => {
            //Traer Clients
            (await getClients());
            //Traer Banks
            (await getBanks());
        }
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            <form onSubmit={handleSubmit(handleForm)}>
                <div className='container-fluid'>
                    <section className='row d-flex justify-content-evenly align-items-end'>
                        <div className='SearchPrimaryOptions col-md-5 col-11 card mb-3'>
                            <div>
                                <label className='pt-2'>
                                    <input
                                        type="radio"
                                        {...register('searchGral')}
                                        value="code"
                                    />
                                    Buscar por Código
                                </label>
                            </div>
                            <div>
                                <label className='pt-2'>
                                    <input
                                        type="radio"
                                        {...register('searchGral')}
                                        value="date"
                                    />
                                    Buscar por fecha
                                </label>
                            </div>
                            <div>
                                <label className='pt-2'>
                                    <input
                                        type="radio"
                                        {...register('searchGral')}
                                        value="client"
                                    />
                                    Buscar por cliente
                                </label>
                            </div>
                            <div>
                                <label className='pt-2'>
                                    <input
                                        type="radio"
                                        {...register('searchGral')}
                                        value="bank"
                                    />
                                    Buscar por banco
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btnForm mt-3 mb-2"
                            >
                                Buscar
                            </button>
                        </div>
                        <div className='searchSecondaryOptions col-md-5 col-11 card mb-3'>
                            {/* BUSQUEDA POR CODIGO */ }
                            {isCodeSelected &&
                                (<> <label className='pt-2'>
                                    <input
                                        type="text"
                                        {...register('codeReservation')}
                                        defaultValue=""
                                    />
                                    CODIGO DE RESERVA
                                </label>
                                </>)

                            }
                            {/* BUSQUEDA POR FECHA */}
                            {isDateSelected &&
                                (<> <label className='pt-2'>
                                    <input
                                        type="radio"
                                        {...register('searchDate')}
                                        value="reservationDate"
                                    /* defaultChecked */ // Opcional: para marcar el radio button por defecto            
                                    />
                                    Fecha de Reserva
                                </label>
                                    <label className='pt-2'>
                                        <input
                                            type="radio"
                                            {...register('searchDate')}
                                            value="checkInDate"
                                        /* defaultChecked */ // Opcional: para marcar el radio button por defecto
                                        />
                                        Fecha de Ingreso
                                    </label>
                                    <div className='col-9'>
                                        <label className='pt-2 pb-2'>
                                            <input
                                                type="checkbox"
                                                {...register('period')}
                                            />
                                            Periodo
                                        </label>
                                    </div></>)}
                            {/* BUSQUEDA POR CLIENTE */}
                            {isClientSelected &&
                                (<div className="container text-center"><label className={`col-3 m-0 `} htmlFor="inputClient">CLIENTE</label>
                                    <div className='col-12'>
                                        <select
                                            {...register("client", {
                                                required: { value: true, message: 'por favor, seleccione un Cliente' },
                                                pattern: { value: !/Seleccionar Cliente/, message: "Error de Patron" }

                                            })
                                            }
                                            className="form-control my-2 input m-0"
                                            id="inputClient"
                                        >
                                            <option value="">Seleccionar Cliente</option>
                                            {clients.length > 0 && clients.map(item => (
                                                <option key={item.id} value={item.id}>{`${item.surname} ${item.name} - DNI: ${item.dni}`}</option>
                                            ))}
                                        </select>
                                        {(errors?.client?.type === 'focus' || errors?.client?.type === 'required' || errors?.client?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.client?.message}</span>}
                                    </div></div>)}
                            {/* BUSQUEDA POR BANCO */}
                            {isBankSelected &&
                                (<div className="container text-center"><label className={`col-3 m-0 `} htmlFor="inputBank">BANCO</label>
                                    <div className='col-12'>
                                        <select
                                            {...register("bank", {
                                                required: { value: true, message: 'por favor, seleccione un Banco' },
                                                pattern: { value: !/Seleccionar Banco/, message: "Error de Patron" }
                                            })
                                            }
                                            className="form-control my-2 input category"
                                            id="inputBank"
                                        >
                                            <option value="">Seleccionar Banco</option>
                                            {banks.length > 0 && banks.map(item => (
                                                <option key={item.id} value={item.id}>{item.name}</option>
                                            ))}
                                        </select>
                                        {(errors?.bank?.type === 'focus' || errors?.bank?.type === 'required' || errors?.bank?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.bank?.message}</span>}
                                    </div></div>)}
                        </div>
                        <div className='container-fluid'>
                            {/* OPCIONES DE BUSQUEDA POR FECHAS */}
                            {isDateSelected && (isReservationDateSelected || isCheckInDateSelected) && isPeriodChecked
                                && (<div className='row d-flex justify-content-center align-items-center p-0 m-0'>

                                    <div className='col-6'>
                                        <label className={`col-3 m-0 `} >Desde...</label>
                                        <input
                                            type='date'
                                            {...register("inDate")
                                            }
                                            className="form-control my-2  input"
                                        />
                                    </div>
                                    <div className='col-6'>
                                        <label className={`col-3 m-0 `} >Hasta...</label>
                                        <input
                                            type='date'
                                            {...register("outDate")
                                            }
                                            className="form-control my-2  input"
                                        />
                                    </div>
                                </div>
                                )}
                            {/* BUSQUEDA POR FECHA DE ESERVA O DE INGRESO SIN PERIODO */}
                            {isDateSelected && (isReservationDateSelected || isCheckInDateSelected) && !isPeriodChecked
                                && (<div className='container d-flex justify-content-center'>
                                    <div className='col-12 col-md-5'>
                                        <input
                                            type='date'
                                            {...register("dateSearch")
                                            }
                                            className="form-control my-2  input"
                                        />
                                    </div></div>)}
                        </div>
                    </section>
                </div>
            </form>
        </div>
    )
}
export { FormSearchReservation }