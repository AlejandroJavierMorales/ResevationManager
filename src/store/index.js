import { configureStore } from '@reduxjs/toolkit';
import users from './slices/users';
import reservations from './slices/reservations';


export default configureStore({
    reducer: {
        users,
        reservations
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})