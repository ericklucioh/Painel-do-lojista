import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToasterProvider } from "@/components/providers/toaster";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Painel do Lojista",
    description:
        "Painel administrativo para controle de usuários, produtos, estoque e vendas.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pt-BR"
            className={cn("h-full antialiased", "font-sans", geist.variable)}
        >
            <body className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,1)_42%,_rgba(226,232,240,1)_100%)] text-slate-950">
                <ToasterProvider>{children}</ToasterProvider>
            </body>
        </html>
    );
}
