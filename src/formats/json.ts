import { Segment } from "../types"

export type JSONTranscript = {
    version: string
    segments: Array<Segment>
}

export const parseJSON = (data: string): Array<Segment> => {
    const outSegments: Array<Segment> = []
    console.log("parseJSON")
    return outSegments
}
