import React from 'react'
import Spinner from 'react-bootstrap/Spinner';


const SpinnerLoading = () => {

    return (
        <div className='p-3'>
            <div className='text-center p-2'>Cargando...</div>
            <Spinner animation="border" />
        </div>
    )

}

export { SpinnerLoading }