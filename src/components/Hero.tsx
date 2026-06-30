import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative my-6 overflow-hidden rounded-2xl bg-light-200">
      {/* Background: subtle on mobile for readability, full on desktop */}
      <Image
        src="/hero-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-15 md:opacity-100"
      />

      <div className="relative z-10 flex flex-col gap-6 px-6 py-10 md:min-h-[560px] md:flex-row md:items-center md:gap-0 md:px-12 md:py-0">
        {/* Copy */}
        <div className="flex w-full flex-col gap-5 md:max-w-xl">
          <h1 className="text-[32px] font-bold leading-[1.1] text-dark-900 sm:text-[40px] md:text-[64px]">
            Style that
            <br />
            Moves with You
          </h1>
          <p className="max-w-md text-body text-dark-700">
            Nike is a global leader in sport, fashion and culture. Find your style today.
          </p>
          <Link
            href="/products"
            className="flex w-fit items-center gap-2 rounded-full bg-orange px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
          >
            <ShoppingBag className="h-5 w-5" />
            Show Now
          </Link>
        </div>

        {/* Shoe artwork (includes AIR / JORDEN lettering) */}
        <div className="relative h-[240px] w-full sm:h-[300px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[58%]">
          <Image
            src="/hero-shoe.png"
            alt="Nike Air featured shoe"
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-contain md:object-right"
          />
        </div>
      </div>
    </section>
  );
}
