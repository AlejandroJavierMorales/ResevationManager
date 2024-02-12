import { createSlice } from "@reduxjs/toolkit";




export const sliceReservations = createSlice({

        name:'reservations',
        initialState:{
            listReservations:[],
            listClients:[],
            listRooms:[],
            listBanks:[],
            reservationToModify:{},
            clientToModify:{},
            checkinToRegister:{}
        },
        reducers: {
            setReservationsList: (state,action) => {
                state.listReservations = action.payload;
            },
            setRoomsList: (state, action) => {
                state.listRooms = action.payload;
            },
            setClientsList: (state, action) => {
                state.listClients = action.payload;
            },
            setBanksList: (state, action) => {
                state.listBanks = action.payload;
            },
            setReservationToModify: (state, action) =>{
                state.reservationToModify = action.payload;
            },
            setClientToModify: (state, action) =>{
                state.clientToModify = action.payload;
            },
            setCheckInToRegister: (state, action) =>{
                state.checkinToRegister = action.payload;
            }
        }

})
export const {setReservationsList, setRoomsList, setBanksList, setClientsList, setReservationToModify, setClientToModify, setCheckInToRegister} = sliceReservations.actions; 
export default sliceReservations.reducer;