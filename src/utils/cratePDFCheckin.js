import jsPDF from 'jspdf';



 const cratePDFCheckin = (checkin)=> {

    const doc = new jsPDF();
    doc.text("Hello world! Checkin", 10, 10);
    doc.save("a4.pdf");

  
}
export default cratePDFCheckin