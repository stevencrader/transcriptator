import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import * as path from "node:path"

import { Segment } from "../src/types"

export enum TestFiles {
    TRANSCRIPT_HTML_BUZZCAST = "buzzcast.html",
    TRANSCRIPT_HTML_BUZZCAST_OUTPUT = "buzzcast_html_parsed.json",
    TRANSCRIPT_HTML_PODNEWS_WEEKLY_REVIEW = "podnews_weekly_review.htm",
    TRANSCRIPT_HTML_PODNEWS_WEEKLY_REVIEW_OUTPUT = "podnews_weekly_review_html_parsed.json",
    TRANSCRIPT_JSON_BUZZCAST = "buzzcast.json",
    TRANSCRIPT_JSON_BUZZCAST_OUTPUT = "buzzcast_json_parsed.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST = "how_to_start_a_podcast.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST_OUTPUT = "how_to_start_a_podcast_json_parsed.json",
    TRANSCRIPT_JSON_LALALAND = "LaLaLand.json",
    TRANSCRIPT_JSON_LALALAND_OUTPUT = "LaLaLand_json_parsed.json",
    TRANSCRIPT_SRT_BUZZCAST = "buzzcast.srt",
    TRANSCRIPT_SRT_BUZZCAST_OUTPUT = "buzzcast_srt_parsed.json",
    TRANSCRIPT_SRT_PODCASTING_20 = "podcasting_20.srt",
    TRANSCRIPT_SRT_PODCASTING_20_OUTPUT = "podcasting_20_srt_parsed.json",
    TRANSCRIPT_VTT_LALALAND = "LaLaLand.vtt",
    TRANSCRIPT_VTT_LALALAND_OUTPUT = "LaLaLand_vtt_parsed.json",
    ONE_WORD_SEGMENTS = "one_word_segments.json",
    ONE_WORD_SEGMENTS_OUTPUT_32 = "one_word_segments_parsed_32.json",
    ONE_WORD_SEGMENTS_OUTPUT_50 = "one_word_segments_parsed_50.json",
}

/**
 * Directory to save files to during tests
 */
const OUTPUT_DIR = path.join(__dirname, "/test_output")

/**
 * Read file from `test_files` directory
 *
 * @param filename Name of file to read
 * @returns Data read from `filename`
 */
export const readFile = (filename: string): string => {
    const filePath = path.join(__dirname, `/test_files/${filename}`)
    return readFileSync(filePath, "utf8")
}

/**
 * Save data to the filename specified in the {@link OUTPUT_DIR}
 *
 * @param filename Name of file to save data to
 * @param data Data to save to file
 */
const saveFile = (filename: string, data: string): void => {
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR)
    }
    const filePath = path.join(OUTPUT_DIR, `/${filename}`)
    writeFileSync(filePath, data, "utf-8")
}

/**
 * Save segments to JSON file specified by filename in {@link OUTPUT_DIR}
 *
 * @param segments Array of Segments
 * @param filename Name of file to save segments to
 */
export const saveSegmentsToFile = (segments: Array<Segment>, filename: string): void => {
    const data = JSON.stringify(
        {
            segments,
        },
        null,
        4
    )
    saveFile(filename, data)
}
