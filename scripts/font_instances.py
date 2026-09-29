"""Generate static TTF weights from the licensed Noto variable fonts.

Maintenance command: python scripts/font_instances.py sans|serif
Requires fonttools in the local Python environment.
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


def main(family: str) -> None:
    if family not in {"sans", "serif"}:
        raise SystemExit("family must be sans or serif")
    root = Path(__file__).resolve().parent.parent
    directory = root / "public" / "fonts"
    sources = root / "scripts" / "source-fonts"
    stem = "NotoSansSC" if family == "sans" else "NotoSerifSC"
    for weight in (300, 400, 600, 800):
        font = instantiateVariableFont(
            TTFont(sources / f"{stem}.ttf"),
            {"wght": weight},
            inplace=False,
            updateFontNames=True,
        )
        destination = directory / f"{stem}-{weight}.ttf"
        font.save(destination)
        print(destination.name, flush=True)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "")
