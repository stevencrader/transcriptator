import { Segment } from "../types"

export const parseVTT = (data: string): Array<Segment> => {
    if (!data.startsWith("WEBVTT")) {
        throw new TypeError(`Data is not valid HTML format`)
    }

    throw new Error("VTT format not yet supported")

    const outSegments: Array<Segment> = []
    console.log("parseVTT")
    return outSegments
}
