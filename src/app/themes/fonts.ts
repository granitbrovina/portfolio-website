import { Archivo, Atkinson_Hyperlegible, Familjen_Grotesk, Figtree, JetBrains_Mono, Noto_Sans, Outfit, Schibsted_Grotesk } from "next/font/google";

// Theme-only faces. preload:false so a theme that isn't active costs nothing up front.
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--f-archivo", display: "swap", preload: false });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-jbmono", display: "swap", preload: false });
export const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--f-schibsted", display: "swap", preload: false });
export const familjen = Familjen_Grotesk({ subsets: ["latin"], variable: "--f-familjen", display: "swap", preload: false });
export const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-atkinson", display: "swap", preload: false });
export const outfit = Outfit({ subsets: ["latin"], variable: "--f-outfit", display: "swap", preload: false });
export const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--f-noto", display: "swap", preload: false });
export const figtree = Figtree({ subsets: ["latin"], variable: "--f-figtree", display: "swap", preload: false });
