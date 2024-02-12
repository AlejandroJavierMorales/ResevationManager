import React from 'react';

const GridComponent = ({ reservations = [] }) => {
  // Generar colores únicos para cada reserva
  const reservationColors = {};
  reservations.forEach((reservation, index) => {
    reservationColors[reservation.code] = getRandomColor();
    console.log(`Color for reservation ${reservation.code}: ${reservationColors[reservation.code]}`);
  });

  // Generar objeto que mapea cada celda a su color correspondiente
  const cellData = {};
  reservations.forEach((reservation, index) => {
    const color = reservationColors[reservation.code];
    const startDate = new Date(reservation.inDate.seconds * 1000);
    const endDate = new Date(reservation.outDate.seconds * 1000);
    const cabinNumber = parseInt(reservation.room.replace('Cabaña', ''));
    for (let currentDate = new Date(startDate); currentDate < endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const key = `${cabinNumber}-${currentDate.toISOString().slice(0, 10)}`; // Clave para la celda actual
      cellData[key] = {
        color,
        reservationCode: reservation.code,
      };
    }
  });

  console.log('Cell Data:', cellData);

  return (
    <div className="container">
      <h2 className="text-center">Febrero 2024</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th scope="col">#</th>
            {[...Array(28)].map((_, index) => (
              <th key={index + 1} scope="col">{index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(6)].map((_, cabinIndex) => (
            <tr key={cabinIndex + 1}>
              <th scope="row">Cabaña {cabinIndex + 1}</th>
              {[...Array(28)].map((_, colIndex) => {
                const currentDate = new Date(2024, 1, colIndex + 1);
                const key = `${cabinIndex + 1}-${currentDate.toISOString().slice(0, 10)}`;
                const cellInfo = cellData[key] || {};
                const { color, reservationCode } = cellInfo;
                return (
                  <td key={`${cabinIndex + 1}-${colIndex + 1}`} style={{ backgroundColor: color }}>
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
};

// Función para generar colores aleatorios
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export { GridComponent };











































