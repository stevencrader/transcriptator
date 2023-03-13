import { parseHTML, PATTERN_HTML_TAG } from "./formats/html"
import { parseJSON } from "./formats/json"
import { parseSRT, parseSRTSegment } from "./formats/srt"
import { parseVTT } from "./formats/vtt"
import { PATTERN_LINE_SEPARATOR, Segment, TranscriptType } from "./types"

const PATTERN_PUNCTUATIONS = /^ *[.,?!}\]>) *$]/

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

const combineBody = (body: string, addition: string): string => {
    if (body) {
        let separator = " "
        if (PATTERN_PUNCTUATIONS.exec(addition)) {
            separator = ""
        }
        body = `${body}${separator}${addition}`
    } else {
        body = addition
    }
    return body
}

const combineSegments = (segments: Array<Segment>): Segment => {
    let newSegment = segments[0]
    segments.slice(1).forEach((segment) => {
        newSegment.endTime = segment.endTime
        newSegment.body = combineBody(newSegment.body, segment.body)
    })
    return newSegment
}

export const combineSingleWordSegments = (segments: Array<Segment>, maxLength: number = 32): Array<Segment> => {
    // only supported if segments are already 1 word, check first 20 segments
    const singleWordCheck = segments.slice(0, 20).filter((segment) => segment.body.includes(" "))
    if (singleWordCheck.length != 0) {
        throw new TypeError(`Cannot combine segments with more than 1 word`)
    }

    let outSegments: Array<Segment> = []

    let combinedSegments: Array<Segment> = []
    let newBody = ""
    let lastSpeaker = ""
    segments.forEach((segment, count) => {
        // next segment would make too long or speaker changed
        if (
            `${newBody} ${segment.body}`.length > maxLength ||
            (lastSpeaker !== "" && lastSpeaker !== segment.speaker)
        ) {
            outSegments.push(combineSegments(combinedSegments))

            // reset
            combinedSegments = []
            newBody = ""
        }

        // buffer segment
        combinedSegments.push(segment)
        newBody = combineBody(newBody, segment.body)
        lastSpeaker = segment.speaker
    })

    // handle trailing data
    if (combinedSegments.length > 0) {
        outSegments.push(combineSegments(combinedSegments))
    }

    return outSegments
}
