// Mosaico 2 columnas: foto alta a la izquierda, pares apilados a la derecha.
const photos = [
  { src: '/collage1.png', alt: 'Manos entrelazadas', span: '' },
  { src: '/collage2.png', alt: 'Serenata', span: '' },
  { src: '/foto1.png', alt: 'Jonathan y Jasmin', span: 'row-span-2' },
  { src: '/collage1.png', alt: 'Jasmin', span: '' },
  { src: '/collage2.png', alt: 'La propuesta', span: '' },
];

export default function Gallery() {
  return (
    <section className="grid grid-cols-2 auto-rows-[26vw] gap-2 sm:auto-rows-[170px] sm:gap-3 lg:auto-rows-[270px] lg:gap-4 xl:auto-rows-[310px]">
      {photos.map((photo, i) => (
        <img
          key={`${photo.src}-${i}`}
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={`h-full w-full select-none rounded-[2px] object-cover grayscale shadow-[0_6px_16px_-8px_rgba(60,40,30,.5)] transition-[filter,transform] duration-500 hover:scale-[1.015] hover:grayscale-0 ${photo.span}`}
        />
      ))}
    </section>
  );
}
