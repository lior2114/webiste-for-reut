import { Routes, Route } from 'react-router-dom';
import { UiProvider } from './Contexts/UiContext';
import { NavBar } from './Components/NavBar';
import { Home } from './Pages/Home_Page/Home';
import { About } from './Pages/About_Page/About';
import { Vacations } from './Pages/Vacations_Page/Vacations';
import { AddVacation } from './Pages/AddVacation_Page/AddVacation';
import { EditVacation } from './Pages/EditVacation_Page/EditVacation';
import { NoMoney } from './Pages/NoMoney/NoMoney';

function App() {
  return (
    <UiProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/vacations" element={<Vacations />} />
        <Route path="/vacations/add" element={<AddVacation />} />
        <Route path="/vacations/edit/:id" element={<EditVacation />} />
        <Route path="/no-money" element={<NoMoney />} />
      </Routes>
    </UiProvider>
  );
}

export default App;
