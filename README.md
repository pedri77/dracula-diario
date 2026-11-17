# Drácula, día a día

Web cinemática sobre *Dracula* (Bram Stoker, 1897) contada por fechas: https://pedri77.github.io/dracula-diario/

- **Calendario**: un taco que se arranca hoja a hoja del 3 de mayo al 6 de noviembre, con lo que se escribió cada día.
- **El viaje**: la costa real de Europa con la ida de Jonathan, la travesía del Demeter y la persecución.
- **Los testigos**: los 155 documentos con fecha, por autor y día.
- **Mitos**: colmillos, sol, estaca y nombre frente a lo que dice el texto.
- **Las palabras**: recuentos sobre el texto completo («fangs»: 0).

## Datos

- `scripts/diario.py`: lee el texto de Project Gutenberg (n.º 345) y saca fecha, autor, tipo y palabras de cada documento.
- `scripts/mapa.py`: costa de Natural Earth 1:50m (dominio público) a un path SVG.
- `scripts/imagenes.py`: tres imágenes de dominio público de Wikimedia Commons (comprueba la licencia).

Los textos brutos van en `datos-crudos/` (fuera del repo). Solo se publican cifras y frases cortas.

## Técnica

React + Vite + Tailwind 4, Lenis y un único bucle rAF que escribe estilos al DOM. Respeta `prefers-reduced-motion`.
Hecha con ayuda de IA (Claude).
