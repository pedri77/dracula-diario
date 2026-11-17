import {useEffect, useRef} from 'react';
import {IMAGENES, imagenUrl, mitos} from '../content';
import {easeInOutSine, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Lo que no está en el libro: cuatro fichas que giran con el scroll. Delante, el mito; detrás, el texto.
 *
 * Guion de scroll (p), sección de 480 svh:
 *   0.00 – 0.08  las cuatro fichas por el lado del mito
 *   0.10 – 0.85  giran de una en una (≈ 0.19 cada una, el giro ocupa su primera mitad)
 *   0.85 – 1.00  las cuatro por el lado del libro
 */

const FICHAS = mitos.fichas;
const INI = 0.1;
const PASO = 0.75 / FICHAS.length;

export function Mitos() {
  const raizRef = useRef<HTMLElement>(null);
  const cartaRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00003) return;
      pAnterior = p;
      cartaRefs.current.forEach((el, j) => {
        if (!el) return;
        const k = easeInOutSine(tramo(p, INI + j * PASO, INI + j * PASO + PASO * 0.5));
        el.style.transform = `rotateY(${k * 180}deg)`;
        // Para lectores de pantalla y para quien no ve el giro: la cara oculta queda inerte.
        const delante = el.children[0] as HTMLElement;
        const detras = el.children[1] as HTMLElement;
        delante.inert = k > 0.5;
        detras.inert = k <= 0.5;
      });
    });
  }, []);

  return (
    <section ref={raizRef} id="mitos" aria-labelledby="mitos-titulo" className="relative" style={{height: '480svh'}}>
      <div className="grano sticky top-0 flex h-pantalla flex-col overflow-hidden bg-hueso px-4 pt-[5svh] pb-[3svh] text-tinta sm:px-6 md:px-[6vw] md:pt-[8svh]">
        <p className="etiqueta text-sangre">{mitos.antetitulo}</p>
        <h2 id="mitos-titulo" className="mt-1 max-w-[24ch] font-display text-[clamp(1.875rem,4vw,3.5rem)] leading-none font-bold">
          {mitos.titulo}
        </h2>
        <p className="mt-2 hidden max-w-[48rem] text-body text-tinta-2 md:block">{mitos.cuerpo}</p>

        <ul className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-2.5 [perspective:1400px] md:mt-8 md:grid-cols-4 md:gap-5 md:pb-[4svh]">
          {FICHAS.map((f, j) => (
            <li key={f.mito} className="relative min-h-0">
              <div
                ref={(el) => {
                  cartaRefs.current[j] = el;
                }}
                className="relative h-full [transform-style:preserve-3d]"
              >
                <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-sm bg-noche p-3 text-hueso [backface-visibility:hidden] md:p-6">
                  <p className="font-mono text-[0.6875rem] text-hueso-3 uppercase md:text-[0.75rem]">Mito {j + 1}</p>
                  <p className="font-display text-[clamp(1.25rem,2.6vw,2.5rem)] leading-[1.02] font-bold">{f.mito}</p>
                  <p className="font-display text-[3rem] leading-none text-sangre-viva md:text-[5rem]" aria-hidden="true">
                    ?
                  </p>
                </div>
                <div className="renglones absolute inset-0 flex flex-col overflow-hidden rounded-sm border border-tinta/25 p-3 [backface-visibility:hidden] [transform:rotateY(180deg)] md:p-6" inert>
                  <p className="font-mono text-[0.6875rem] text-sangre uppercase md:text-[0.75rem]">En el libro</p>
                  <p className="mt-1 font-display text-[clamp(1.0625rem,1.8vw,1.75rem)] leading-[1.05] font-bold">{f.libro}</p>
                  <p className="mt-2 font-display text-[clamp(2.25rem,4.5vw,4.5rem)] leading-none font-bold text-sangre tabular-nums md:mt-4">
                    {f.cifra}
                    <span className="ml-1.5 font-mono text-[0.6875rem] font-normal text-tinta-3 md:text-[0.8125rem]">{f.cifraTexto}</span>
                  </p>
                  <p className="mt-2 min-h-0 overflow-hidden text-[0.8125rem] leading-snug text-tinta-2 md:mt-4 md:text-[1rem]">{f.detalle}</p>
                  {f.imagen && IMAGENES[f.imagen] && (
                    <img src={imagenUrl(f.imagen)} alt="Notas manuscritas de Bram Stoker con la lista de personajes de la novela" width={IMAGENES[f.imagen].w} height={IMAGENES[f.imagen].h} loading="lazy" decoding="async" className="grabado mt-auto hidden max-h-[9rem] w-auto self-start border border-tinta/25 md:block" />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
