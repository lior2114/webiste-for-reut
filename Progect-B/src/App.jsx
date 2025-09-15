import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './Contexts/UserContexts';
import { UiProvider } from './Contexts/UiContext';
import { NavBar } from './Components/NavBar';
import { Register } from './Pages/Register_Page/Register';
import { Login } from './Pages/Login_Page/Login';
import { Home } from './Pages/Home_Page/Home';
import { About } from './Pages/About_Page/About';
import { Vacations } from './Pages/Vacations_Page/Vacations';
import { AddVacation } from './Pages/AddVacation_Page/AddVacation';
import { EditVacation } from './Pages/EditVacation_Page/EditVacation';
import { Profile } from './Pages/Profile_Page/Profile';
import { AdminPanel } from './Pages/AdminPanel_Page/AdminPanel';
import { NoMoney } from './Pages/NoMoney/NoMoney';

function App() {
  return (
    <UiProvider>
      <UserProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/vacations" element={<Vacations />} />
          <Route path="/vacations/add" element={<AddVacation />} />
          <Route path="/vacations/edit/:id" element={<EditVacation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/no-money" element={<NoMoney />} />
        </Routes>
      </UserProvider>
    </UiProvider>
  );
}

export default App;
