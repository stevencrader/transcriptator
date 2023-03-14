import { parseSpeaker } from "../speaker"
import { Segment } from "../types"

export type JSONTranscript = {
    version: string
    segments: Array<Segment>
}

export type SubtitleSegment = {
    start: number
    end: number
    text: string
}

const parseDictSegmentsJSON = (data: JSONTranscript): Array<Segment> => {
    return data.segments
}

const parseDictJSON = (data: object): Array<Segment> => {
    let outSegments: Array<Segment> = []

    if (Object.keys(data).length === 0) {
        return outSegments
    }

    if ("segments" in data) {
        outSegments = parseDictSegmentsJSON(data as JSONTranscript)
    } else {
        throw new TypeError(`Unknown JSON dict transcript format`)
    }

    return outSegments
}

const getSegmentFromSubtitle = (data: SubtitleSegment): Segment => {
    if ("start" in data && "end" in data && "text" in data) {
        const { speaker, message } = parseSpeaker(data.text)
        return {
            startTime: data.start / 1000,
            endTime: data.end / 1000,
            speaker,
            body: message,
        }
    }
    return undefined
}

const parseListJSONSubtitle = (data: Array<SubtitleSegment>): Array<Segment> => {
    const outSegments: Array<Segment> = []

    if (data.length === 0) {
        return outSegments
    }

    let lastSpeaker = ""

    data.forEach((subtitle, count) => {
        const subtitleSegment = getSegmentFromSubtitle(subtitle)
        if (subtitleSegment !== undefined) {
            lastSpeaker = subtitleSegment.speaker ? subtitleSegment.speaker : lastSpeaker
            subtitleSegment.speaker = lastSpeaker
            outSegments.push(subtitleSegment)
        } else {
            throw new TypeError(`Unable to parse segment for item ${count}`)
        }
    })

    return outSegments
}

const parseListJSON = (data: Array<unknown>): Array<Segment> => {
    let outSegments: Array<Segment> = []

    if (data.length === 0) {
        return outSegments
    }

    const subtitleSegment = getSegmentFromSubtitle(data[0] as SubtitleSegment)
    if (subtitleSegment !== undefined) {
        outSegments = parseListJSONSubtitle(data as Array<SubtitleSegment>)
    } else {
        throw new TypeError(`Unknown JSON list transcript format`)
    }

    return outSegments
}

export const parseJSON = (data: string): Array<Segment> => {
    const dataTrimmed = data.trim()
    let outSegments: Array<Segment> = []

    if (
        !(
            (dataTrimmed.startsWith("{") && dataTrimmed.endsWith("}")) ||
            (dataTrimmed.startsWith("[") && dataTrimmed.endsWith("]"))
        )
    ) {
        throw new TypeError(`Data is not valid JSON format`)
    }

    let parsed: object | Array<unknown>
    try {
        parsed = JSON.parse(data)
    } catch (e) {
        throw new TypeError(`Data is not valid JSON: ${e}`)
    }

    // check for empty
    if (parsed.constructor === Object) {
        outSegments = parseDictJSON(parsed)
    } else if (parsed.constructor === Array) {
        outSegments = parseListJSON(parsed)
    } else {
        throw new TypeError(`Unknown JSON transcript format`)
    }

    return outSegments
}
