"use client";

import { useUIStore } from "@/store/uiStore";
import { useEffect } from "react";


export function ThemeProvider({children}: {children: React.ReactNode}){
    const isDarkMode=useUIStore((s) => s.isDarkMode);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    return <>{children}</>;
}