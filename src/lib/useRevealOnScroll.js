import { useEffect } from 'react';

// Aparicion suave de los bloques [data-reveal] al llegar con el scroll
// (ver .reveal-ready en index.css). La clase que oculta la pone JS: sin JS
// todo se ve. data-reveal="2" escalona dentro de un grupo (--reveal-i).
export default function useRevealOnScroll(rootRef, enabled) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || !('IntersectionObserver' in window)) return;

    const els = [...root.querySelectorAll('[data-reveal]')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          el.classList.add('is-revealed');
          io.unobserve(el);
          // al terminar, devolver el elemento a sus estilos normales (hover, etc.)
          const fin = 1800 + Number(el.dataset.reveal || 0) * 140;
          setTimeout(() => el.classList.remove('reveal-ready', 'is-revealed'), fin);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    for (const el of els) {
      // lo que ya esta a la vista al abrir no se oculta (evita parpadeo)
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.94) continue;
      el.style.setProperty('--reveal-i', el.dataset.reveal || '0');
      el.classList.add('reveal-ready');
      io.observe(el);
    }
    return () => io.disconnect();
  }, [rootRef, enabled]);
}
