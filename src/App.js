
import './styles/sass/index.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ClientsPage, GridReservations, Reservations, Root, UserList } from './pages';

//Redux
import { Provider } from 'react-redux';
import store from './store';

import { GlobalProvider } from './contexts';
import { GridComponent, MyNavbar } from './components';





function App() {


  return (

    <Provider store={store}>
      <GlobalProvider>
        <BrowserRouter>
          <MyNavbar />
          <Routes>
            <Route path='/' element={<Root />} />
            <Route path='/users' element={<UserList />} />
            <Route path='/view_reservations' element={<Reservations />} />
            <Route path='/view_clients' element={<ClientsPage />} />
            <Route path='/view_gridreservations' element={<GridReservations />} />
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </Provider>
  );
}

export default App;
