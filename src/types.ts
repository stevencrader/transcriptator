export const PATTERN_LINE_SEPARATOR = /\r?\n/

export enum TranscriptFormat {
    HTML = "html",
    JSON = "json",
    SRT = "srt",
    VTT = "vtt",
}

export type Segment = {
    startTime: number
    endTime: number
    speaker: string
    body: string
}
