import navbarStyles from './_Navbar.module.scss';

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useNavigate } from "react-router-dom";
import imgLogo from '../../../assets/img/icons/check-in-desk.png'
import { imgAccount, imgBooking, imgHome } from '../../../assets/img/icons';

const MyNavbar = () => {
  return (
    <Navbar expand="lg" className={` bg-body-tertiary rounded ${navbarStyles.navbarBackColor}`}>
      <Container>
        <Navbar.Brand className={`${navbarStyles.textLogo} `} >
          <Link className={`${navbarStyles.linksStyles} `} to='/'>
          <img
            className="logo-company d-inline-block align-text-top pe-3 " 
            src={imgLogo}
            height={40}
            alt="logo"
          />
          Booking Manager 
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle  aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className={``}>
          <Nav className={`ms-auto`}>
            <NavLink className={`${navbarStyles.linksStyles} `} to={"/"}><img src={imgHome} width={20} alt="imagen reserva" /> Inicio</NavLink>
            <NavLink className={`${navbarStyles.linksStyles}`} to={"/view_reservations"}><img src={imgBooking} width={20} alt="imagen reserva" /> Reservas</NavLink>
            <NavLink className={`${navbarStyles.linksStyles}  `} to={"/view_clients"} > <img src={imgAccount} width={20} alt="imagen cliente" /> Clientes</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export { MyNavbar };

/* const Navbar = ()=>{

    console.log(navbarStyles)
    return (

        <>
        <div>
            <h5 id={navbarStyles.pepe} className={`${navbarStyles.title} ${navbarStyles.margin}`}>Nvbar
            <p>probando...</p>
            </h5>
        </div>
        
        </>
        
    )
}
export {Navbar}; */
