import React, { useState } from 'react';
import { motion } from 'framer-motion';
import animatedButtonStyles from './_animatedButton.module.scss'

const AnimatedButton = ({children}) => {
  const [isAnimatingOver, setIsAnimatingOver] = useState(false);
  const [isAnimatingClick, setIsAnimatingClick] = useState(false);

  const handleOver = () => {
    setIsAnimatingOver(true);
    setTimeout(() => {
      setIsAnimatingOver(false);
    }, 500); // Detener la animación después de 0.5 segundos 
  };
  const handleClick = () => {
    setIsAnimatingClick(true);
    setTimeout(() => {
      setIsAnimatingClick(false);
    }, 300); // Detener la animación después de 0.3 segundos 
  };

  return (
    <motion.button
      className={`${animatedButtonStyles.animatedButton} `}
      whileTap={{ scale: 0.8 }}
      onMouseOver={handleOver}
      onClick={handleClick}
      whileHover={{ scale: isAnimatingOver ? 0.9 : 1 }} // Escalar al hacer hover
      animate={{ rotate: isAnimatingClick ? 30 : 0 , scale: (isAnimatingClick ? (1.2) : 1) || (isAnimatingOver ? 0.8 : 1) , x: isAnimatingClick ? 15 : 0 , y: isAnimatingClick ? 15 : 0}} // Girar 4 vueltas (4 * 360 grados)
      transition={{ duration: 1 }} // Duración de la animación en segundos
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;