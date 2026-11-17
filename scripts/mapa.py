"""Natural Earth 1:50m (dominio público) → src/datos/mapa.json: la costa de Europa como un path SVG.

Proyección equirectangular centrada en 46° N (x = lon·cos 46°, y = −lat), recortada a la ventana del
viaje (de Finisterre al mar Negro). También proyecta los lugares de la novela al mismo sistema.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "datos-crudos" / "mapa" / "land.geojson"
SALIDA = RAIZ / "src" / "datos" / "mapa.json"
LON0, LON1, LAT0, LAT1 = -11.0, 31.5, 34.5, 57.5
K = math.cos(math.radians(46))
ANCHO = 1000.0
ESC = ANCHO / ((LON1 - LON0) * K)
ALTO = (LAT1 - LAT0) * ESC

LUGARES = {
    "munich": (11.58, 48.14), "viena": (16.37, 48.21), "budapest": (19.04, 47.50), "klausenburg": (23.60, 46.77),
    "bistritz": (24.50, 47.13), "borgo": (25.05, 47.27), "castillo": (25.35, 47.37),
    "varna": (27.91, 43.21), "bosforo": (29.05, 41.15), "dardanelos": (26.40, 40.15), "matapan": (22.48, 36.38),
    "gibraltar": (-5.60, 35.95), "finisterre": (-9.6, 42.9), "ouessant": (-5.4, 48.5), "dover": (1.45, 51.0),
    "whitby": (-0.61, 54.49), "londres": (-0.13, 51.51), "exeter": (-3.53, 50.72), "paris": (2.35, 48.86),
    "galatz": (28.05, 45.43), "veresti": (26.2, 47.1),
}


def proy(lon: float, lat: float) -> tuple[float, float]:
    return ((lon - LON0) * K * ESC, (LAT1 - lat) * ESC)


def anillo(coords: list) -> str | None:
    pts = [proy(lon, lat) for lon, lat in coords]
    if all(x < -40 or x > ANCHO + 40 or y < -40 or y > ALTO + 40 for x, y in pts):
        return None
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    if (max(xs) - min(xs)) * (max(ys) - min(ys)) < 9:  # islotes de menos de 3×3 px fuera
        return None
    out = []
    ultimo = None
    for x, y in pts:
        q = (round(min(max(x, -60), ANCHO + 60), 1), round(min(max(y, -60), ALTO + 60), 1))
        if ultimo and abs(q[0] - ultimo[0]) + abs(q[1] - ultimo[1]) < 1.2:
            continue
        out.append(q); ultimo = q
    if len(out) < 3:
        return None
    return "M" + "L".join(f"{x:g} {y:g}" for x, y in out) + "Z"


def main() -> None:
    gj = json.loads(FUENTE.read_text())
    partes = []
    for f in gj["features"]:
        g = f["geometry"]
        polis = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poli in polis:
            for r in poli[:1]:  # solo el contorno exterior
                p = anillo(r)
                if p:
                    partes.append(p)
    d = "".join(partes)
    lugares = {k: [round(c, 1) for c in proy(*v)] for k, v in LUGARES.items()}
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps({"ancho": ANCHO, "alto": round(ALTO, 1), "tierra": d, "lugares": lugares}))
    print(len(partes), "polígonos;", len(d) // 1024, "KB;", round(ALTO))


if __name__ == "__main__":
    main()
