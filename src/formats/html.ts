import { Segment } from "../types"

export const PATTERN_HTML_TAG = /^< *html *>/i

export const parseHTML = (data: string): Array<Segment> => {
    const dataTrimmed = data.trim()

    if (!(dataTrimmed.startsWith("<!--") || PATTERN_HTML_TAG.exec(dataTrimmed))) {
        throw new TypeError(`Data is not valid HTML format`)
    }

    throw new Error("HTML format not yet supported")

    const outSegments: Array<Segment> = []
    console.log("parseHTML")
    return outSegments
}
