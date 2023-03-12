import { Segment } from "../types"

export type JSONTranscript = {
    version: string
    segments: Array<Segment>
}

export const parseJSON = (data: string): Array<Segment> => {
    throw new Error("JSON format not yet supported")

    const outSegments: Array<Segment> = []
    console.log("parseJSON")
    return outSegments
}
