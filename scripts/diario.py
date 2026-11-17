"""Drácula (Gutenberg 345) → src/datos/diario.json: cada documento fechado, con autor, tipo y palabras.

La novela es una colección de diarios, cartas, telegramas y recortes. Se recorre el texto línea a línea:
las cabeceras («_Dr. Seward's Diary._», «_Letter, Lucy Westenra to Mina Murray_.»…) fijan autor y tipo,
y cada línea que empieza por una fecha («_3 May. Bistritz._--») abre una entrada nueva.
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TEXTO = RAIZ / "datos-crudos" / "textos" / "345.txt"
SALIDA = RAIZ / "src" / "datos" / "diario.json"

MESES = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August",
                                     "September", "October", "November", "December"], 1)}
PERSONAS = [
    ("vanhelsing", r"spoken by Van Helsing"),
    ("jonathan", r"Jonathan Harker|^_?Harker"),
    ("mina", r"(?<![A-Za-z])Mina(?![a-z])|Wilhelmina|Mrs\. Harker"),
    ("seward", r"Seward"),
    ("lucy", r"Lucy"),
    ("vanhelsing", r"Van Helsing"),
    ("arthur", r"Arthur|Godalming|Holmwood"),
    ("quincey", r"Quincey"),
]
FECHA = re.compile(r"^“?_?(\d{1,2})(?:st|nd|rd|th)? (" + "|".join(MESES) + r")\b")
FECHA2 = re.compile(r"^“?_?(?:Telegram, )?(" + "|".join(MESES) + r") (\d{1,2})")


def persona(cabecera: str) -> str:
    # En una carta «Letter, A to B» el autor es A.
    m = re.match(r"_?“?(?:Letter|Telegram)(?: \(by hand\))?,? (?:from )?(.*?) to ", cabecera)
    quien = m.group(1) if m else cabecera
    for k, rx in PERSONAS:
        if re.search(rx, quien, re.I):
            return k
    return "otros"


def tipo(cabecera: str) -> str:
    c = cabecera.lower()
    for k in ("telegram", "letter", "memorandum", "phonograph", "diary", "journal", "log", "gazette", "cutting", "dailygraph", "interview"):
        if k in c:
            return {"gazette": "prensa", "cutting": "prensa", "dailygraph": "prensa", "interview": "prensa",
                    "telegram": "telegrama", "letter": "carta", "memorandum": "nota", "phonograph": "fonógrafo",
                    "diary": "diario", "journal": "diario", "log": "cuaderno de bitácora"}[k]
    return "diario"


def main() -> None:
    lineas = TEXTO.read_text(encoding="utf-8").split("\n")
    ini = next(i for i, l in enumerate(lineas) if l.strip() == "CHAPTER I" and i > 80)
    fin = next(i for i, l in enumerate(lineas) if "END OF THE PROJECT GUTENBERG" in l)
    lineas = lineas[ini:fin]
    autor, clase = "jonathan", "diario"
    entradas: list[dict] = []
    actual: dict | None = None
    capitulo = 0
    for l in lineas:
        s = l.strip()
        if re.match(r"^CHAPTER [IVXL]+$", s):
            capitulo += 1
            continue
        es_cabecera = (s and s == s.upper() and re.search("[A-Z]{4}", s) and ("JOURNAL" in s or "DIARY" in s or "LOG OF" in s or "CUTTING" in s)) \
            or re.match(r"^_(?:Letter|Telegram|Dr\.|Mina|Jonathan|Lucy|Memorandum|Mina|“The|Interview|Dr\. Van)[^_]*_\.?$", s)
        if es_cabecera and not FECHA.match(s):
            autor, clase = persona(s), tipo(s)
            if "LOG OF" in s:
                autor = "demeter"
            if clase == "prensa":
                autor = "prensa"
            continue
        m = FECHA.match(s)
        d = (int(m.group(1)), MESES[m.group(2)]) if m else None
        if not d:
            m2 = FECHA2.match(s)
            if m2 and s.startswith(("_", "“_")):
                d = (int(m2.group(2)), MESES[m2.group(1)])
        if d and s.startswith(("_", "“_")):
            lugar = re.match(r"^“?_\d[^.]*\.\s*([^_]*?)\.?_", s)
            actual = {"dia": d[0], "mes": d[1], "autor": autor, "tipo": clase, "capitulo": capitulo,
                      "lugar": (lugar.group(1).strip() if lugar else ""), "palabras": 0,
                      "inicio": re.sub(r"^.*?_\.?(?:--|—)\s*", "", s)[:140] if re.search(r"_\.?(?:--|—)", s) else ""}
            entradas.append(actual)
        elif actual is not None and len(actual["inicio"]) < 12 and s and not s.startswith("_"):
            actual["inicio"] = s.strip("“”\"")[:140]
        if actual is not None:
            actual["palabras"] += len(re.findall(r"[A-Za-z’']+", s))
    # El libro empieza el 3 de mayo y acaba el 6 de noviembre; las fechas fuera de ese rango son citas.
    entradas = [e for e in entradas if (5, 3) <= (e["mes"], e["dia"]) <= (11, 6)]
    por_autor = Counter()
    for e in entradas:
        por_autor[e["autor"]] += e["palabras"]
    total = sum(len(re.findall(r"[A-Za-z’']+", l)) for l in lineas)
    texto = "\n".join(lineas)
    cuentas = {k: len(re.findall(rx, texto)) for k, rx in {
        "blood": r"\bblood\b", "night": r"\bnight\b", "fangs": r"\bfangs?\b", "cape": r"\bcape\b|\bcloak\b",
        "vampire": r"\b[Vv]ampires?\b", "garlic": r"\bgarlic\b", "wolf": r"\bwol(?:f|ves)\b", "crucifix": r"\bcrucifix\b",
        "sunlight": r"\bsunlight\b|\bsun\b", "typewriter": r"\btype-?writ", "phonograph": r"\bphonograph\b",
        "count": r"\bthe Count\b", "dracula": r"\bDracula\b"}.items()}
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps({"palabras": total, "entradas": entradas, "porAutor": dict(por_autor), "cuentas": cuentas},
                                 ensure_ascii=False, indent=1))
    print(len(entradas), "entradas;", total, "palabras")
    print(Counter(e["autor"] for e in entradas))
    print(Counter(e["tipo"] for e in entradas))
    print(dict(por_autor))
    print(cuentas)


if __name__ == "__main__":
    main()
