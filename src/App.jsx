
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Calculator from './pages/Calculator';
import Pokedex from './pages/Pokedex';
import TeamBuilder from './pages/TeamBuilder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Calculator />} />
          <Route path="pokedex" element={<Pokedex />} />
          <Route path="teamBuilder" element={<TeamBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
