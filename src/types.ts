/**
 * Regular expression to detect both `\r\n` and `\n` line endings
 */
export const PATTERN_LINE_SEPARATOR = /\r?\n/

/**
 * Enum of all supported transcript formats
 */
export enum TranscriptFormat {
    /**
     * Data is HTML
     */
    HTML = "html",
    /**
     * Data is JSON
     */
    JSON = "json",
    /**
     * Data is {@link https://en.wikipedia.org/wiki/SubRip|SRT}
     */
    SRT = "srt",
    /**
     * Data is {@link https://en.wikipedia.org/wiki/WebVTT|WebVTT}
     */
    VTT = "vtt",
}

/**
 * Define a segment/cue
 */
export type Segment = {
    /**
     * Time (in seconds) when segment starts
     */
    startTime: number
    /**
     * Time (in seconds) when segment ends
     */
    endTime: number
    /**
     * Name of speaker for `body`
     */
    speaker: string
    /**
     * Text of transcript for segment
     */
    body: string
}
