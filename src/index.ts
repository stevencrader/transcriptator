import { parseHTML, PATTERN_HTML_TAG } from "./formats/html"
import { parseJSON } from "./formats/json"
import { parseSRT, parseSRTSegment } from "./formats/srt"
import { parseVTT } from "./formats/vtt"
import { PATTERN_LINE_SEPARATOR, Segment, TranscriptType } from "./types"

export const determineType = (data: string): TranscriptType => {
    data = data.trim()

    try {
        if (data.startsWith("WEBVTT")) {
            return TranscriptType.VTT
        } else if (data.startsWith("{") && data.endsWith("}")) {
            return TranscriptType.JSON
        } else if (data.startsWith("[") && data.endsWith("]")) {
            return TranscriptType.JSON
        } else if (data.startsWith("<!--")) {
            return TranscriptType.HTML
        } else if (PATTERN_HTML_TAG.exec(data)) {
            return TranscriptType.HTML
        } else if (parseSRTSegment(data.split(PATTERN_LINE_SEPARATOR).slice(0, 20)) !== undefined) {
            return TranscriptType.SRT
        }
    } catch (e) {
        throw new TypeError(`Cannot determine type for data. Encountered error: ${e}`)
    }

    throw new TypeError(`Cannot determine type for data`)
}

export const convertFile = (data: string, transcriptType: TranscriptType = undefined): Array<Segment> => {
    if (transcriptType === undefined) {
        transcriptType = determineType(data)
    }

    data = data.trimStart()
    let outSegments: Array<Segment> = []
    switch (transcriptType) {
        case TranscriptType.HTML:
            outSegments = parseHTML(data)
            break
        case TranscriptType.JSON:
            outSegments = parseJSON(data)
            break
        case TranscriptType.SRT:
            outSegments = parseSRT(data)
            break
        case TranscriptType.VTT:
            outSegments = parseVTT(data)
            break
        default:
            throw new TypeError(`Unknown transcript type: ${transcriptType}`)
    }

    return outSegments
}

// converter
// Optional re-format length
