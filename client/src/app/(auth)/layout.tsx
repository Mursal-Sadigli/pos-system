import {ReactNode} from "react";

export default function AuthLayout({children}: {children: React.ReactNode}){
    return(
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <div className="w-full max-w-md px-4">
                <div className="bg-card rounded-2xl shadow-xl border p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary">POS Sistemi</h1>
                        <p className="text-muted-foreground mt-2">Satış nöqtəsinin idarə edilməsi</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}