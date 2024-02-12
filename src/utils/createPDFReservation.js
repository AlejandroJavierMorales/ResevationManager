import jsPDF from 'jspdf';



 const cratePDFReservation = (reservation)=> {

    const pdf = new jsPDF();
    pdf.text("Hello world! Reservation", 10, 10);

   // URL de la imagen que deseas insertar (asegúrate de tener permisos CORS si la imagen está en otro dominio)
const imageUrl = '/assets/imgs/account.png';

// Opcional: Puedes ajustar el tamaño y la posición de la imagen
const imageX = 60;
const imageY = 30;
const imageWidth = 40;
const imageHeight = 40;

// Inserta la imagen en el documento PDF
pdf.addImage(imageUrl, 'PNG', imageX, imageY, imageWidth, imageHeight);

// Agregar texto con formato
pdf.setFontSize(16); // Tamaño de fuente
pdf.setTextColor(255, 0, 0); // Color de texto en RGB (rojo)
pdf.text('Este es un texto rojo de tamaño 16', 10, 20);

pdf.setFontSize(12); // Cambiar el tamaño de fuente
pdf.setTextColor(0, 0, 0); // Restaurar el color a negro
pdf.text('Este es un texto negro de tamaño 12', 10, 30);

// Dibujar una línea
pdf.line(10, 10, 50, 10); // (x1, y1, x2, y2)

// Dibujar un rectángulo (borde)
pdf.rect(10, 50, 30, 15); // (x, y, ancho, alto)

// Dibujar un rectángulo (relleno)
pdf.setFillColor(200, 200, 200); // Color de relleno en RGB
pdf.rect(10, 40, 30, 15, 'F'); // (x, y, ancho, alto, 'F' para relleno)


pdf.save("/assets/pdfs/miReserva.pdf");



  
}
export default cratePDFReservation