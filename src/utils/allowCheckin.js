


const AllowCheckin = async (reservation, paidAmout)=>{

    console.log('RESERVA EN ALLOW CHECKIN '+JSON.stringify(reservation,null,2))
    console.log('MONTO PAGADO ' + paidAmout)
    console.log('MONTO TOTAL RESERVA ' + reservation[0]?.total)
    
    if (parseFloat(reservation[0]?.total) ===parseFloat(paidAmout)){
        console.log('CHECKIN HABILITADO')
        return { status:'allowed'}
    }else{
        console.log('CHECKIN NO HABILITADO')
        return {status: 'paymentError'}
    }
    //comparar si paiedAmount === al total de la reserva

    //generar el registro del pago total Editando la reserva


    //retornar True, si no retornar False


}
export default AllowCheckin;