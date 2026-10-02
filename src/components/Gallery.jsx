// Mosaico sin recortes: todas las fotos son 2:3 y cada celda tambien.
//
//   [ 2 grande ] [ 1 ]      [ 4 ] [ 3 grande ]
//   [          ] [ 5 ]      [ 6 ] [          ]
//
// Para que la grande mida lo mismo que las dos apiladas (con el gap entre
// ellas), la columna chica es (100% - g - g/1.5) / 3 y la grande el resto.
// Con gap 8/12/16px eso da 13.333/20/26.667px.
const COLS = {
  left: 'grid-cols-[1fr_calc((100%-13.333px)/3)] sm:grid-cols-[1fr_calc((100%-20px)/3)] lg:grid-cols-[1fr_calc((100%-26.667px)/3)]',
  right: 'grid-cols-[calc((100%-13.333px)/3)_1fr] sm:grid-cols-[calc((100%-20px)/3)_1fr] lg:grid-cols-[calc((100%-26.667px)/3)_1fr]',
};

// Orden = auto-placement. En el bloque derecho la grande va segunda para que
// ocupe la columna 2 en ambas filas.
const blocks = [
  {
    cols: COLS.left,
    photos: [
      { src: '/fotos/collage2.jpg', alt: 'Jonathan y Jasmin abrazados', big: true },
      { src: '/fotos/collage1.jpg', alt: 'El anillo de compromiso' },
      { src: '/fotos/collage5.jpg', alt: 'Un beso bajo los árboles' },
    ],
  },
  {
    cols: COLS.right,
    photos: [
      { src: '/fotos/collage4.jpg', alt: 'Jasmin abrazando a Jonathan' },
      { src: '/fotos/collage3.jpg', alt: 'Jonathan y Jasmin entre flores, con el volcán al fondo', big: true },
      { src: '/fotos/collage6.jpg', alt: 'Jonathan y Jasmin en el campo de lavanda' },
    ],
  },
];

export default function Gallery() {
  return (
    <section className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
      {blocks.map((block, i) => (
        <div key={i} className={`grid gap-2 sm:gap-3 lg:gap-4 ${block.cols}`}>
          {block.photos.map((photo, j) => (
            <img
              key={photo.src}
              data-reveal={j}
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className={`aspect-[2/3] h-full w-full select-none rounded-[2px] object-cover shadow-[0_6px_16px_-8px_rgba(60,40,30,.5)] transition-transform duration-500 hover:scale-[1.015] ${photo.big ? 'row-span-2' : ''}`}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
