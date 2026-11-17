import {useEffect} from 'react';
import {Creditos} from './components/Creditos';
import {Mitos} from './components/Mitos';
import {Palabras} from './components/Palabras';
import {Portada} from './components/Portada';
import {Testigos} from './components/Testigos';
import {Viaje} from './components/Viaje';
import {useMovimientoReducido} from './hooks/useMovimientoReducido';
import {iniciarScroll} from './lib/scroll';

/** Orden del guion: calendario de 188 días · el viaje en el mapa · quién escribe · mitos frente al libro · las palabras · fuentes. */
export default function App() {
  const reducido = useMovimientoReducido();
  useEffect(() => iniciarScroll(reducido), [reducido]);
  return (
    <main>
      <Portada />
      <Viaje />
      <Testigos />
      <Mitos />
      <Palabras />
      <Creditos />
    </main>
  );
}
