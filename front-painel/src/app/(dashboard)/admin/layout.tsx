import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAuthSession } from "@/lib/auth-server";

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await getCurrentAuthSession();

    if (session === null) {
        redirect("/login");
    }

    if (session.tipo !== "ADMIN") {
        redirect("/dashboard?accessDenied=1");
    }

    return <div className="space-y-6">{children}</div>;
}
