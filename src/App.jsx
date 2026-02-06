import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Calculator from './pages/Calculator';
import Pokedex from './pages/Pokedex';
import PokemonDetail from './pages/PokemonDetail';
import TeamBuilder from './pages/TeamBuilder';
import Emulator from './pages/Emulator';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Calculator />} />
          <Route path="pokedex" element={<Pokedex />} />
          <Route path="pokemon/:id" element={<PokemonDetail />} />
          <Route path="teamBuilder" element={<TeamBuilder />} />
          <Route path="emulator" element={<Emulator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
