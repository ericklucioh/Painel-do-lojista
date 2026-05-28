import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center">
                <div className="w-full">{children}</div>
            </div>
        </main>
    );
}
