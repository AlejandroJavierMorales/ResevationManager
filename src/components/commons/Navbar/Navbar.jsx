import navbarStyles from './_Navbar.module.scss'

const Navbar = ()=>{

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
export {Navbar};