import { LavaLamp } from "@/components/ui/fluid-blob";

export default function DemoOne() {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center relative">
     <LavaLamp/>
    <h1 className="text-display text-6xl md:text-8xl font-bold tracking-tight mix-blend-exclusion text-white whitespace-nowrap">
      Morphic Dreams
    </h1>
    <p className="text-subheading text-lg md:text-xl text-center text-white mix-blend-exclusion max-w-2xl leading-relaxed mt-4">
      Where thoughts take shape and consciousness flows like liquid mercury through infinite dimensions.
    </p>
    <p className="text-caption text-sm text-white/70 mix-blend-exclusion mt-8 font-jetbrains tracking-wider">
      FLUID DYNAMICS • DIGITAL ART • CREATIVE CODING
    </p>
    </div>
  );
} 