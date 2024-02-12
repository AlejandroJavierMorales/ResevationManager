/* eslint-disable react-hooks/exhaustive-deps */
import { AnimatedButton, AnimatedComponent, FormCheckIn, FormCrudReservations, FormSearchReservation, Modal } from '../../components';
import rootStyles from './Root.module.css'
import {
    imgAdd,
    imgDelete,
    imgEdit,
    imgSearch,
    imgCheckIn,
    imgBooking,
    imgClient,
    imgAccount
} from "../../assets/img/icons";
import {
    useFirebaseReservations,
    useGlobalContext,
    useModal,
} from "../../hooks";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { FormSearchClient } from '../../components/forms/FormSearchClients';
import { FormCrudClient } from '../../components/forms';

const Root = () => {

    const [isOpenSearchModal, openSearchModal, closeSearchModal] = useModal(false); //Modal FormSearch
    const [isOpenCrudReservationModal, openCrudReservationModal, closeCrudReservationModal] = useModal(false); //Modal FormCrudReservation
    const [isOpenCrudClientModal, openCrudClientModal, closeCrudClientModal] = useModal(false); //Modal FormCrudClient
    const [isOpenSearchClientModal, openSearchClientModal, closeSearchClientModal] = useModal(false); //Modal FormSearchClient
    const [reservationData, setReservationData] = useState({});
    const { actualPage, setActualPage, fromPage, setFromPage, searchResOptions, setSearchResOptions } = useGlobalContext();
    const { getReservations, getReservationsForTable, getClients } = useFirebaseReservations();


    const handleAddRes = async (e) => {
        e.preventDefault();
        setActualPage("formCrudReservation"); //el renderizado condicional en jsx muestra el formCrud
        setFromPage({ from: "root", flag: "add" });
        await getReservationsForTable()
        openCrudReservationModal();
    };

    const handleSearchReservation = () => {
        //activar el Modal de Busqueda
        openSearchModal();
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        setActualPage("formCrudClient"); //el renderizado condicional en jsx muestra el formCrud
        setFromPage({ from: "root", flag: "add" });
        /* await getClients() */
    };

    const handleSearchClient = (e) => {
        e.preventDefault();
        //activar el Modal de Busqueda
        console.log(isOpenSearchClientModal)
        openSearchClientModal();
    };

    const { listReservations: reservations } = useSelector(state => state.reservations)

    useEffect(() => {
        console.log(fromPage)
        if (actualPage === 'formCrudClient') {
            openCrudClientModal();
        }

    }, [fromPage])

    useEffect(() => {
        setSearchResOptions({//Resetea Opciones de Busqueda de Reservas
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
        });

       /*  const getData = async () => {
            await getClients();
        }
        getData(); */

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>

            {/* <div className={`border-1 rounded ${rootStyles.title}`}> */}

            <div className='container-fluid mt-4 mb-4'>
                <div className='row d-flex justify-content-center align-items-center'>
                    <div
                        className={`${rootStyles.animatedButton} col-6 col-md-3 col-lg-3 pb-3 pt-3 m-0`}
                        onClick={(e) => handleAddRes(e)}
                    >
                        <AnimatedButton className="w-100" >
                            <img src={imgBooking} width="80%" alt="imagen Boton Reserva" />
                            <p className="mt-4">Reserva</p>
                        </AnimatedButton>
                    </div>
                    <div
                        className={`${rootStyles.animatedButton} col-6 col-md-3 col-lg-3 pb-3 pt-3 m-0`}
                        onClick={(e) => handleSearchReservation(e)}
                    >
                        <AnimatedButton className="w-100">
                            <img src={imgSearch} width="80%" alt="imagen Boton Reserva" />
                            <p className="mt-4">Buscar Reserva</p>
                        </AnimatedButton>
                    </div>
                    <div className={`${rootStyles.animatedButton} col-6 col-md-3 col-lg-3 pb-3 pt-3 m-0`}
                        onClick={(e) => handleAddClient(e)}>
                        <AnimatedButton className=" w-100">
                            <img src={imgClient} width="80%" alt="imagen Boton Checkin" />
                            <p className="mt-4">Cliente</p>
                        </AnimatedButton>
                    </div>
                    <div className={`${rootStyles.animatedButton} col-6 col-md-3 col-lg-3 pb-3 pt-3 m-0`}
                        onClick={(e) => handleSearchClient(e)}>
                        <AnimatedButton className=" w-100">
                            <img src={imgSearch} width="80%" alt="imagen Boton Checkin" />
                            <p className="mt-4">Buscar Cliente</p>
                        </AnimatedButton>
                    </div>
                </div>
            </div>
            <div className="ModalSearchContainer">
                {isOpenSearchModal && (
                    <Modal
                        isOpen={isOpenSearchModal}
                        closeModal={closeSearchModal}
                        title={"Búsqueda de Reservas"}
                        img={imgSearch}
                    >
                        <FormSearchReservation closeModal={closeSearchModal} />
                    </Modal>
                )}
            </div>
            <div className="ModalFormCrudReservations">
                {isOpenCrudReservationModal && (
                    <Modal
                        isOpen={isOpenCrudReservationModal}
                        closeModal={closeCrudReservationModal}
                        title={"Ingresar Nueva Reserva"}
                        img={imgBooking}
                    >
                        <FormCrudReservations closeModal={closeCrudReservationModal} />
                    </Modal>
                )}
            </div>
            <div className="ModalSearchClientContainer">
                {isOpenSearchClientModal && (
                    <Modal
                        isOpen={isOpenSearchClientModal}
                        closeModal={closeSearchClientModal}
                        title={"Búsqueda de Cliente"}
                        img={imgSearch}
                    >
                        <FormSearchClient closeModal={closeSearchClientModal} />
                    </Modal>
                )}
            </div>
            <div className="ModalFormCrudClient">
                {isOpenCrudClientModal && (
                    <Modal
                        isOpen={isOpenCrudClientModal}
                        closeModal={closeCrudClientModal}
                        title={"Ingresar Nuevo Cliente"}
                        img={imgAccount}
                    >
                        <FormCrudClient closeModal={closeCrudClientModal} />
                    </Modal>
                )}
            </div>
            {/* {(actualPage === 'formCrudReservation') && 
            <div>
                <p>Renderizado FormCrudReservation</p>
                <AnimatedComponent><FormCrudReservations /></AnimatedComponent>
            </div> } */}
        </>

    );
}
export { Root };