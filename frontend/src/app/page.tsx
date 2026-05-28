"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { fetchChocolates } from "@/lib/api";
import { ChocolateCard } from "@/components/ChocolateCard";
import { buttonVariants, Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["chocolates", "all"],
    queryFn: () => fetchChocolates(),
  });
  const featured = data?.slice(0, 4) ?? [];

  return (
    <div>
      <section className="relative mb-12 overflow-hidden border-4 border-black bg-[radial-gradient(circle,var(--comic-dot)_1.5px,transparent_1.6px)] bg-[length:10px_10px] bg-amber-200 p-8 shadow-[8px_8px_0_0_#000] [--comic-dot:rgba(0,0,0,0.14)] dark:border-black dark:bg-amber-200 dark:[--comic-dot:rgba(0,0,0,0.18)] sm:p-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_12px,rgba(0,0,0,0.06)_12px,rgba(0,0,0,0.06)_14px)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 top-0 size-24 rotate-12 border-4 border-black bg-yellow-400 shadow-[4px_4px_0_0_#000] sm:size-28"
          aria-hidden
        />
        <div className="relative">
          <p className="inline-flex max-w-full items-center border-4 border-black bg-white px-3 py-1.5 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000]">
            New spring collection
          </p>
          <h1 className="mt-6 max-w-3xl font-heading text-3xl font-black uppercase leading-[1.05] tracking-tight text-black [text-shadow:3px_3px_0_#fde047] sm:text-4xl md:text-5xl">
            Single-origin chocolate, delivered to your door
          </h1>
          <p className="mt-5 max-w-2xl border-4 border-black bg-white p-4 text-base font-semibold leading-snug text-black shadow-[4px_4px_0_0_#000]">
            Small-batch bars and truffles from growers in Peru, Madagascar, and Ecuador.
            Ethically sourced, freshly made, and shipped within 48 hours of leaving the kitchen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className={`${buttonVariants({ variant: "outline", size: "lg" })} min-h-10 rounded-none border-4 border-black bg-red-500 px-6 font-black uppercase tracking-wide text-white shadow-[5px_5px_0_0_#000] transition-[transform,box-shadow] hover:bg-red-500 hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none`}
            >
              Shop <ArrowRight className="ml-1 size-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">Featured</h2>
          <p className="mt-1 text-sm text-muted-foreground">Staff picks from this week&apos;s kitchen</p>
        </div>
        <Link
          className={buttonVariants({ variant: "link", className: "h-auto p-0" })}
          href="/shop"
        >
          See all
        </Link>
      </div>
      {isError ? (
        <p className="text-sm text-destructive">
          {(error as Error).message}{" "}
          <Button variant="link" onClick={() => void refetch()}>
            Retry
          </Button>
        </p>
      ) : isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (
            <ChocolateCard key={c.id} chocolate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
