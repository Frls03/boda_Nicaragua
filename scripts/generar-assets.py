"""
Regenera los assets derivados de public/ a partir de los originales.

    pip install pillow numpy
    python scripts/generar-assets.py

Los originales del cliente (fondo1.jpeg, Sello.png, Fondo_floreado.png,
marco1.png, abajomarco.png) no se tocan. Todo lo demas se reconstruye.
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

PUB = Path(__file__).resolve().parent.parent / "public"


def tile_espejado(src: Image.Image, lado: int) -> Image.Image:
    """Tile 2x2 espejado: bordes opuestos identicos -> costura nula."""
    W, H = src.size
    corte = min(W, H)
    sq = src.crop(((W - corte) // 2, (H - corte) // 2,
                   (W - corte) // 2 + corte, (H - corte) // 2 + corte))
    sq = sq.resize((lado, lado), Image.LANCZOS)
    t = Image.new("RGB", (lado * 2, lado * 2))
    t.paste(sq, (0, 0))
    t.paste(ImageOps.mirror(sq), (lado, 0))
    t.paste(ImageOps.flip(sq), (0, lado))
    t.paste(ImageOps.mirror(ImageOps.flip(sq)), (lado, lado))
    return t


def costura(im: Image.Image) -> tuple[float, float]:
    """Diferencia media entre bordes opuestos. 0.0 = repite sin costura."""
    a = np.asarray(im.convert("RGB")).astype(int)
    return (abs(a[:, 0] - a[:, -1]).mean(), abs(a[0] - a[-1]).mean())


def quitar_fondo(im: Image.Image, es_fondo) -> Image.Image:
    """
    Flood fill desde los bordes. Solo borra el fondo conectado al exterior,
    asi el sello (rodeado de papel, del mismo color que el fondo) sobrevive.
    """
    arr = np.array(im.convert("RGBA")).astype(int)
    H, W = arr.shape[:2]
    cand = es_fondo(arr[:, :, 0], arr[:, :, 1], arr[:, :, 2])

    fuera = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if cand[y, x] and not fuera[y, x]:
                fuera[y, x] = True
                q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if cand[y, x] and not fuera[y, x]:
                fuera[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and cand[ny, nx] and not fuera[ny, nx]:
                fuera[ny, nx] = True
                q.append((ny, nx))

    arr[:, :, 3] = np.where(fuera, 0, 255)
    out = Image.fromarray(arr.astype("uint8"))
    return out.crop(out.getbbox())


def tenir(src: Image.Image, sombra, luz) -> Image.Image:
    """Mapea luminancia a una rampa de color, conservando el relieve."""
    r, g, b, a = src.convert("RGBA").split()
    lum = ImageEnhance.Contrast(Image.merge("RGB", (r, g, b)).convert("L")).enhance(1.2)
    lut = []
    for ch in range(3):
        lut += [int(sombra[ch] + (luz[ch] - sombra[ch]) * (i / 255)) for i in range(256)]
    out = lum.convert("RGB").point(lut)
    out.putalpha(a)
    return out


def main() -> None:
    # --- fondos de papel (espejo 2x2, costura 0) ---
    for origen, destino, lado in [("fondo1.jpeg", "fondo1-seamless.jpg", 512),
                                  ("papel.jpeg", "papel-seamless.png", 225)]:
        src = PUB / origen
        if not src.exists():
            print(f"  falta {origen}, salteado")
            continue
        t = tile_espejado(Image.open(src).convert("RGB"), lado)
        if destino.endswith(".jpg"):
            t.save(PUB / destino, quality=88, optimize=True)
        else:
            t.save(PUB / destino)
        h, v = costura(t)
        assert h == 0 and v == 0, f"{destino}: costura {h}/{v}, deberia ser 0"
        print(f"  {destino}  {t.size}  costura {h}/{v}")

    # --- floral: recorta la marca de agua "TOY" del pie ---
    fl = Image.open(PUB / "Fondo_floreado.png").convert("RGB")
    fl = fl.crop((0, 0, fl.size[0], int(fl.size[1] * 0.94)))
    a = np.asarray(fl).astype(int)
    lum = (a[:, :, 0] * 299 + a[:, :, 1] * 587 + a[:, :, 2] * 114) // 1000
    t = lum / 255  # 0 = trazo, 1 = papel

    sepia = np.dstack([np.full_like(lum, 122), np.full_like(lum, 96),
                       np.full_like(lum, 74), (215 * (1 - t)).astype(int)])
    Image.fromarray(sepia.astype("uint8")).save(PUB / "floral-sepia.png")
    print("  floral-sepia.png")

    crema = np.dstack([221 + (242 - 221) * t, 212 + (236 - 212) * t, 191 + (221 - 191) * t])
    Image.fromarray(crema.astype("uint8")).save(PUB / "floral-cream.png")
    print("  floral-cream.png")

    # --- sellos ---
    sello = Image.open(PUB / "Sello.png").convert("RGBA")
    tenir(sello, (14, 26, 52), (108, 132, 178)).save(PUB / "sello-navy.png")
    tenir(sello, (58, 8, 14), (176, 60, 70)).save(PUB / "sello-verso.png")
    print("  sello-navy.png / sello-verso.png")

    # --- papel del versiculo + flores ---
    # Limites geometricos, NO por color: la zona sombreada del papel cae dentro
    # del rango del granate y una mascara por color se come el tercio inferior.
    papel = Image.open(PUB / "marco1.png").convert("RGB").crop((48, 196, 396, 626))
    papel = quitar_fondo(papel, lambda r, g, b:
                         (r < 150) & (g < 95) & (b < 95) & (r >= g + 15) & (r >= b + 15))
    alpha = np.array(papel)[:, :, 3]
    assert ((alpha > 60).sum(1) > 0).all(), "el papel quedo con filas huecas"
    # recorta arriba hasta donde la hoja tiene su ancho completo
    ancho = np.where((alpha > 60).sum(1) > alpha.shape[1] * 0.96)[0].min()
    papel = papel.crop((0, ancho, papel.size[0], papel.size[1]))
    # el pixel mas externo arrastra granate del fondo: se ve como una linea
    # oscura en los costados. Erosionar 1px el alfa la elimina.
    r, g, b, a = papel.split()
    papel = Image.merge("RGBA", (r, g, b, a.filter(ImageFilter.MinFilter(3))))

    flores = quitar_fondo(Image.open(PUB / "abajomarco.png"), lambda r, g, b:
                          (abs(r - 229) < 26) & (abs(g - 229) < 26) & (abs(b - 222) < 28))
    # completas, con los tallos que suben por los costados
    W, fh = flores.size

    # El papel va al ancho de las flores: recortado a su borde tipico (las
    # irregularidades del rasgado sobresalen apenas unos px) y escalado.
    pa = np.array(papel)[:, :, 3] > 60
    medio = pa[: int(pa.shape[0] * 0.8)]  # costados, sin el borde inferior
    izq = int(np.median([np.argmax(f) for f in medio]))
    der = int(np.median([len(f) - 1 - np.argmax(f[::-1]) for f in medio]))
    papel = papel.crop((izq, 0, der + 1, papel.size[1]))
    PH = int(papel.size[1] * W / papel.size[0])
    papel = papel.resize((W, PH), Image.LANCZOS)

    # esquinas superiores redondeadas (las inferiores quedan tras las flores)
    radio = int(W * 0.06)
    esquinas = Image.new("L", (W, PH), 0)
    ImageDraw.Draw(esquinas).rounded_rectangle((0, 0, W - 1, PH + radio), radius=radio, fill=255)
    papel.putalpha(ImageChops.multiply(papel.getchannel("A"), esquinas))

    # el borde rasgado inferior del papel queda a la altura de los lirios,
    # los tallos suben por los costados del texto
    top = PH - int(fh * 0.6)
    lienzo = Image.new("RGBA", (W, max(PH, top + fh)), (0, 0, 0, 0))
    lienzo.alpha_composite(papel, (0, 0))
    lienzo.alpha_composite(flores, (0, top))
    lienzo.save(PUB / "verso-completo.png")
    print(f"  verso-completo.png  {lienzo.size}")

    # --- fotos: versiones web de los originales del cliente (2400x3600, 0.5-2 MB) ---
    # ancho = 2x el maximo en pantalla (hero 600px, celda del collage ~460px)
    destino = PUB / "fotos"
    destino.mkdir(exist_ok=True)
    fotos = [("Portada.jpg", 1200)] + [(f"collage{i}.jpg", 1000) for i in range(1, 6)] + [("Collage6.jpg", 1000)]
    for origen, ancho in fotos:
        im = ImageOps.exif_transpose(Image.open(PUB / origen)).convert("RGB")
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        salida = destino / origen.lower()
        im.save(salida, quality=82, optimize=True, progressive=True)
        print(f"  fotos/{salida.name}  {im.size}  {salida.stat().st_size // 1024} KB")


if __name__ == "__main__":
    print("Regenerando assets en public/ ...")
    main()
    print("Listo.")
