import { parseHTML } from "./formats/html"
import { parseSRT, parseSRTSegment } from "./formats/srt"
import { parseVTT } from "./formats/vtt"
import { TranscriptType } from "./types"

export const determineType = (data: string): TranscriptType => {
    data = data.trimStart()

    if (data.startsWith("WEBVTT")) {
        return TranscriptType.VTT
    } else if (data.startsWith("{")) {
        return TranscriptType.JSON
    } else if (data.startsWith("<!--")) {
        return TranscriptType.HTML
    } else if (RegExp("^< *html *>").exec(data)) {
        return TranscriptType.HTML
    } else if (parseSRTSegment(data.split(/\r?\n/).slice(0, 5)) !== undefined) {
        return TranscriptType.SRT
    }

    throw new TypeError(`Cannot determine type for data`)
}

export const convertFile = (
    data: string,
    transcriptType: TranscriptType = undefined
) => {
    if (transcriptType === undefined) {
        transcriptType = determineType(data)
    }

    switch (transcriptType) {
        case TranscriptType.HTML:
            parseHTML(data)
            break
        case TranscriptType.JSON:
            break
        case TranscriptType.SRT:
            parseSRT(data)
            break
        case TranscriptType.VTT:
            parseVTT(data)
            break
        default:
            throw new TypeError(`Unknown transcript type: ${transcriptType}`)
    }
}

// converter
// Optional re-format length

// detect format by looking at file contents
