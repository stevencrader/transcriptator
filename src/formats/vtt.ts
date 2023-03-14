import { Segment } from "../types"

import { parseSRT } from "./srt"

/**
 * Required header for WebVTT/VTT files
 */
const WEBVTT_HEADER = "WEBVTT"

/**
 * Parse VTT data to an Array of {@link Segment}
 *
 * @param data The transcript data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When `data` is not valid VTT format
 */
export const parseVTT = (data: string): Array<Segment> => {
    const idx = data.indexOf(WEBVTT_HEADER)

    if (idx !== 0) {
        throw new TypeError(`Data is not valid VTT format`)
    }

    // format is similar enough to SRT to be parsed by the same parser
    // Remove WEBVTT header first
    return parseSRT(data.substring(idx + WEBVTT_HEADER.length).trimStart())
}
