

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden selection:bg-blue-500/30">

            <main className="container px-4 h-full">
                {children}
            </main>
        </div>
    );
}
