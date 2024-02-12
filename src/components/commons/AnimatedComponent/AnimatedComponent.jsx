import { motion } from 'framer-motion';
import animatedCompStyles from './_animatedComponent.module.scss'

const AnimatedComponent = ({children, isVisible=true}) => {


  return (
    <motion.div
      className={`${animatedCompStyles.animatedComponent}`}
      initial={{ y: -100, scale: 0.5, opacity: 0 }} // Posición y escala inicial
      animate={{
        y: isVisible ? 0 : -100,   // Posición final al aparecer o desaparecer
        scale: isVisible ? 1 : 0.5, // Escala final al aparecer o desaparecer
        opacity: isVisible ? 1 : 0 // Opacidad al aparecer o desaparecer
      }}
      transition={{ duration: 1 }} // Duración de la animación en segundos
    >
      {/* Contenido del componente */}
      {children}
    </motion.div>
  );
};

export {AnimatedComponent};
