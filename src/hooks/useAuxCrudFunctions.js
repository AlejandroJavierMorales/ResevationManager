/* 
import { useAuthContext } from "../useAuthContext/useAuthContext"; */


const useAuxCrudFunctions = () => {

    /* const { setError } = useAuthContext() */

/*     const validateEmailFormat = (value) => {
        if (/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(value)) {
            setError('');
            return (true);
        } else {
            setError('Email Incorrecto, por favor escriba un email válido...')
            return (false);
        }
    }
    const validatePassword = (value) => {
        if (value !== '' && value.length >= 6) {
            setError('');
            return (true);
        } else {
            setError('Password Incorrecto, debe tener 6 caracteres como mínimo')
            return (false);
        }
    } */

    const validateDni = (value, required) => {
        if (required) {
            if (/^([0-9]){8}$/.test(value)) {
                return true;
            } else {
                return false;
            }
        } else if (value.length > 0) {
            if ((/^([0-9]){8}$/.test(value))) {
                return true;
            }
            return false;
        } else {
            return true
        }

    }

    const validatePhone = (value, required) => {
        if (required) {
            if ((/^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/).test(value)) {
                return true;
            }
        } else if (value.length > 0) {
            if ((/^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/).test(value)) {
                return true;
            }
            return false;
        } else {
            return true
        }
    }

    const validateInputTxt = (value, required, minLength) => {
        if (required) {
            if (value.length < minLength) {
                return (false);
            } else {
                return (true);
            }
        } else if (value.length > 0) {
            if (value.length < minLength) {
                return false
            }
        } else {
            return true
        }
    }

    const deactivateForm = (form,buttons)=>{
        for (let i =0 ; i<form.length ; i++){
            form[i].disabled=true
           } 
           for (let i =0 ; i<buttons.length ; i++){
            buttons[i].disabled=true
           } 
    }
    const activateForm = (form,buttons)=>{
        for (let i =0 ; i<form.length ; i++){
            form[i].disabled=false;
           } 
           for (let i =0 ; i<buttons.length ; i++){
            buttons[i].disabled=false;
           } 
    }
    const setButtonsState =(state)=>{
        if( state==='init' || state==='cancel' || state==='delete'){
            return ({
                add:false,
                edit:true,
                delete:true,
                search:false,
                cancel:true
            });  
        }else if(state==='add' || state==='edit' || state==='search' ){
            return ({
                add:true,
                edit:true,
                delete:true,
                search:true,
                cancel:false
            }); 
        }
    }

    return {/*  validateEmailFormat, validatePassword, */ validateDni, validateInputTxt,
         validatePhone, deactivateForm,activateForm,setButtonsState }
}
export { useAuxCrudFunctions }