import {useEffect, useMemo, useRef} from 'react';
import {DIAS, DIARIO, MESES, NOMBRES, PRIMER_DIA, TIPOS, diaDelAnio, fechaDe, portada, type Entrada} from '../content';
import {easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Portada: un taco de calendario que se arranca hoja a hoja del 3 de mayo al 6 de noviembre. Al lado,
 * lo que se escribió ese día en la novela (autor, tipo de documento y primeras palabras).
 *
 * Guion de scroll (p), sección de 700 svh:
 *   0.00 – 0.06  título y entradilla; el calendario en el 3 de mayo
 *   0.06 – 0.92  pasan los 188 días: la hoja de arriba cae en la segunda mitad de cada día
 *   0.92 – 1.00  6 de noviembre: «Fin del diario» y la posdata de Jonathan
 * La regla de abajo marca los días con documentos; el cursor rojo es el día actual.
 */

const POR_DIA = new Map<number, Entrada[]>();
for (const e of DIARIO.entradas) {
  const n = diaDelAnio(e.dia, e.mes) - PRIMER_DIA;
  POR_DIA.set(n, [...(POR_DIA.get(n) ?? []), e]);
}

function pintarHoja(el: HTMLElement | null, n: number) {
  if (!el) return;
  const {dia, mes} = fechaDe(n);
  el.querySelector('[data-mes]')!.textContent = MESES[mes - 1];
  el.querySelector('[data-dia]')!.textContent = String(dia);
  el.querySelector('[data-n]')!.textContent = `día ${n + 1} de ${DIAS}`;
}

function Hoja({refEl, z}: {refEl: React.Ref<HTMLDivElement>; z: number}) {
  return (
    <div ref={refEl} className="renglones absolute inset-0 flex origin-top flex-col overflow-hidden rounded-[3px] text-tinta shadow-[0_18px_40px_oklch(5%_0.01_25/0.6)]" style={{zIndex: z}}>
      <p data-mes className="bg-sangre py-2 text-center font-display text-[1.25rem] font-semibold tracking-[0.3em] text-hueso uppercase md:text-[1.5rem]">
        mayo
      </p>
      <p data-dia className="flex flex-1 items-center justify-center font-display text-[8.5rem] leading-none font-bold tabular-nums md:text-[11rem]">
        3
      </p>
      <p data-n className="pb-3 text-center font-mono text-[0.75rem] text-tinta-3">
        día 1 de 188
      </p>
    </div>
  );
}

export function Portada() {
  const raizRef = useRef<HTMLElement>(null);
  const arribaRef = useRef<HTMLDivElement>(null);
  const abajoRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const marcas = useMemo(() => [...POR_DIA.keys()], []);

  useEffect(() => {
    let pAnterior = -1;
    let diaAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00003) return;
      pAnterior = p;
      const f = tramo(p, 0.06, 0.92) * (DIAS - 1);
      const i = Math.min(DIAS - 1, Math.floor(f));
      const frac = i === DIAS - 1 ? 0 : f - i;
      if (i !== diaAnterior) {
        diaAnterior = i;
        pintarHoja(arribaRef.current, i);
        pintarHoja(abajoRef.current, Math.min(DIAS - 1, i + 1));
        const lista = listaRef.current!;
        const hoy = POR_DIA.get(i) ?? [];
        lista.replaceChildren(
          ...(hoy.length
            ? hoy.slice(0, 3).map((e) => {
                const li = document.createElement('li');
                li.className = 'border-l-2 border-sangre-viva pl-3';
                const a = document.createElement('p');
                a.className = 'font-display text-[1.25rem] leading-tight font-semibold text-hueso md:text-[1.5rem]';
                a.textContent = NOMBRES[e.autor];
                const t = document.createElement('p');
                t.className = 'etiqueta mt-0.5 text-hueso-3';
                t.textContent = [TIPOS[e.tipo] ?? e.tipo, e.lugar].filter(Boolean).join(' · ');
                const c = document.createElement('p');
                c.className = 'mt-1 font-mono text-[0.8125rem] leading-snug text-hueso/80 italic md:text-[0.875rem]';
                c.lang = 'en';
                c.textContent = `«${e.inicio.replace(/[,;:—-]+$/, '')}…»`;
                li.append(a, t, c);
                return li;
              })
            : [Object.assign(document.createElement('li'), {className: 'font-display text-[1.25rem] text-hueso-3 italic', textContent: portada.nadie})]),
        );
      }
      // La hoja de arriba cae en la segunda mitad del día: se suelta del taco, gira y baja.
      const k = easeOutCubic(tramo(frac, 0.5, 1));
      const arriba = arribaRef.current!;
      arriba.style.transform = `translate3d(${lerp(0, 40, k)}px, ${lerp(0, 120, k)}%, 0) rotate(${lerp(0, 14, k)}deg)`;
      arriba.style.opacity = String(1 - tramo(frac, 0.75, 1));
      cursorRef.current!.style.left = `${(f / (DIAS - 1)) * 100}%`;
      const t = tramo(p, 0.0, 0.08);
      tituloRef.current!.style.opacity = String(lerp(1, 0.55, t));
      const fin = tramo(p, 0.93, 0.98);
      finRef.current!.style.opacity = String(fin);
      finRef.current!.style.transform = `translate3d(0, ${(1 - fin) * 16}px, 0)`;
    });
  }, []);

  return (
    <section ref={raizRef} id="calendario" aria-labelledby="titulo" className="relative" style={{height: '700svh'}}>
      <div className="sticky top-0 flex h-pantalla flex-col overflow-hidden bg-noche px-4 pt-[5svh] pb-[3svh] sm:px-6 md:flex-row md:items-center md:gap-[5vw] md:px-[6vw] md:py-0">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,oklch(30%_0.08_25/0.45),transparent_60%)]" />
        <div ref={tituloRef} className="relative md:w-[34vw] md:shrink-0">
          <p className="etiqueta text-sangre-viva">{portada.antetitulo}</p>
          <h1 id="titulo" className="mt-2 font-display text-hero font-bold text-hueso">
            {portada.titulo}
            <span className="block text-[0.42em] font-medium text-sangre-viva italic">{portada.subtitulo}</span>
          </h1>
          <p className="mt-4 hidden max-w-[34rem] text-lead text-hueso/80 md:block">{portada.entradilla}</p>
          <p className="mt-6 hidden font-mono text-[0.8125rem] text-hueso-3 md:block">↓ {portada.pista}</p>
        </div>

        <div className="relative mt-5 flex min-h-0 flex-1 flex-row items-start gap-5 md:mt-0 md:items-center md:gap-[3vw]">
          <div className="relative h-[15rem] w-[11rem] shrink-0 md:h-[22rem] md:w-[17rem]" aria-hidden="true">
            <div className="absolute inset-0 translate-x-[6px] translate-y-[8px] rounded-[3px] bg-hueso-3" />
            <div className="absolute inset-0 translate-x-[3px] translate-y-[4px] rounded-[3px] bg-hueso-2" />
            <Hoja refEl={abajoRef} z={1} />
            <Hoja refEl={arribaRef} z={2} />
            <div className="absolute -top-2 left-1/2 z-10 h-4 w-[70%] -translate-x-1/2 rounded-sm bg-noche-3" />
          </div>
          <div className="min-w-0 flex-1" aria-live="off">
            <p className="etiqueta text-hueso-3">{portada.hoy}</p>
            <ul ref={listaRef} className="mt-3 flex flex-col gap-4" />
          </div>
        </div>

        <div className="relative mt-4 md:absolute md:right-[6vw] md:bottom-[5svh] md:left-[6vw]" aria-hidden="true">
          <div className="relative h-5">
            {marcas.map((n) => (
              <span key={n} className="absolute bottom-0 h-3 w-px bg-hueso/45" style={{left: `${(n / (DIAS - 1)) * 100}%`}} />
            ))}
            <div ref={cursorRef} className="absolute bottom-0 h-5 w-[3px] -translate-x-1/2 bg-sangre-viva" />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[0.6875rem] text-hueso-3">
            <span>3 mayo</span>
            <span>6 noviembre</span>
          </div>
        </div>

        <div ref={finRef} className="pointer-events-none absolute inset-x-4 bottom-[12svh] text-center opacity-0 md:inset-x-[20vw] md:bottom-[14svh]">
          <p className="font-display text-display font-bold text-sangre-viva">{portada.final}</p>
          <p className="mt-3 font-mono text-[0.875rem] text-hueso/85 italic" lang="en">
            {portada.posdata}
          </p>
          <p className="mt-1 text-[0.9375rem] text-hueso-3">{portada.posdataEs}</p>
        </div>
        <p className="relative mt-3 text-[0.9375rem] leading-snug text-hueso/75 md:hidden">{portada.entradilla}</p>
      </div>
    </section>
  );
}
