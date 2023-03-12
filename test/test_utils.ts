import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import * as path from "path"
import { Segment } from "../src/types"

export const TRANSCRIPT_HTML_BUZZCAST = "buzzcast.html"
export const TRANSCRIPT_JSON_BUZZCAST = "buzzcast.json"
export const TRANSCRIPT_JSON_BUZZCAST_OUTPUT = "buzzcast_json_parsed.json"
export const TRANSCRIPT_SRT_BUZZCAST = "buzzcast.srt"
export const TRANSCRIPT_SRT_BUZZCAST_OUTPUT = "buzzcast_srt_parsed.json"
export const TRANSCRIPT_SRT_PODCASTING_20 = "podcasting_20.srt"
export const TRANSCRIPT_SRT_PODCASTING_20_OUTPUT = "podcasting_20_srt_parsed.json"

export const TRANSCRIPT_JSON_LALALAND = "LaLaLand.json"
export const TRANSCRIPT_JSON_LALALAND_OUTPUT = "LaLaLand_json_parsed.json"
export const TRANSCRIPT_VTT_LALALAND = "LaLaLand.vtt"
export const TRANSCRIPT_VTT_LALALAND_OUTPUT = "LaLaLand_vtt_parsed.json"

const OUTPUT_DIR = path.join(__dirname, "/test_output")

export const readFile = (filename: string): string => {
    const filePath = path.join(__dirname, `/test_files/${filename}`)
    return readFileSync(filePath, "utf8")
}

const saveFile = (filename: string, data: string) => {
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR)
    }
    const filePath = path.join(OUTPUT_DIR, `/${filename}`)
    writeFileSync(filePath, data, "utf-8")
}

export const saveSegmentsToFile = (segments: Array<Segment>, filename: string) => {
    const data = JSON.stringify(
        {
            segments: segments,
        },
        null,
        4
    )
    saveFile(filename, data)
}
