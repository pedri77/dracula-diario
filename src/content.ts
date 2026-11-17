import diarioJson from './datos/diario.json';
import imagenesJson from './datos/imagenes.json';
import mapaJson from './datos/mapa.json';

/** Textos de la web. Las citas en inglés son de la edición de Project Gutenberg (n.º 345); se comprobaron en el texto. */

export type Autor = 'jonathan' | 'mina' | 'seward' | 'lucy' | 'vanhelsing' | 'arthur' | 'quincey' | 'demeter' | 'prensa';
export type Entrada = {dia: number; mes: number; autor: Autor; tipo: string; capitulo: number; lugar: string; palabras: number; inicio: string};
export const DIARIO = diarioJson as {palabras: number; entradas: Entrada[]; porAutor: Record<string, number>; cuentas: Record<string, number>};
export const MAPA = mapaJson as unknown as {ancho: number; alto: number; tierra: string; lugares: Record<string, [number, number]>};
export const IMAGENES = imagenesJson as Record<string, {fichero: string; pagina: string; licencia: string; w: number; h: number}>;
export const imagenUrl = (id: string) => `${import.meta.env.BASE_URL}img/${id}.webp`;
export const miles = (n: number) => n.toLocaleString('es-ES');

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
/** Día del año (año no bisiesto) para colocar fechas en una línea. */
const ACUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
export const diaDelAnio = (dia: number, mes: number) => ACUM[mes - 1] + dia;
export const PRIMER_DIA = diaDelAnio(3, 5);
export const ULTIMO_DIA = diaDelAnio(6, 11);
export const DIAS = ULTIMO_DIA - PRIMER_DIA + 1;
export function fechaDe(n: number) {
  const d = n + PRIMER_DIA;
  let m = 11;
  while (ACUM[m] >= d) m--;
  return {dia: d - ACUM[m], mes: m + 1};
}

export const NOMBRES: Record<Autor, string> = {
  jonathan: 'Jonathan Harker',
  mina: 'Mina Murray (luego Harker)',
  seward: 'Dr. John Seward',
  lucy: 'Lucy Westenra',
  vanhelsing: 'Abraham Van Helsing',
  arthur: 'Arthur Holmwood',
  quincey: 'Quincey Morris',
  demeter: 'Capitán del Demeter',
  prensa: 'Prensa',
};
export const TIPOS: Record<string, string> = {
  diario: 'diario',
  carta: 'carta',
  telegrama: 'telegrama',
  nota: 'nota',
  'cuaderno de bitácora': 'bitácora',
  prensa: 'recorte de prensa',
  fonógrafo: 'fonógrafo',
};

export const portada = {
  antetitulo: 'Bram Stoker · 1897',
  titulo: 'Drácula',
  subtitulo: 'día a día',
  entradilla:
    'La novela no tiene narrador. Son diarios, cartas, telegramas y recortes de periódico, cada uno con su fecha, ordenados por quienes sobrevivieron. Arranca las hojas del calendario: del 3 de mayo al 6 de noviembre.',
  pista: 'Baja para pasar los días',
  hoy: 'Escrito ese día',
  nadie: 'Nadie escribe hoy.',
  final: 'Fin del diario',
  posdata: '«Seven years ago we all went through the flames…»',
  posdataEs: 'Siete años después, Jonathan añade una nota final. Es lo único sin fecha exacta.',
};

export type Hito = {dia: number; mes: number; lugar: string; punto: string; autor: Autor; cita: string; texto: string; imagen?: string};
/** Paradas del viaje. `punto` es una clave de MAPA.lugares. */
export const viaje = {
  antetitulo: 'El viaje',
  titulo: 'De Bistritz a Whitby, y vuelta',
  cuerpo: 'Tres trayectos sobre la costa real de Europa: Jonathan hacia el castillo, el conde por mar hasta Inglaterra y la persecución de vuelta a los Cárpatos.',
  tramos: [
    {id: 'ida', nombre: 'Jonathan, en tren y en carruaje', puntos: ['munich', 'viena', 'budapest', 'klausenburg', 'bistritz', 'borgo', 'castillo']},
    {id: 'mar', nombre: 'El Demeter, con cincuenta cajas de tierra', puntos: ['varna', 'bosforo', 'dardanelos', 'matapan', 'gibraltar', 'finisterre', 'ouessant', 'dover', 'whitby']},
    {id: 'vuelta', nombre: 'La persecución', puntos: ['londres', 'paris', 'varna', 'galatz', 'veresti', 'castillo']},
  ],
  hitos: [
    {dia: 3, mes: 5, lugar: 'Bistritz', punto: 'bistritz', autor: 'jonathan', cita: 'Left Munich at 8:35 P. M., on 1st May…', texto: 'Jonathan Harker, pasante de abogado, va a cerrar la compra de una casa en Londres para un conde de Transilvania. Apunta recetas para Mina.'},
    {dia: 5, mes: 5, lugar: 'El castillo', punto: 'castillo', autor: 'jonathan', cita: 'Welcome to my house! Enter freely and of your own will!', texto: 'El conde lo recibe en persona, de noche, y le sirve la cena sin comer él.'},
    {dia: 8, mes: 5, lugar: 'El castillo', punto: 'castillo', autor: 'jonathan', cita: 'But there was no reflection of him in the mirror!', texto: 'Afeitándose, Jonathan oye la voz del conde a su espalda. En el espejo solo está él.'},
    {dia: 12, mes: 5, lugar: 'El castillo', punto: 'castillo', autor: 'jonathan', cita: 'face down with his cloak spreading out around him like great wings', texto: 'Desde la ventana lo ve bajar por la muralla boca abajo, como un lagarto.', imagen: 'lagarto'},
    {dia: 30, mes: 6, lugar: 'El castillo', punto: 'castillo', autor: 'jonathan', cita: 'These may be the last words I ever write in this diary.', texto: 'Encerrado, decide bajar él también por el muro. Su diario se corta aquí.'},
    {dia: 6, mes: 7, lugar: 'Varna', punto: 'varna', autor: 'demeter', cita: 'silver sand and boxes of earth', texto: 'Una goleta rusa zarpa del mar Negro con arena y cajas de tierra. La tripulación empieza a desaparecer.'},
    {dia: 8, mes: 8, lugar: 'Whitby', punto: 'whitby', autor: 'prensa', cita: 'an immense dog sprang up on deck from below', texto: 'El Demeter entra en el puerto en plena tormenta con el capitán atado al timón, muerto. Un perro enorme salta a tierra.'},
    {dia: 11, mes: 8, lugar: 'Whitby', punto: 'whitby', autor: 'mina', cita: 'something, long and black, bending over the half-reclining white figure', texto: 'Lucy es sonámbula. Mina la encuentra de madrugada en el banco del acantilado, junto al cementerio.'},
    {dia: 20, mes: 9, lugar: 'Hillingham, Londres', punto: 'londres', autor: 'seward', cita: '“It is all over,” said Van Helsing. “She is dead!”', texto: 'Cuatro transfusiones de sangre después, Lucy muere. Van Helsing sabe que no ha terminado.'},
    {dia: 22, mes: 9, lugar: 'Piccadilly', punto: 'londres', autor: 'mina', cita: 'a tall, thin man, with a beaky nose and black moustache and pointed beard', texto: 'A plena luz del día, en la calle más concurrida de Londres, Jonathan reconoce al conde, rejuvenecido.'},
    {dia: 3, mes: 10, lugar: 'Purfleet', punto: 'londres', autor: 'mina', cita: 'Unclean, unclean! I must touch him or kiss him no more.', texto: 'El conde entra en el cuarto de Mina y la obliga a beber de su pecho. Ella queda marcada.'},
    {dia: 15, mes: 10, lugar: 'Varna', punto: 'varna', autor: 'mina', cita: 'Orient Express. We travelled night and day…', texto: 'El conde huye por mar en el Czarina Catherine. Ellos llegan antes por tierra y lo esperan en Varna. Él desembarca en Galatz.'},
    {dia: 6, mes: 11, lugar: 'Paso de Borgo', punto: 'castillo', autor: 'mina', cita: 'the whole body crumbled into dust and passed from our sight', texto: 'Al ponerse el sol, a punto de despertar, el cuchillo de Jonathan y el de Quincey Morris lo alcanzan en su caja. Quincey muere.'},
  ] satisfies Hito[],
};

export const testigos = {
  antetitulo: 'Los testigos',
  titulo: '155 documentos con fecha',
  cuerpo: 'Cada marca es un documento con fecha, colocada en su día. Su altura, las palabras que tiene.',
  filas: [
    {autor: 'jonathan', nombre: 'Jonathan Harker', texto: 'Abre la novela con dos meses en el castillo, en taquigrafía para que el conde no lo lea. Calla de julio a septiembre: está enfermo en un hospital de Budapest.'},
    {autor: 'mina', nombre: 'Mina Harker', texto: 'Maestra, aprende taquigrafía y máquina de escribir para ayudar a Jonathan. Ella lo pasa todo a limpio: este libro es su montaje.'},
    {autor: 'seward', nombre: 'Dr. John Seward', texto: 'Dirige un manicomio junto a la casa que compró el conde. Graba su diario en un fonógrafo de cilindros. Es la voz que más escribe.'},
    {autor: 'lucy', nombre: 'Lucy Westenra', texto: 'Cartas en mayo y un diario corto en agosto y septiembre. Su última nota la deja escondida en el pecho.'},
    {autor: 'vanhelsing', nombre: 'Abraham Van Helsing', texto: 'Telegramas, cartas y, al final, su propio memorando desde la nieve.'},
    {autor: 'otros', nombre: 'Los demás', texto: 'El cuaderno de bitácora del Demeter, recortes de prensa y cartas de Arthur y Quincey.'},
  ],
  final: 'Mina recoge diarios, cartas, cilindros del fonógrafo y recortes, los pasa a máquina y los ordena por fecha. Por eso el libro existe.',
  citaFinal: 'I have written it out on the typewriter for you.',
};

export type Mito = {mito: string; libro: string; cifra: string; cifraTexto: string; detalle: string; imagen?: string};
export const mitos = {
  antetitulo: 'Lo que no está en el libro',
  titulo: 'El Drácula del cine no es el de Stoker',
  cuerpo: 'Gira cada ficha al bajar: delante, la idea que todos tenemos; detrás, lo que dice el texto.',
  fichas: [
    {mito: 'Tiene colmillos', libro: 'Tiene los dientes afilados', cifra: '0', cifraTexto: 'veces «fangs»', detalle: '«peculiarly sharp white teeth», escribe Jonathan el 5 de mayo. Los colmillos los pusieron el cine y el teatro.'},
    {mito: 'El sol lo destruye', libro: 'Pasea de día por Piccadilly', cifra: '22', cifraTexto: 'de septiembre', detalle: 'De día pierde sus poderes, pero camina por Londres. Muere al atardecer, a cuchillo, no por el sol.'},
    {mito: 'Una estaca en el corazón', libro: 'Un kukri y un cuchillo bowie', cifra: '2', cifraTexto: 'cuchillos', detalle: 'La estaca es para Lucy, el 29 de septiembre. Al conde le cortan el cuello y le clavan el bowie de Quincey Morris en el corazón.'},
    {mito: 'Se llamaba Drácula', libro: 'En las notas era «Count Wampyr»', cifra: '3', cifraTexto: 'personajes que no llegaron', detalle: 'Las notas de Stoker tenían un detective (Cotford), un investigador psíquico (Singleton) y un profesor alemán (Max Windshoeffel). La copia para la imprenta aún se titulaba «The Un-Dead».', imagen: 'notas'},
  ] satisfies Mito[],
};

export const cuentas = [
  {clave: 'night', texto: '«night»'},
  {clave: 'count', texto: '«the Count»'},
  {clave: 'blood', texto: '«blood»'},
  {clave: 'vampire', texto: '«vampire»'},
  {clave: 'typewriter', texto: '«typewriter»'},
  {clave: 'fangs', texto: '«fangs»'},
];

export const creditos = {
  titulo: 'Fuentes',
  libro: 'Publicado en mayo de 1897 (probablemente el día 26) por Archibald Constable and Company: tela amarilla, letras rojas, 6 chelines.',
  fuentes: [
    {nombre: 'Texto: Bram Stoker, «Dracula» (1897), Project Gutenberg n.º 345', url: 'https://www.gutenberg.org/ebooks/345'},
    {nombre: 'Costa de Europa: Natural Earth 1:50m (dominio público)', url: 'https://www.naturalearthdata.com/'},
    {nombre: 'Imágenes: Wikimedia Commons (dominio público)', url: 'https://commons.wikimedia.org/'},
    {nombre: 'Notas de Stoker, primera edición y título: artículo «Dracula» de Wikipedia', url: 'https://en.wikipedia.org/wiki/Dracula'},
  ],
  imagenes: [
    {id: 'primera', texto: 'Cubierta de la primera edición, 1897'},
    {id: 'lagarto', texto: 'Cubierta de la edición de 1919, ilustración de Holloway'},
    {id: 'notas', texto: 'Notas de Stoker sobre los personajes (Rosenbach)'},
  ],
  metodo:
    'Las fechas, autores y palabras salen de leer el texto con un script: cada línea que empieza por una fecha abre un documento nuevo. Solo se publican cifras y frases cortas. Web hecha con ayuda de IA (Claude); los resúmenes en castellano son nuestros.',
  firma: 'Drácula, día a día',
};
