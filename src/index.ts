export enum TranscriptType {
    TEXT_HTML = "text/html",
    APPLICATION_JSON = "application/json",
    APPLICATION_SRT = "application/srt",
    TEXT_SRT = "text/srt",
    TEXT_VTT = "text/vtt",
    APPLICATION_X_SUBRIP = "application/x-subrip",
}

export type Segment = {
    startTime: number
    endTime?: number
    speaker?: string
    body: string
}

export type JSONTranscript = {
    version: string
    segments: Array<Segment>
}

const parseHTML = (data: string):Array<Segment> => {
    const outSegments = []
    console.log('parseHTML')
    return outSegments
}

const parseSRT = (data: string): Array<Segment> => {
    const outSegments = []
    console.log('parseSRT')
    return outSegments
}

export const convertFile = (data: string, transcriptType: TranscriptType) => {
    switch (transcriptType) {
        case TranscriptType.TEXT_HTML:
            parseHTML(data)
            break
        case TranscriptType.APPLICATION_JSON:
            break
        case TranscriptType.TEXT_SRT:
            parseSRT(data)
            break
        default:
            throw new TypeError(`Unknown transcript type: ${transcriptType}`)
    }
}

// converter
// Optional re-format length

// detect format by looking at file contents
