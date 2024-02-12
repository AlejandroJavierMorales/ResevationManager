import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GridComponent = ({ reservations }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reservationColors, setReservationColors] = useState({});

  useEffect(() => {
    if (!startDate || !endDate) return;

    let currentDate = new Date(startDate);
    const colorsCopy = { ...reservationColors };

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthReservations = reservations.filter((reservation) => {
        const inDate = new Date(reservation.inDate.seconds * 1000);
        const outDate = new Date(reservation.outDate.seconds * 1000);

        // Verificar si la reserva está activa durante este mes
        return (
          (inDate.getFullYear() <= year && outDate.getFullYear() >= year) &&
          ((inDate.getMonth() <= month && outDate.getMonth() >= month) ||
          (inDate.getMonth() === month && outDate.getFullYear() > year) ||
          (outDate.getMonth() === month && inDate.getFullYear() < year))
        );
      });

      monthReservations.forEach((reservation) => {
        if (!colorsCopy[reservation.code]) {
          colorsCopy[reservation.code] = getRandomColor();
        }
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }

    setReservationColors(colorsCopy);
  }, [startDate, endDate, reservations]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const generateTables = () => {
    if (!startDate || !endDate) {
      return null;
    }

    const tables = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthReservations = reservations.filter((reservation) => {
        const inDate = new Date(reservation.inDate.seconds * 1000);
        const outDate = new Date(reservation.outDate.seconds * 1000);
        return (
          (inDate.getFullYear() <= year && outDate.getFullYear() >= year) &&
          ((inDate.getMonth() <= month && outDate.getMonth() >= month) ||
          (inDate.getMonth() === month && outDate.getFullYear() > year) ||
          (outDate.getMonth() === month && inDate.getFullYear() < year))
        );
      });

      tables.push(
        <div className="container" key={`${year}-${month}`}>
          <h2 className="text-center">{`${year}-${month + 1}`}</h2>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">#</th>
                {[...Array(daysInMonth)].map((_, index) => (
                  <th key={index + 1} scope="col">{index + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, cabinIndex) => (
                <tr key={cabinIndex + 1}>
                  <th scope="row">Cabaña {cabinIndex + 1}</th>
                  {[...Array(daysInMonth)].map((_, colIndex) => {
                    const currentDay = colIndex + 1;
                    const currentDate = new Date(year, month, currentDay);
                    const key = `${cabinIndex + 1}-${currentDay}`;
                    let cellColor = '';
                    let reservationCode = '';

                    const cellReservations = monthReservations.filter((reservation) => {
                      const inDate = new Date(reservation.inDate.seconds * 1000);
                      const outDate = new Date(reservation.outDate.seconds * 1000);
                      const currentDateTime = currentDate.getTime();

                      if (
                        reservation.room === `Cabaña${cabinIndex + 1}` &&
                        currentDateTime >= inDate.getTime() &&
                        currentDateTime < outDate.getTime()
                      ) {
                        reservationCode = reservation.code;
                        return true;
                      }

                      return false;
                    });

                    if (cellReservations.length > 0) {
                      const reservationCode = cellReservations[0].code;
                      cellColor = reservationColors[reservationCode];
                    }

                    return (
                      <td key={key} style={{ backgroundColor: cellColor }}>
                        {reservationCode}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }

    return tables;
  };

  return (
    <div>
      <div>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
        />
      </div>
      <div>
        {generateTables()}
      </div>
    </div>
  );
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};



export {GridComponent};























































