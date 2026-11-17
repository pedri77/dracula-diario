import {useEffect, useRef} from 'react';
import {IMAGENES, MAPA, MESES, NOMBRES, imagenUrl, viaje} from '../content';
import {easeInOutSine, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * El viaje: la costa real de Europa (Natural Earth) con una cámara que va de parada en parada. Los tres
 * trayectos se dibujan en rojo cuando toca: la ida de Jonathan, la travesía del Demeter y la persecución.
 *
 * Guion de scroll (p), sección de 1000 svh. 13 paradas repartidas entre 0.04 y 0.96 (≈ 0.07 cada una):
 *   en cada parada, la ficha de texto aparece en su primer 20 % y se va en el último 15 %
 *   entre paradas, la cámara viaja; si están lejos, se aleja a todo el mapa a mitad de camino
 *   ida   se dibuja de la parada 0 a la 1 · mar de la 5 a la 6 · vuelta de la 10 a la 12
 */

const {ancho: W, alto: H, lugares: L} = MAPA;
const HITOS = viaje.hitos;
const N = HITOS.length;
const INI = 0.04;
const PASO = (0.96 - INI) / N;
const ZOOM: Record<string, number> = {castillo: 2.2, bistritz: 2.2, whitby: 2.4, londres: 2.4, varna: 2};
const RUTAS: Record<string, [number, number]> = {ida: [0, 1], mar: [5, 6], vuelta: [10, 12]};

const camara = (i: number) => {
  const [x, y] = L[HITOS[i].punto];
  return {x, y, z: ZOOM[HITOS[i].punto] ?? 2};
};
const ruta = (puntos: string[]) => 'M' + puntos.map((k) => L[k].join(' ')).join('L');

export function Viaje() {
  const raizRef = useRef<HTMLElement>(null);
  const camRef = useRef<SVGGElement>(null);
  const rutaRefs = useRef<Record<string, SVGPathElement | null>>({});
  const fichaRefs = useRef<(HTMLElement | null)[]>([]);
  const puntoRefs = useRef<(SVGGElement | null)[]>([]);
  const fechaRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let pAnterior = -1;
    let actualAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00003) return;
      pAnterior = p;
      const f = Math.max(0, (p - INI) / PASO); // 0..N
      const i = Math.min(N - 1, Math.floor(f));
      const dentro = f - i; // 0..1 dentro de la parada i
      // Cámara: quieta en la primera mitad de la parada, viaja a la siguiente en la segunda.
      const a = camara(i);
      const b = camara(Math.min(N - 1, i + 1));
      const t = i === N - 1 ? 0 : easeInOutSine(tramo(dentro, 0.55, 1));
      const lejos = Math.hypot(a.x - b.x, a.y - b.y) > 120;
      const zMedio = lejos ? 1 : Math.min(a.z, b.z);
      const z = t < 0.5 ? lerp(a.z, zMedio, t * 2) : lerp(zMedio, b.z, t * 2 - 1);
      const cx = lerp(a.x, b.x, t);
      const cy = lerp(a.y, b.y, t);
      // Primera parada: entra desde el mapa entero.
      const entrada = easeInOutSine(tramo(p, 0, INI + PASO * 0.3));
      const zz = lerp(1, z, entrada);
      const xx = lerp(W / 2, cx, entrada);
      const yy = lerp(H / 2, cy, entrada);
      camRef.current!.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${zz}) translate(${-xx} ${-yy})`);

      for (const [id, [r0, r1]] of Object.entries(RUTAS)) {
        const k = tramo(f, r0 + 0.55, r1 + 0.55);
        const el = rutaRefs.current[id];
        if (el) el.style.strokeDashoffset = String(1 - k);
      }
      fichaRefs.current.forEach((el, j) => {
        if (!el) return;
        const o = j === i ? Math.min(tramo(dentro, 0, 0.12), j === N - 1 ? 1 : 1 - tramo(dentro, 0.85, 1)) : 0;
        el.style.opacity = String(o);
        el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        el.style.transform = `translate3d(0, ${(1 - o) * 12}px, 0)`;
      });
      if (i !== actualAnterior) {
        actualAnterior = i;
        const h = HITOS[i];
        fechaRef.current!.textContent = `${h.dia} de ${MESES[h.mes - 1]}`;
        puntoRefs.current.forEach((g, j) => g?.setAttribute('opacity', j === i ? '1' : HITOS[j].punto === h.punto ? '0' : '0.55'));
      }
    });
  }, []);

  const puntos = [...new Set(HITOS.map((h) => h.punto))];

  return (
    <section ref={raizRef} id="viaje" aria-labelledby="viaje-titulo" className="relative" style={{height: '1000svh'}}>
      <div className="grano sticky top-0 flex h-pantalla flex-col overflow-hidden bg-hueso text-tinta md:flex-row">
        <div className="relative z-10 flex flex-col px-4 pt-[4svh] sm:px-6 md:w-[38vw] md:shrink-0 md:justify-center md:px-[5vw] md:py-[6svh]">
          <p className="etiqueta text-sangre">{viaje.antetitulo}</p>
          <h2 id="viaje-titulo" className="mt-1 font-display text-[clamp(1.75rem,3.4vw,3rem)] leading-none font-bold">
            {viaje.titulo}
          </h2>
          <p ref={fechaRef} className="mt-3 font-display text-[clamp(2.25rem,4.6vw,4.25rem)] leading-none font-semibold text-sangre italic tabular-nums md:mt-6" aria-hidden="true">
            3 de mayo
          </p>
          <div className="relative mt-2 h-[13.5rem] md:mt-4 md:h-[22rem]">
            {HITOS.map((h, j) => (
              <article
                key={j}
                ref={(el) => {
                  fichaRefs.current[j] = el;
                }}
                className="absolute inset-0"
                style={{opacity: 0, visibility: 'hidden'}}
              >
                <p className="etiqueta text-tinta-3">
                  <span className="sr-only">
                    {h.dia} de {MESES[h.mes - 1]}.{' '}
                  </span>
                  {h.lugar} · {NOMBRES[h.autor]}
                </p>
                <blockquote className="mt-2 border-l-4 border-sangre pl-3 font-mono text-[0.875rem] leading-snug md:text-[1rem]" lang="en">
                  «{h.cita}»
                </blockquote>
                <p className="mt-3 text-body text-tinta-2">{h.texto}</p>
                {h.imagen && IMAGENES[h.imagen] && (
                  <img src={imagenUrl(h.imagen)} alt="Cubierta de 1919: el conde baja por la muralla del castillo boca abajo, con la capa abierta como alas" width={IMAGENES[h.imagen].w} height={IMAGENES[h.imagen].h} loading="lazy" decoding="async" className="grabado mt-3 hidden h-[9rem] w-auto border border-tinta/30 md:block" />
                )}
              </article>
            ))}
          </div>
        </div>

        <figure className="relative min-h-0 flex-1" aria-label={viaje.cuerpo}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <pattern id="olas" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M0 6 Q2.5 4 5 6 T10 6" fill="none" stroke="oklch(55% 0.03 240 / 0.18)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#olas)" />
            <g ref={camRef}>
              <path d={MAPA.tierra} fill="var(--color-hueso-2)" stroke="var(--color-tinta-3)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              {viaje.tramos.map((r) => (
                <g key={r.id}>
                  <path d={ruta(r.puntos)} fill="none" stroke="var(--color-tinta)" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
                  <path
                    ref={(el) => {
                      rutaRefs.current[r.id] = el;
                    }}
                    d={ruta(r.puntos)}
                    fill="none"
                    stroke="var(--color-sangre)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    strokeDasharray="1"
                    style={{strokeDashoffset: 1}}
                  />
                </g>
              ))}
              {puntos.map((k) => (
                <circle key={k} cx={L[k][0]} cy={L[k][1]} r="2.2" fill="var(--color-tinta)" />
              ))}
              {HITOS.map((h, j) => (
                <g
                  key={j}
                  ref={(el) => {
                    puntoRefs.current[j] = el;
                  }}
                  opacity={j === 0 ? 1 : 0.55}
                >
                  <circle cx={L[h.punto][0]} cy={L[h.punto][1]} r="5" fill="none" stroke="var(--color-sangre)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </g>
              ))}
            </g>
          </svg>
          <figcaption className="absolute right-3 bottom-2 hidden flex-wrap md:flex justify-end gap-x-4 gap-y-1 font-mono text-[0.6875rem] text-tinta-2">
            {viaje.tramos.map((r) => (
              <span key={r.id} className="flex items-center gap-1.5">
                <span className="inline-block h-[3px] w-4 bg-sangre" />
                {r.nombre}
              </span>
            ))}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
