#!/usr/bin/env python3
"""Regenera data/aseos.json desde el mapa de Google My Maps.

My Maps sigue siendo donde se editan los puntos. Tras añadir o corregir
alguno, ejecuta:  python3 scripts/actualizar-aseos.py
Con un argumento usa un KML local en lugar de descargarlo.
"""
import json
import pathlib
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

KML_URL = "https://www.google.com/maps/d/kml?mid=1YRT_X5tf7YNgvNL7ubI6jaO1EoAFxlM&forcekml=1"
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "aseos.json"
NS = {"k": "http://www.opengis.net/kml/2.2"}

GENERIC_NAME = re.compile(
    r"^(wc|aseos?|ba[nñ]os?|lavabos?|servicios?|bathrooms?|restrooms?|toilets?|"
    r"female|male|public[oa]?s?|públic[oa]?s?|komunak|\||\s|-)+$", re.I)
GENERIC_NOTE = re.compile(r"^(wc public|aseo públic[oa]|)$", re.I)
AUTOCLEAN = re.compile(r"autolimpi", re.I)
OUT_OF_SERVICE = re.compile(r"\*?\s*temporalment fora de servei", re.I)


def clean_name(name):
    name = re.sub(r"\s+", " ", name).strip()
    name = OUT_OF_SERVICE.sub("", name).strip()
    if name.isupper():
        name = name.title()
    if not name or GENERIC_NAME.match(name):
        return "Aseo público"
    if AUTOCLEAN.search(name):
        return "Aseo autolimpiable"
    return name[:70]


def clean_note(note):
    """Devuelve (nota, etiqueta). La etiqueta solo sale de lo que dice el dato."""
    note = re.sub(r"\s+", " ", note).strip()
    if GENERIC_NOTE.match(note):
        return "", ""
    if "Gratuitos Zaragoza" in note:
        return "", "Gratis"
    if note.lower() == "de pago":
        return "", "De pago"
    if note.isupper():
        note = note.capitalize()
    return note[:140], ""


def main():
    if len(sys.argv) > 1:
        raw = pathlib.Path(sys.argv[1]).read_bytes()
    else:
        with urllib.request.urlopen(KML_URL, timeout=60) as resp:
            raw = resp.read()
    seen, rows = {}, []
    for mark in ET.fromstring(raw).findall(".//k:Placemark", NS):
        coords = mark.findtext(".//k:coordinates", default="", namespaces=NS).strip()
        if not coords:
            continue
        lng, lat = (float(v) for v in coords.split(",")[:2])
        note = ""
        for data in mark.findall(".//k:Data", NS):
            if data.get("name") == "descripción":
                note = data.findtext("k:value", default="", namespaces=NS) or ""
        raw_name = mark.findtext("k:name", default="", namespaces=NS) or ""
        row = [round(lat, 5), round(lng, 5), clean_name(raw_name), *clean_note(note)]
        if OUT_OF_SERVICE.search(raw_name):
            row[3] = "Marcado como temporalmente fuera de servicio"
        key = (round(lat, 4), round(lng, 4))  # une "Female/Male Bathroom" del mismo sitio
        if key in seen:
            prev = seen[key]
            if prev[2] == "Aseo público" and row[2] != "Aseo público":
                prev[2] = row[2]
            prev[3] = prev[3] or row[3]
            prev[4] = prev[4] or row[4]
            continue
        seen[key] = row
        rows.append(row)
    if len(rows) < 100:
        sys.exit(f"Solo {len(rows)} puntos: algo ha ido mal, no se sobrescribe nada.")
    OUT.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(rows)} puntos guardados en {OUT}")


if __name__ == "__main__":
    main()
