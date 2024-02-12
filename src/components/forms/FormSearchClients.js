import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useFirebaseReservations, useGlobalContext } from '../../hooks';
import { useNavigate } from 'react-router-dom';

const FormSearchClient = ({ closeModal }) => {
    const { handleSubmit, register, watch, setValue, errors } = useForm();
    const { getClients, getBanks, searchClient } = useFirebaseReservations();
    const { listClients: clients } = useSelector(state => state.reservations);
    const { searchResOptions, setSearchResOptions, setFromPage, fromPage } = useGlobalContext();
    const [modal, setModal] = useState(false);


    //constantes de estado de opciones de busqueda    
    const isSearchOption = watch('searchGral', 'name');
    const isNameClientSelected = isSearchOption === 'name'
    const isDNIClientSelected = isSearchOption === 'dni';
    /* const isClientSelected = isSearchOption === 'client';
    const isBankSelected = isSearchOption === 'bank';
    const isSearchOptionDate = watch('searchDate', 'reservationDate');
    const isReservationDateSelected = isSearchOptionDate === 'reservationDate'
    const isCheckInDateSelected = isSearchOptionDate === 'checkInDate'
    const isPeriodChecked = watch('period', false); */ // Valor predeterminado: false

    const navigate = useNavigate();

    const handleForm = (data, e) => {
        e.preventDefault();
        //Busqueda por Nombre del Cliente
        if (isNameClientSelected) {
            setSearchResOptions({
                dniClient: {
                    search: false,
                    dni: ''
                },
                nameClient: {
                    search: true,
                    name: data.nameClient
                }
            });
        } else if (isDNIClientSelected) { //Busca por DNI del Cliente
            setSearchResOptions({
                dniClient: {
                    search: true,
                    dni: data.dniClient
                },
                nameClient: {
                    search: false,
                    name: ''
                }
            });
        }

       
        setModal(true);//setea el estado modal para cerrar  el Modal al traer los resulados de busqueda
        setFromPage({ from: "searchForm", flag: "search" });
    }

    useEffect(() => {

        const getNewListClient = async () => {
            const data = await searchClient();//buscaReservar segun criterios y actualiza recordset del Store con dispatch
            console.log(`CLIENTE ENCONTRADO: ${JSON.stringify(data,null,2)}`)
            modal && closeModal();
            if (searchResOptions.nameClient?.search !== false || searchResOptions.dniClient?.search !== false) {
                
                navigate('/view_clients');
            }
        }
        getNewListClient();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchResOptions])



    useEffect(() => {
        //setea por defecto Buscar por Nombre de Cliente en el radio button del Form
        setValue('searchGral', 'name');
    }, [setValue]);

    useEffect(() => {

        const getData = async () => {
            //Traer Clients para tomar los DNI y cargarlos en el Select del Form
            await getClients();
            //Traer Banks
            /* (await getBanks()); */
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
                                        value="name"
                                        defaultChecked
                                    />
                                    Buscar por Nombre
                                </label>
                            </div>

                            <div>
                                <label className='pt-2'>
                                    <input
                                        type="radio"
                                        {...register('searchGral')}
                                        value="dni"
                                    />
                                    Buscar por DNI
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
                            {/* BUSQUEDA POR NOMBRE DEL CLIENTE */}
                            {isNameClientSelected &&
                                (<> <label className='pt-2'>
                                    <input
                                        type="text"
                                        {...register('nameClient')}
                                        defaultValue=""
                                    />
                                    NOMBRE DEL CLIENTE
                                </label>
                                </>)

                            }
                            {/* BUSQUEDA POR DNI DEL CLIENTE */}
                            {isDNIClientSelected &&
                                (<div className="container text-center"><label className={`col-3 m-0 `} htmlFor="inputClient">DNI del CLIENTE</label>
                                    <div className='col-12'>
                                        <select
                                            {...register("dniClient", {
                                                required: { value: true, message: 'por favor, seleccione un DNI' },
                                                pattern: { value: !/Seleccionar DNI/, message: "Error de Patron" }

                                            })
                                            }
                                            className="form-control my-2 input m-0"
                                            id="inputClient"
                                        >
                                            <option value="">Seleccionar DNI</option>
                                            {clients.length > 0 && clients.map(item => (
                                                <option key={item.id} value={item.dni}>{`${item.dni}`}</option>
                                            ))}
                                        </select>
                                        {(errors?.client?.type === 'focus' || errors?.client?.type === 'required' || errors?.client?.type === 'pattern') && <span className="text-danger text-small d-block mb-2">{errors?.client?.message}</span>}
                                    </div>
                                </div>)}

                        </div>
                    </section>
                </div>
            </form>
        </div>
    )
}
export { FormSearchClient }