import {useEffect, useRef} from 'react';
import {DIARIO, DIAS, PRIMER_DIA, diaDelAnio, miles, testigos, type Autor} from '../content';
import {progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Los testigos: cada documento de la novela es una marca en su día, en la fila de quien lo escribió.
 * El scroll ilumina una fila cada vez y termina con Mina, que lo pasó todo a máquina.
 *
 * Guion de scroll (p), sección de 600 svh:
 *   0.00 – 0.06  aparecen todas las filas a media luz
 *   0.06 – 0.80  seis pasos (≈ 0.12 cada uno): se ilumina la fila de cada testigo y su ficha
 *   0.82 – 1.00  todas encendidas; la fila de Mina en rojo y la frase final
 */

const FILAS = testigos.filas;
const OTROS: Autor[] = ['arthur', 'quincey', 'demeter', 'prensa'];
const fila = (a: Autor) => (OTROS.includes(a) ? 'otros' : a);
const MAX = Math.max(...DIARIO.entradas.map((e) => e.palabras));
const ALTO_FILA = 60;
const MESES_EJE = [
  {n: diaDelAnio(1, 6) - PRIMER_DIA, t: 'jun'},
  {n: diaDelAnio(1, 7) - PRIMER_DIA, t: 'jul'},
  {n: diaDelAnio(1, 8) - PRIMER_DIA, t: 'ago'},
  {n: diaDelAnio(1, 9) - PRIMER_DIA, t: 'sep'},
  {n: diaDelAnio(1, 10) - PRIMER_DIA, t: 'oct'},
  {n: diaDelAnio(1, 11) - PRIMER_DIA, t: 'nov'},
];
const datos = FILAS.map((f) => {
  const docs = DIARIO.entradas.filter((e) => fila(e.autor) === f.autor);
  return {...f, docs: docs.length, palabras: docs.reduce((s, e) => s + e.palabras, 0)};
});
const INI = 0.06;
const PASO = (0.8 - INI) / FILAS.length;

export function Testigos() {
  const raizRef = useRef<HTMLElement>(null);
  const filaRefs = useRef<(SVGGElement | null)[]>([]);
  const etiquetaRefs = useRef<(HTMLElement | null)[]>([]);
  const fichaRefs = useRef<(HTMLElement | null)[]>([]);
  const finalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00003) return;
      pAnterior = p;
      const fin = tramo(p, 0.82, 0.88);
      const actual = p < INI ? -1 : Math.min(FILAS.length - 1, Math.floor((p - INI) / PASO));
      FILAS.forEach((f, i) => {
        const activa = i === actual && fin === 0;
        const encendida = activa || fin > 0;
        const g = filaRefs.current[i];
        if (g) {
          g.style.opacity = encendida ? '1' : '0.28';
          g.style.fill = (fin > 0 ? f.autor === 'mina' : activa) ? 'var(--color-sangre-viva)' : 'var(--color-hueso)';
        }
        const et = etiquetaRefs.current[i];
        if (et) et.style.color = activa || (fin > 0 && f.autor === 'mina') ? 'var(--color-sangre-viva)' : encendida ? 'var(--color-hueso)' : 'var(--color-hueso-3)';
        const ficha = fichaRefs.current[i];
        if (ficha) {
          const d = (p - INI) / PASO - i;
          const o = fin > 0 ? 0 : Math.min(tramo(d, 0, 0.15), 1 - tramo(d, 0.88, 1));
          ficha.style.opacity = String(o);
          ficha.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        }
      });
      finalRef.current!.style.opacity = String(fin);
      finalRef.current!.style.visibility = fin > 0.01 ? 'visible' : 'hidden';
    });
  }, []);

  return (
    <section ref={raizRef} id="testigos" aria-labelledby="testigos-titulo" className="relative" style={{height: '600svh'}}>
      <div className="sticky top-0 flex h-pantalla flex-col overflow-hidden bg-noche px-4 pt-[5svh] pb-[3svh] sm:px-6 md:px-[6vw] md:pt-[7svh]">
        <p className="etiqueta text-sangre-viva">{testigos.antetitulo}</p>
        <h2 id="testigos-titulo" className="mt-1 font-display text-[clamp(1.875rem,4vw,3.5rem)] leading-none font-bold">
          {testigos.titulo}
        </h2>
        <p className="mt-2 max-w-[48rem] text-[0.9375rem] text-hueso/75 md:text-body">{testigos.cuerpo}</p>

        <div className="mt-5 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 md:mt-8 md:grid-cols-[11rem_minmax(0,1fr)]">
          <ul className="flex flex-col" aria-hidden="true">
            {datos.map((f, i) => (
              <li
                key={f.autor}
                ref={(el) => {
                  etiquetaRefs.current[i] = el;
                }}
                className="flex items-end pb-1 font-display text-[0.9375rem] leading-tight font-semibold text-hueso-3 md:text-[1.25rem]"
                style={{height: `calc((100svh - 30rem) / 6)`, minHeight: '2.5rem', maxHeight: '4.5rem'}}
              >
                {f.nombre}
              </li>
            ))}
          </ul>
          <div className="relative">
            <svg viewBox={`0 0 ${DIAS} ${ALTO_FILA * FILAS.length}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {datos.map((f, i) => (
                <g
                  key={f.autor}
                  ref={(el) => {
                    filaRefs.current[i] = el;
                  }}
                  style={{opacity: 0.28, fill: 'var(--color-hueso)', transition: 'opacity 0.3s, fill 0.3s'}}
                >
                  <line x1="0" x2={DIAS} y1={(i + 1) * ALTO_FILA - 1} y2={(i + 1) * ALTO_FILA - 1} stroke="var(--color-noche-3)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  {DIARIO.entradas
                    .filter((e) => fila(e.autor) === f.autor)
                    .map((e, k) => {
                      const h = Math.max(4, Math.sqrt(e.palabras / MAX) * (ALTO_FILA - 6));
                      return <rect key={k} x={diaDelAnio(e.dia, e.mes) - PRIMER_DIA} y={(i + 1) * ALTO_FILA - 1 - h} width="0.9" height={h} />;
                    })}
                </g>
              ))}
              {MESES_EJE.map((m) => (
                <line key={m.t} x1={m.n} x2={m.n} y1="0" y2={ALTO_FILA * FILAS.length} stroke="var(--color-noche-3)" strokeWidth="1" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
          <div />
          <div className="relative mt-1 h-4 font-mono text-[0.6875rem] text-hueso-3" aria-hidden="true">
            <span className="absolute left-0">may</span>
            {MESES_EJE.map((m) => (
              <span key={m.t} className="absolute -translate-x-1/2" style={{left: `${(m.n / DIAS) * 100}%`}}>
                {m.t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-4 min-h-0 flex-1 md:mt-6">
          {datos.map((f, i) => (
            <div
              key={f.autor}
              ref={(el) => {
                fichaRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-0 max-w-[46rem] md:grid md:grid-cols-[auto_minmax(0,1fr)] md:gap-8"
              style={{opacity: 0, visibility: 'hidden'}}
            >
              <p className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-none font-bold text-sangre-viva tabular-nums">
                {miles(f.palabras)}
                <span className="mt-1 block font-mono text-[0.75rem] font-normal text-hueso-3">
                  palabras · {f.docs} documentos
                </span>
              </p>
              <p className="mt-2 text-[0.9375rem] leading-snug text-hueso/85 md:mt-0 md:text-body">{f.texto}</p>
            </div>
          ))}
          <div ref={finalRef} className="absolute inset-x-0 top-0 max-w-[50rem]" style={{opacity: 0, visibility: 'hidden'}}>
            <p className="font-mono text-[0.9375rem] text-sangre-viva italic md:text-[1.0625rem]" lang="en">
              «{testigos.citaFinal}»
            </p>
            <p className="mt-2 font-display text-[clamp(1.375rem,2.4vw,2rem)] leading-snug font-medium">{testigos.final}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
