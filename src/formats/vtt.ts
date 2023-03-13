import { Segment } from "../types"

import { parseSRT } from "./srt"

const WEBVTT_HEADER = "WEBVTT"
export const parseVTT = (data: string): Array<Segment> => {
    const idx = data.indexOf(WEBVTT_HEADER)

    if (idx !== 0) {
        throw new TypeError(`Data is not valid VTT format`)
    }

    // format is similar enough to SRT to be parsed by the same parser
    // Remove WEBVTT header first
    return parseSRT(data.substring(idx + WEBVTT_HEADER.length).trimStart())
}
