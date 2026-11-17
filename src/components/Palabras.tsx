import {useEffect, useRef} from 'react';
import {DIARIO, cuentas, miles} from '../content';
import {useMovimientoReducido} from '../hooks/useMovimientoReducido';

/** Las palabras del libro: seis contadores que suben hasta su cifra la primera vez que se ven. */
export function Palabras() {
  const ref = useRef<HTMLElement>(null);
  const reducido = useMovimientoReducido();
  useEffect(() => {
    const raiz = ref.current;
    if (!raiz) return;
    const nums = [...raiz.querySelectorAll<HTMLElement>('[data-cifra]')];
    if (reducido) {
      nums.forEach((el) => (el.textContent = miles(Number(el.dataset.cifra))));
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const paso = (t: number) => {
          const k = Math.min(1, (t - t0) / 1600);
          const suave = 1 - (1 - k) ** 3;
          nums.forEach((el) => (el.textContent = miles(Math.round(Number(el.dataset.cifra) * suave))));
          if (k < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
      },
      {threshold: 0.4},
    );
    io.observe(raiz);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reducido]);

  return (
    <section ref={ref} id="palabras" aria-labelledby="palabras-titulo" className="bg-noche px-4 py-[14svh] sm:px-6 md:px-[6vw]">
      <div className="mx-auto max-w-[80rem]">
        <p className="etiqueta text-sangre-viva">El texto, contado</p>
        <h2 id="palabras-titulo" className="mt-1 font-display text-[clamp(1.875rem,4vw,3.5rem)] leading-none font-bold">
          {miles(DIARIO.palabras)} palabras
        </h2>
        <p className="mt-3 max-w-[46rem] text-body text-hueso/75">
          «Night» gana a «blood». La palabra «vampire» sale tantas veces como «Dracula». Y la máquina de escribir sale tantas veces como el ajo: 21.
        </p>
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-6">
          {cuentas.map((c) => (
            <div key={c.clave} className="border-t border-noche-3 pt-3">
              <dt className="font-mono text-[0.8125rem] text-hueso-3" lang="en">
                {c.texto}
              </dt>
              <dd data-cifra={DIARIO.cuentas[c.clave]} className={`mt-1 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none font-bold tabular-nums ${c.clave === 'fangs' ? 'text-sangre-viva' : ''}`}>
                {miles(DIARIO.cuentas[c.clave])}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
