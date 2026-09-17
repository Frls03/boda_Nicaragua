export default function Hero() {
  return (
    <section className="relative flex w-full justify-center pt-16 sm:pt-20 lg:pt-28">
      <div className="relative w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[520px] xl:max-w-[600px]">
        <div className="overflow-hidden rounded-t-full shadow-[0_14px_34px_-14px_rgba(60,40,30,.55)]">
          <img
            src="/foto1.png"
            alt="Jonathan y Jasmin"
            className="aspect-[3/3.6] w-full select-none object-cover grayscale"
          />
        </div>

        {/* Escudo J&J montado sobre el arco */}
        <div className="absolute left-1/2 top-0 flex h-[78px] w-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-b-[31px] rounded-t-[6px] bg-maroon shadow-[0_6px_14px_-4px_rgba(0,0,0,.45)] lg:h-[124px] lg:w-[98px] lg:rounded-b-[49px] lg:rounded-t-[8px]">
          <span className="font-script leading-none text-cream text-[clamp(26px,2.6vw,44px)]">
            J<span className="text-[.7em]">&amp;</span>J
          </span>
        </div>
      </div>
    </section>
  );
}
