import React from 'react'

export function formatContent(content: string | undefined | null): string {
    if (!content) return ''
    // Replace literal "\n" (backslash + n) with actual newline character
    // Also ensures standard newlines are preserved
    return content.replace(/\\n/g, '\n')
}

/**
 * Renders text with actual line breaks as <br /> elements.
 * Use this in JSX instead of formatContent() for proper rendering.
 */
export function formatContentJSX(content: string | undefined | null): React.ReactNode {
    if (!content) return null
    const text = content.replace(/\\n/g, '\n')
    const lines = text.split('\n')
    return lines.map((line, i) => (
        i < lines.length - 1
            ? React.createElement(React.Fragment, { key: i }, line, React.createElement('br'))
            : React.createElement(React.Fragment, { key: i }, line)
    ))
}
