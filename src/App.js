
import './styles/sass/index.scss'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { Root } from './pages';
//Redux
import { Provider } from 'react-redux';
import store from './store';
import { UserList } from './pages/userList/UserList';



function App() {
  return (
    <Provider store={store}>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<UserList />}/>
    </Routes>
    </BrowserRouter>
    </Provider>
    
  );
}

export default App;
