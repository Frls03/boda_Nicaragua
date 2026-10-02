import { useLayoutEffect } from 'react';

// Escribe con tinta el bloque de nombres y fecha cuando entra en pantalla.
// En celular ya esta a la vista al abrir el sobre: espera a que la foto termine
// de salir del arco (--inv-start) para respetar el orden de la secuencia.
// En escritorio queda bajo la foto y corre cuando el invitado baja.
const ESPERA_APERTURA = 1000; // ms desde que se abre el sobre

export default function useInkOnView(ref, openedAt) {
  // layout effect: oculta el bloque antes del primer pintado (sin parpadeo)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || openedAt == null || !('IntersectionObserver' in window)) return;

    el.classList.add('inv-text-ready');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const pasado = performance.now() - openedAt;
        el.style.setProperty('--inv-start', `${Math.max(0, ESPERA_APERTURA - pasado)}ms`);
        el.classList.add('inv-text-play');
        io.disconnect();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, openedAt]);
}
