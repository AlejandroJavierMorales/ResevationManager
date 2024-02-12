import { useState } from "react";
import { useGlobalContext } from "./useGlobalContext";

const useModal = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);
  const { setActualPage, setFromPage } =
    useGlobalContext();
  const openModal = () => setIsOpen(true);

  const closeModal = () => {
    /* setFromPage({ from: '', flag: '' }); */
    setIsOpen(false);
  };

  return [isOpen, openModal, closeModal];
};

export { useModal };