export default function SandboxLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">🧪 Sandbox Environment</h1>
                <p className="text-gray-600">
                    Isolated environment for component testing and development.
                </p>
            </header>
            <main className="mx-auto max-w-7xl">{children}</main>
        </div>
    )
}
