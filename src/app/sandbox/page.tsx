import Link from 'next/link'

export default function SandboxPage() {
    const components = [
        {
            name: 'Quiz Card',
            path: '/sandbox/quiz-card',
            description: 'Main quiz question display component',
        },
        {
            name: 'Hero Carousel',
            path: '/sandbox/hero-carousel',
            description: 'Homepage featured quiz carousel',
        },
        // Add more components here as we create sandbox pages for them
    ]

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {components.map((component) => (
                <Link
                    key={component.path}
                    href={component.path}
                    className="group block rounded-lg border bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
                >
                    <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                        {component.name}
                    </h2>
                    <p className="text-gray-600">{component.description}</p>
                </Link>
            ))}

            {/* Placeholder for adding new components */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 flex items-center justify-center text-gray-400">
                <p>Add new components to src/app/sandbox/page.tsx</p>
            </div>
        </div>
    )
}
