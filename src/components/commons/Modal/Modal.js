import { AnimatedComponent } from "../AnimatedComponent/AnimatedComponent";
import "./Modal.css";

const Modal = ({ children, isOpen, closeModal, title = 'Ventana Modal', img }) => {

    const handleModalContainerClick = (e) => e.stopPropagation();

    return (
        
            <article className={`modal ${isOpen && "is-open"}`} onClick={closeModal}>{/* render condicional: muestra el modal solo si isOpen es true */}
                <div className="modal-container pt-3" onClick={handleModalContainerClick}>
                    <button className="modal-close px-2 py-1 rounded" style={{ title: 'cerrar' }} onClick={closeModal}>
                        X
                    </button>
                    <div className="container-fluid text-center">
                        <div className="row d-flex justify-content-center align-items-center">
                            <div className="col-12 col-sm-2">
                                <img src={img} alt={`imagen - ${title}`} width={60} />
                            </div>
                            <div className="col-12 col-sm-10 text-start">
                                <h5>{title}</h5>
                            </div>
                        </div>
                    </div>

                    <div className="container-fluid mt-3">
                        <AnimatedComponent isVisible={isOpen}>
                            {children}
                        </AnimatedComponent>
                        
                    </div>

                </div>
            </article>
    );
};

export default Modal;