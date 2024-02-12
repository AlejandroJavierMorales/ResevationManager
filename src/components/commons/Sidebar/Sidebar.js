import { MyNavbar } from '../Navbar/Navbar';
import sidebarStyles from './_sidebar.module.scss';
import {motion} from 'framer-motion';


const Sidebar = ()=>{

    return(
        <motion.div className={`${sidebarStyles.sidebar}`}
        initial={{ x: -250 }} // Posición inicial (fuera de la pantalla)
        animate={{ x: 0 }}    // Posición final (dentro de la pantalla)
        transition={{ duration: 0.5 }} // Duración de la animación en segundos
        >
           <div className='w-100'>
           
            </div> 
        </motion.div>
    )
}
export {Sidebar};