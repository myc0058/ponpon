import { decompressData } from './src/lib/compression';

const encoded = 'H4sIAH2XfWkAA6tWyi9LLcpJrPTMTQ9ILMlQslLKztcvLcjJT0wp1ofK6RsZGJnpGxjqGxvqG5qbWVoYW5iYGZgYmeoV5KUr1QIAEi8EWUQAAAA=';
const decoded = decompressData(encoded);
console.log(JSON.stringify(decoded, null, 2));
