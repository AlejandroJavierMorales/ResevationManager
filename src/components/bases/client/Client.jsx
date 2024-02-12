/* eslint-disable react-hooks/exhaustive-deps */
//Tabla de Clientes
import clientStyles from "./_client.module.scss";
import {
  imgAdd,
  imgDelete,
  imgEdit,
  imgSearch,
  imgAccount,
} from "../../../assets/img/icons";
import Modal, { SpinnerLoading } from "../../commons";
import {
  useFirebaseReservations,
  useGlobalContext,
  useModal,
} from "../../../hooks";
import moment from "moment";
import { useEffect, useState } from "react";
import { FormSearchClient } from "../../forms/FormSearchClients";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { setClientToModify } from "../../../store/slices/reservations";
import { FormCrudClient } from "../../forms";

const Client = ({ clients = [] }) => {
  const { actualPage, fromPage, setActualPage, setFromPage, enableSpinner } =
    useGlobalContext();
  const [newClients, setNewClients] = useState([]);
  const [isOpenSearchModal, openSearchModal, closeSearchModal] =
    useModal(false); //Modal FormSearch
  const [isOpenCrudClientModal, openCrudClientModal, closeCrudClientModal] =
    useModal(false);
  const {
    getClients,
    addClient,
    deleteClient,
    editClient,
    getClientReservations,
    getClientById,
  } = useFirebaseReservations();
  const { clientToModify: clientToEdit } = useSelector(
    (state) => state.reservations
  );
  let objClientToModify = {};
  const dispatch = useDispatch();

  const handleAddClient = (e) => {
    e.preventDefault();
    setActualPage("clientTable"); //el renderizado condicional en jsx muestra el formCrud
    setFromPage({ from: "clientTable", flag: "add" });
  };

  const handleEditClient = (index, e) => {
    e.preventDefault();
    /* setActualPage("formCrudClient"); */ //el renderizado condicional en jsx muestra el formCrud
    setFromPage({ from: "clientTable", flag: "edit" });
    updateObjClient(index); //Funcion que carga el objClientToModify con los datos de la reserva seleccionada en la tabla
    //y actualiza en el store reservationToModify
    /* openCrudClientModal(); */
  };

  const updateObjClient = async (index) => {
    console.log(clients[index]?.addedDate);
    let addedDate='';
    if (clients[index]?.addedDate) {
      const date = new Date(clients[index]?.addedDate.seconds * 1000);
      console.log(date);
      addedDate = date.toISOString().split("T")[0];
    }

    //tomar los datos de la linea de la table para armar el objeto objReservationToModify
    try {
      /* const getedClient = await getClientById(newClients[index]?.id); */

      objClientToModify = {
        /*             year: reservations[index].code.split('_')[0],
                        number: reservationData.code.split('_')[1], */

        id: clients[index]?.id,
        phone: clients[index]?.phone,
        addedDate: addedDate,
        dni: clients[index]?.dni,
        name: clients[index]?.name,
        surname: clients[index]?.surname,
        email: clients[index]?.email,
        street: clients[index]?.street,
        town: clients[index]?.town,
        state: clients[index]?.state,
        country: clients[index]?.country,
        postal_code: clients[index]?.postal_code,
        vehicle: clients[index]?.vehicle,
        patent: clients[index]?.patent,
        nacionality: clients[index]?.nacionality,
      };
      console.log(objClientToModify);
      dispatch(setClientToModify(objClientToModify));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteClient = async (id, e) => {
    e && e.preventDefault();
    try {
      const result = await Swal.fire({
        title: "Seguro de Borrar este Cliente?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, Eliminar Cliente!",
      });
      if (result.isConfirmed) {
        //Verificar si el Cliente Tiene Reservas en su Historico
        //Si las Tiene No Borrar y Avisar con un Mensaje
        const clientReservations = await getClientReservations(id);
        if (clientReservations === false) {
          const result = await deleteClient(id);
          if (result) {
            await getClients();
            Swal.fire("Borrado!", "El Cliente ha sido Borrado", "success");
          }
        } else {
          Swal.fire(
            "Atencion!",
            "El Cliente NO se puede eliminar porque tiene Reservas asociadas",
            "error"
          );
        }
        //Borrar Cliente
      }
    } catch (err) {}
  };

  const handleSearchClient = (e) => {
    e.preventDefault()
    //activar el Modal de Busqueda
    openSearchModal();
  };

  useEffect(() => {
    setNewClients(clients);
    setFromPage({ from: "clientTable", flag: "" });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('Actual Page'+ actualPage);
    console.log('From Flag'+ fromPage.flag);
 

    setNewClients(clients);
    if (actualPage === 'clientsTable' && (fromPage.flag === "add" || fromPage.flag === "edit")) {
      openCrudClientModal(); //al cambiar el estado del objeto fromPage abre el Moal el Crud  de Cliente

      console.log("CLIENT TO EDIT");
    }
  }, [clientToEdit]);

  useEffect(() => {
    console.log(setActualPage)
    /* console.log(isOpenCrudClientModal) */
    if (fromPage.flag === "add" || fromPage.flag === "edit") {
      openCrudClientModal(); //al cambiar el estado del objeto fromPage abre el Moal el Crud  de Cliente
    }
    /*  if(isOpenCrudClientModal){
      openCrudClientModal();
    } */
  }, [fromPage]);

  return (
    <div
      className={`container mt-2 mb-2 d-flex justify-content-center ${clientStyles.container}`}
    >
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-12 d-flex justify-content-center pt-3 pb-3">
          <h1 className={clientStyles.title}>CLIENTES</h1>
        </div>
        <div className="text-center">
          {/* !reservations[0]?.code */ enableSpinner && <SpinnerLoading />}
        </div>

        <div
          className={`col-12 ${clientStyles.custom_table_container} overflow-auto`}
        >
          <table
            className={`table table-striped table-hover  ${clientStyles.tableStyle}`}
          >
            <thead className={` ${clientStyles.fontStyleHeader}`}>
              <tr className="w-100">
                <th>Fecha de Alta</th>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Domicilio</th>
                <th>Ciudad</th>
                <th>Pais</th>
                <th>Vehiculo</th>
                <th>Patente</th>
                <th>
                  <img
                    onClick={(e) => handleAddClient(e)}
                    className={`${clientStyles.mouseHover}`}
                    src={imgAdd}
                    alt="Agregar"
                    title="Nueva Reserva"
                    style={{ width: "20px" }}
                  />
                </th>
                <th>
                  <img
                    onClick={(e) => handleSearchClient(e)}
                    className={`${clientStyles.mouseHover}`}
                    src={imgSearch}
                    alt="Buscar"
                    title="Buscar Reserva"
                    style={{ width: "26px" }}
                  />
                </th>
                {/*  <th>Check-In</th> */}
              </tr>
            </thead>
            <tbody className={` ${clientStyles.fontStyleBody} `}>
              {clients.length > 0 &&
                clients.map((cli, index) => (
                  <tr key={index}>
                    <td>
                      {moment((cli?.addedDate).toDate()).format("DD-MM-YYYY")}
                    </td>
                    {/* <td>{cli?.addedDate}</td> */}
                    <td>{cli?.dni}</td>
                    <td>{cli?.name}</td>
                    <td>{cli?.surname}</td>
                    <td>{cli?.email}</td>
                    <td>{cli?.street}</td>
                    <td>{cli?.town}</td>
                    <td>{cli?.country}</td>
                    <td>{cli?.vehicle}</td>
                    <td>{cli?.patent}</td>

                    <td>
                      <img
                        onClick={(e) => handleEditClient(index, e)}
                        className={`${clientStyles.mouseHover}`}
                        src={imgEdit}
                        alt="Editar"
                        title="Editar Reserva"
                        style={{ width: "16px" }}
                      />
                    </td>
                    <td>
                      <img
                        onClick={(e) => handleDeleteClient(cli?.id, e)}
                        className={`${clientStyles.mouseHover}`}
                        src={imgDelete}
                        alt="Borrar"
                        title="Borrar Reserva"
                        style={{ width: "16px" }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="ModalSearchContainer">
        {isOpenSearchModal && (
          <Modal
            isOpen={isOpenSearchModal}
            closeModal={closeSearchModal}
            title={"Búsqueda de Cliente"}
            img={imgSearch}
          >
            <FormSearchClient closeModal={closeSearchModal} />
          </Modal>
        )}
      </div>
      <div className="ModalSearchContainer">
        {isOpenCrudClientModal && (
          <Modal
            isOpen={isOpenCrudClientModal}
            closeModal={closeCrudClientModal}
            title={"Alta de Cliente"}
            img={imgAccount}
          >
            <FormCrudClient closeModal={closeCrudClientModal} />
          </Modal>
        )}
      </div>
    </div> //div final del return
  );
};
export { Client };
