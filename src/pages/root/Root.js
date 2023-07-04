import { Navbar } from '../../components';
import rootStyles from './Root.module.css'

const Root = () => {
    return (
        <>
            <Navbar />
            {/* <div className={`border-1 rounded ${rootStyles.title}`}> */}
            <div className={`container border rounded d-flex justify-content-center ${rootStyles.title}`}>
                
                <h4 >Página de Inicio</h4>

            </div>

        </>

    );
}
export { Root };