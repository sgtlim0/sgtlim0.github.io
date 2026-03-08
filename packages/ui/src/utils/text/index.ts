/**
 * Text processing utilities barrel export
 */

export { EN_STOPWORDS, KO_STOPWORDS } from './stopwords'

export { detectLanguage, encode, getCompressionStats } from './tokenEntropyEncoder'

export type { EncoderOptions, CompressionResult, CompressionStats } from './tokenEntropyEncoder'
