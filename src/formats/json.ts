import { addSegment } from "../segments"
import { parseSpeaker } from "../speaker"
import { TimestampFormatter } from "../timestamp"
import { Segment } from "../types"

/**
 * Define a segment/cue used in the JSONTranscript format
 */
export type JSONSegment = {
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
    speaker?: string
    /**
     * Text of transcript for segment
     */
    body: string
}

/**
 * Define the JSON transcript format
 */
export type JSONTranscript = {
    /**
     * Version of file format
     */
    version: string
    /**
     * Segment data
     */
    segments: Array<JSONSegment>
}

/**
 * Define the JSON transcript Segment format
 */
export type SubtitleSegment = {
    /**
     * Time (in milliseconds) when segment starts
     */
    start: number
    /**
     * Time (in milliseconds) when segment ends
     */
    end: number
    /**
     * Text of transcript for segment
     */
    text: string
}

/**
 * Determines if the value of data is a valid JSON transcript format
 * @param data The transcript data
 * @returns True: data is valid JSON transcript format
 */
export const isJSON = (data: string): boolean => {
    return (data.startsWith("{") && data.endsWith("}")) || (data.startsWith("[") && data.endsWith("]"))
}

/**
 * Parse JSON data where segments are in the `segments` Array and in the {@link JSONSegment} format
 * @param data Parsed JSON data
 * @returns An array of Segments from the parsed data
 */
const parseDictSegmentsJSON = (data: JSONTranscript): Array<Segment> => {
    let outSegments: Array<Segment> = []

    data.segments.forEach((segment) => {
        outSegments = addSegment(
            {
                startTime: segment.startTime,
                startTimeFormatted: TimestampFormatter.format(segment.startTime),
                endTime: segment.endTime,
                endTimeFormatted: TimestampFormatter.format(segment.endTime),
                speaker: segment.speaker,
                body: segment.body,
            },
            outSegments,
        )
    })

    return outSegments
}

/**
 * Parse JSON data where top level item is a dict/object
 * @param data The transcript data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When JSON data does not match one of the valid formats
 */
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

/**
 * Convert {@link SubtitleSegment} to the {@link Segment} format used here
 * @param data Segment parsed from JSON data
 * @returns Segment representing `data`.
 * Returns {@link undefined} when data does not match {@link SubtitleSegment} format.
 */
const getSegmentFromSubtitle = (data: SubtitleSegment): Segment => {
    if ("start" in data && "end" in data && "text" in data) {
        const { speaker, message } = parseSpeaker(data.text)
        const startTime = data.start / 1000
        const endTime = data.end / 1000
        const segment: Segment = {
            startTime,
            startTimeFormatted: TimestampFormatter.format(startTime),
            endTime,
            endTimeFormatted: TimestampFormatter.format(endTime),
            speaker,
            body: message,
        }
        if (Number.isNaN(segment.startTime)) {
            console.warn(`Computed start time is NaN: ${segment.startTime}`)
            return undefined
        }
        if (Number.isNaN(segment.endTime)) {
            console.warn(`Computed end time is NaN: ${segment.endTime}`)
            return undefined
        }
        return segment
    }
    return undefined
}

/**
 * Parse JSON data where items in data are in the {@link SubtitleSegment} format
 * @param data Parsed JSON data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When item in `data` does not match the {@link SubtitleSegment} format
 */
const parseListJSONSubtitle = (data: Array<SubtitleSegment>): Array<Segment> => {
    let outSegments: Array<Segment> = []

    let lastSpeaker = ""

    data.forEach((subtitle, count) => {
        const subtitleSegment = getSegmentFromSubtitle(subtitle)
        if (subtitleSegment !== undefined) {
            lastSpeaker = subtitleSegment.speaker ? subtitleSegment.speaker : lastSpeaker
            subtitleSegment.speaker = lastSpeaker

            outSegments = addSegment(subtitleSegment, outSegments)
        } else {
            throw new TypeError(`Unable to parse segment for item ${count}`)
        }
    })

    return outSegments
}

/**
 * Parse JSON data where top level item is an Array
 * @param data The transcript data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When JSON data does not match one of the valid formats
 */
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

/**
 * Parse JSON data to an Array of {@link Segment}
 * @param data The transcript data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When `data` is not valid JSON format
 */
export const parseJSON = (data: string): Array<Segment> => {
    const dataTrimmed = data.trim()
    let outSegments: Array<Segment> = []

    if (!isJSON(dataTrimmed)) {
        throw new TypeError(`Data is not valid JSON format`)
    }

    let parsed: object | Array<unknown>
    try {
        parsed = JSON.parse(data)
    } catch (e) {
        throw new TypeError(`Data is not valid JSON: ${e}`)
    }

    if (parsed.constructor === Object) {
        outSegments = parseDictJSON(parsed)
    } else if (parsed.constructor === Array) {
        outSegments = parseListJSON(parsed)
    }

    return outSegments
}
