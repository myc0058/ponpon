export function formatContent(content: string | undefined | null): string {
    if (!content) return ''
    // Replace literal "\n" (backslash + n) with actual newline character
    // Also ensures standard newlines are preserved
    return content.replace(/\\n/g, '\n')
}
