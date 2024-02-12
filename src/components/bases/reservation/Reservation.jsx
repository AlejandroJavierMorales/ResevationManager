/* eslint-disable react-hooks/exhaustive-deps */
import moment from "moment";
import reservationStyles from "./_reservation.module.scss";
import { useEffect, useState } from "react";
import {
  useFirebaseReservations,
  useGlobalContext,
  useModal,
} from "../../../hooks";
import { useDispatch } from "react-redux";
import {
  imgAdd,
  imgDelete,
  imgEdit,
  imgSearch,
  imgCheckIn,
  imgWhatsapp,
  imgPdfReservation,
} from "../../../assets/img/icons";
import Swal from "sweetalert2";
import {
  setCheckInToRegister,
  setReservationToModify,
} from "../../../store/slices/reservations";
import {
  Modal,
  SpinnerLoading,
  FormCheckIn,
  FormSearchReservation,
} from "../../../components";
import { jsPDF } from "jspdf";
import { createPDFReservation } from "../../../utils";

const Reservation = ({ reservations = [] }) => {
  const { setActualPage, setFromPage, enableSpinner } = useGlobalContext();
  const { deleteReservation, getReservationsForTable } =
    useFirebaseReservations();
  const dispatch = useDispatch();
  /* const { reservationToModify : reservationToEdit } = useSelector(state => state.reservations); */
  const [newReservations, setNewReservations] = useState([]);
  let objReservationToModify = {}; //Llevara los datos del registro de la tabla a modificar,
  // al formCrud para cargarlos por defecto en el ueseefect inicial
  //setear actualPage para identificar que tiene que editar y no agregar
  const [totalizer, setTotalizer] = useState({
    reservations: 0,
    nights: 0,
    billed: 0,
    received: 0,
    totalPending: 0,
  });
  /* const [modal, setModal] = useState(false); */
  const [isOpenSearchModal, openSearchModal, closeSearchModal] =
    useModal(false); //Modal FormSearch
  const [isOpenCheckInModal, openCheckInModal, closeCheckInModal] =
    useModal(false); //Modal FormCheckIn
  const [reservationData, setReservationData] = useState({});

  const updateObjReservation = (index) => {
    //tomar los datos de la linea de la table para armar el objeto objReservationToModify
    objReservationToModify = {
      /*             year: reservations[index].code.split('_')[0],
                        number: reservationData.code.split('_')[1], */
      id: newReservations[index]?.id,
      code: newReservations[index]?.code,
      date: newReservations[index]?.date,
      client: newReservations[index]?.client_id,
      pax: newReservations[index]?.pax,
      room: newReservations[index]?.room_id,
      inDate: newReservations[index]?.inDate,
      outDate: newReservations[index]?.outDate,
      price: newReservations[index]?.price,
      paid: newReservations[index]?.paid,
      total: newReservations[index]?.total,
      bank: newReservations[index]?.bank_id,
      nights: newReservations[index]?.nigths,
      checkin: newReservations[index]?.checkin,
    };
    /* console.log(objReservationToModify); */
    dispatch(setReservationToModify(objReservationToModify));
  };

  const handleAddRes = (e) => {
    e.preventDefault();
    setActualPage("formCrudReservation"); //el renderizado condicional en jsx muestra el formCrud
    setFromPage({ from: "reservationTable", flag: "add" });

  };

  const handleEditReservation = (index, e) => {
    e.preventDefault();
    setActualPage("formCrudReservation"); //el renderizado condicional en jsx muestra el formCrud
    setFromPage({ from: "reservationTable", flag: "edit" });
    updateObjReservation(index); //Funcion que carga el objReservationToModify con los datos de la reserva seleccionada en la tabla
    //y actualiza en el store reservationToModify
    //Esta data se mostrara en el formCrudReservation para editarla
  };

  const handleCheckIn = (index, e) => {
    e.preventDefault();
    /* setActualPage('formCheckIn');*/ //el renderizado condicional en jsx muestra el formCrud
    setFromPage({ from: "reservationTable", flag: "checkin" });
    updateObjReservation(index); //Funcion que carga el objReservationToModify con los datos de la reserva seleccionada en la tabla
    //y actualiza en el store reservationToModify
    //Esta data se mostrara en el formCrudReservation para editarla
    openCheckInModal();
    dispatch(setCheckInToRegister({}));
  };

  const handleDeleteReservation = async (id, e) => {
    e && e.preventDefault();
    try {
      const result = await Swal.fire({
        title: "Seguro de Eliminar esta Reserva?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, Eliminar Reserva!",
      });
      if (result.isConfirmed) {
        //Borrar Reserva
        const result = await deleteReservation(id);
        if (result) {
          await getReservationsForTable();
          Swal.fire("Borrada!", "La Reserva ha sido Borrada", "success");
        }
      }
    } catch (err) {}
  };

  const handleSearchReservation = () => {
    //activar el Modal de Busqueda
    openSearchModal();
  };

  const handleWhatsapp = (index, e) => {

  }

  const handlePdfReservation =(index, e) => {
    e.preventDefault();
    //Hacer Envio de Whatsapp
    createPDFReservation(reservationData)
  };

  const totalSales = (newArray) => {
    let nightsV = 0;
    let billedV = 0;
    let reservationsV = 0;
    let receivedV = 0;
    let totalPendingV = 0;

    newArray.forEach((elem) => {
      nightsV += parseInt(elem.nigths);
      reservationsV += 1;
      billedV += parseFloat(elem.total);
      receivedV += parseFloat(elem.paid);
      totalPendingV += parseFloat(elem.total) - parseFloat(elem.paid);
    });

    setTotalizer({
      reservations: reservationsV,
      nights: nightsV,
      billed: billedV,
      received: receivedV,
      totalPending: totalPendingV,
    });
  };

  /*  useEffect(()=>{
         if (actualPage ==='formCheckIn'){
             openCheckInModal();
         }
 
     // eslint-disable-next-line react-hooks/exhaustive-deps
     },[setActualPage]) */

  useEffect(() => {
    if (reservations.length > 0) {
      const newArray = reservations.map((res) => {
        let nigthsDif = moment((res?.outDate).toDate()).diff(
          moment((res?.inDate).toDate()),
          "days"
        );
        let totalPrice = parseFloat(res?.price * nigthsDif);

        res = { ...res, nigths: nigthsDif, total: totalPrice };

        return res;
      });

      setNewReservations(newArray);
      totalSales(newArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  useEffect(() => {
    /* setCheckInToRegister({}); */
    //inicializa en cero el objeto de Checkin
    /* const getAllReservations = async ()=>{
        await getReservationsForTable() 
    }
    getAllReservations(); */
  }, []);

  return (
    <div
      className={`container mt-2 mb-2 d-flex justify-content-center ${reservationStyles.container}`}
    >
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-12 d-flex justify-content-center pt-3 pb-3">
          <h1 className={reservationStyles.title}>RESERVAS</h1>
        </div>
        <div className="text-center">
          {/* !reservations[0]?.code */ enableSpinner && <SpinnerLoading />}
        </div>

        <div
          className={`col-12 ${reservationStyles.custom_table_container} overflow-auto`}
        >
          <table
            className={`table table-striped table-hover  ${reservationStyles.tableStyle}`}
          >
            <thead className={` ${reservationStyles.fontStyleHeader}`}>
              <tr className="w-100">
                <th>Codigo</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Pax</th>
                <th>Habitación</th>
                <th>Ingreso</th>
                <th>Egreso</th>
                <th className="text-center">Noches</th>
                <th>Precio/Noche</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Resta</th>
                <th>Banco</th>
                <th>Teléfono</th>
                <th></th>
                <th></th>
                <th>
                  <img
                    onClick={(e) => handleAddRes(e)}
                    className={`${reservationStyles.mouseHover}`}
                    src={imgAdd}
                    alt="Agregar"
                    title="Nueva Reserva"
                    style={{ width: "20px" }}
                  />
                </th>
                <th>
                  <img
                    onClick={(e) => handleSearchReservation(e)}
                    className={`${reservationStyles.mouseHover}`}
                    src={imgSearch}
                    alt="Buscar"
                    title="Buscar Reserva"
                    style={{ width: "26px" }}
                  />
                </th>
                <th>Check-In</th>
              </tr>
            </thead>
            <tbody className={` ${reservationStyles.fontStyleBody} `}>
              {newReservations.length > 0 &&
                newReservations.map((res, index) => (
                  <tr key={index}>
                    <td>{res?.code}</td>
                    <td>{moment((res?.date).toDate()).format("DD-MM-YYYY")}</td>
                    <td>{res?.client}</td>
                    <td>{res?.pax}</td>
                    <td>{res?.room}</td>
                    <td>
                      {moment((res?.inDate).toDate()).format("DD-MM-YYYY")}
                    </td>
                    <td>
                      {moment((res?.outDate).toDate()).format("DD-MM-YYYY")}
                    </td>
                    <td className="text-center">{res?.nigths}</td>
                    <td>{`$${res?.price}`}</td>
                    <td>{`$${res?.paid}`}</td>
                    <td>{`$${res?.total}`}</td>
                    <td>{`$${res?.total - res?.paid}`}</td>
                    <td>{`${res?.bank}`}</td>
                    <td>{`${res?.phone}`}</td>
                    <td>
                    <img
                    onClick={(e) => handleWhatsapp(index, e)}
                    className={`${reservationStyles.mouseHover}`}
                    src={imgWhatsapp}
                    alt="Whatsapp"
                    title="Enviar Whatsapp"
                    style={{ width: "24px" }}
                  />
                    </td>
                    <td>
                    <img
                    onClick={(e) => handlePdfReservation(index, e)}
                    className={`${reservationStyles.mouseHover}`}
                    src={imgPdfReservation}
                    alt="PDF de Reserva"
                    title="Generar PDF de Reserva"
                    style={{ width: "24px" }}
                  />
                    </td>
                    <td>
                      <img
                        onClick={(e) => handleEditReservation(index, e)}
                        className={`${reservationStyles.mouseHover}`}
                        src={imgEdit}
                        alt="Editar"
                        title="Editar Reserva"
                        style={{ width: "16px" }}
                      />
                    </td>
                    <td>
                      <img
                        onClick={(e) => handleDeleteReservation(res?.id, e)}
                        className={`${reservationStyles.mouseHover}`}
                        src={imgDelete}
                        alt="Borrar"
                        title="Borrar Reserva"
                        style={{ width: "16px" }}
                      />
                    </td>
                    <td className="text-center">
                      <img
                        onClick={(e) => handleCheckIn(index, e)}
                        className={`${reservationStyles.mouseHover}`}
                        src={imgCheckIn}
                        alt="Borrar"
                        title="CheckIn"
                        style={{
                          width: "30px",
                          padding: "1px",
                          borderRadius: "10%",
                          backgroundColor: res?.checkin ? "green" : "red",
                        }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="container-fluid p-3">
          {reservations[0]?.code && (
            <div className="row d-flex justify-content-start align-items-center">
              <div className={`col-4 col-md-3 col-lg-2 pt-2`}>
                <span className={`w-100 ${reservationStyles.totalizers}`}>
                  {`Reservas Totales ${totalizer.reservations}`}
                </span>
              </div>
              <div className={`col-4 col-md-3 col-lg-2 pt-2`}>
                <span className={`w-100 ${reservationStyles.totalizers}`}>
                  {`Noches Vendidas ${totalizer.nights}`}
                </span>
              </div>
              <div className={`col-4 col-md-3 col-lg-2 pt-2`}>
                <span className={`w-100 ${reservationStyles.totalizers}`}>
                  {`Total Facturado $${totalizer.billed}`}
                </span>
              </div>
              <div className={`col-4 col-md-3 col-lg-2 pt-2`}>
                <span className={`w-100 ${reservationStyles.totalizers}`}>
                  {`Cobrado $${totalizer.received}`}
                </span>
              </div>
              <div className={`col-4 col-md-3 col-lg-2 pt-2`}>
                <span className={`w-100 ${reservationStyles.totalizers}`}>
                  {`Pendiente $${totalizer.totalPending}`}
                </span>
              </div>
            </div>
          )}
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
        <div className="ModalCheckInContainer">
          {isOpenCheckInModal && (
            <Modal
              isOpen={isOpenCheckInModal}
              closeModal={closeCheckInModal}
              title={"CheckIn - Registro de Ingreso al Alojamiento"}
              img={imgCheckIn}
            >
              <FormCheckIn
                closeModal={closeCheckInModal}
                newCheckIn={false}
                checkInReservation={
                  reservationData
                } /*  sendClient={clientData} */
              />
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export { Reservation };

/* (moment((res?.outDate).toDate())).diff(moment((res?.inDate).toDate()),"day")+1 */
