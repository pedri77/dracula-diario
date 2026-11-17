import {IMAGENES, creditos, imagenUrl} from '../content';
import {useAparecer} from '../hooks/useAparecer';
import {irA} from '../lib/scroll';

/** Fuentes, licencia de cada imagen y la cubierta amarilla de 1897. */
export function Creditos() {
  const ref = useAparecer<HTMLElement>();
  const primera = IMAGENES.primera;
  return (
    <footer ref={ref} aria-labelledby="creditos-titulo" className="bg-noche-2 px-4 pt-[14svh] pb-10 sm:px-6 md:px-[6vw]">
      <div className="mx-auto grid max-w-[80rem] gap-10 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-16">
        {primera && (
          <figure data-aparece className="max-w-[13rem] md:max-w-none">
            <img src={imagenUrl('primera')} alt="Cubierta de la primera edición de Drácula, 1897: tela amarilla con el título y el autor en rojo" width={primera.w} height={primera.h} loading="lazy" decoding="async" className="block w-full shadow-[0_18px_40px_oklch(5%_0.01_25/0.6)]" />
            <figcaption className="mt-3 text-[0.875rem] leading-snug text-hueso-3">{creditos.libro}</figcaption>
          </figure>
        )}
        <div>
          <h2 id="creditos-titulo" data-aparece className="font-display text-display font-bold">
            {creditos.titulo}
          </h2>
          <ul className="mt-6 grid gap-2.5 text-body">
            {creditos.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noreferrer" className="underline decoration-hueso/35 underline-offset-4 hover:decoration-sangre-viva">
                  {f.nombre} ↗
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-6 grid gap-2 text-[0.9375rem] text-hueso/75">
            {creditos.imagenes.map((c) => {
              const im = IMAGENES[c.id];
              if (!im) return null;
              return (
                <li key={c.id} className="border-b border-noche-3 pb-2">
                  <a href={im.pagina} target="_blank" rel="noreferrer" className="text-hueso underline decoration-hueso/30 underline-offset-4 hover:decoration-sangre-viva">
                    {c.texto}
                  </a>
                  . {im.licencia.toLowerCase().includes('public domain') ? 'Dominio público' : im.licencia}.
                </li>
              );
            })}
          </ul>
          <p className="mt-6 max-w-[52rem] text-[0.9375rem] text-hueso/70">{creditos.metodo}</p>
          <button type="button" onClick={() => irA('#calendario')} className="mt-8 border border-hueso/60 px-5 py-2.5 font-mono text-[0.875rem] transition-colors hover:border-sangre-viva hover:bg-sangre hover:text-hueso">
            ↑ Volver al 3 de mayo
          </button>
          <p className="mt-10 font-display text-[1.5rem] text-sangre-viva italic">{creditos.firma}</p>
        </div>
      </div>
    </footer>
  );
}
