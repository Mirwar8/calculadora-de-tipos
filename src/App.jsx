import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EmulatorProvider } from './context/EmulatorContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Calculator from './pages/Calculator';
import Pokedex from './pages/Pokedex';
import PokemonDetail from './pages/PokemonDetail';
import PokemonDetailAnalysis from './components/PokemonDetail';
import TeamBuilder from './pages/TeamBuilder';
import Emulator from './pages/Emulator';
import Settings from './pages/Settings';
function App() {

  return (
    <EmulatorProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="calculator" element={<Calculator />} />
            <Route path="calculator/pokemon" element={<PokemonDetailAnalysis />} />
            <Route path="pokedex" element={<Pokedex />} />
            <Route path="pokemon/:id" element={<PokemonDetail />} />
            <Route path="teamBuilder" element={<TeamBuilder />} />
            <Route path="emulator" element={<Emulator />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EmulatorProvider>
  );
}

export default App;
