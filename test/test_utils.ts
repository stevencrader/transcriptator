import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import * as path from "node:path"

import { Segment } from "../src"

export enum TestFiles {
    KDE_EXPRESS_16_KDE_EN_TELEGRAM = "kde_express-16_kde_en_telegram.vtt",
    KDE_EXPRESS_16_KDE_EN_TELEGRAM_OUTPUT = "kde_express-16_kde_en_telegram_vtt_parsed.json",
    ONE_WORD_SEGMENTS = "one_word_segments.json",
    ONE_WORD_SEGMENTS_OUTPUT_32 = "one_word_segments_parsed_32.json",
    ONE_WORD_SEGMENTS_OUTPUT_50 = "one_word_segments_parsed_50.json",
    TRANSCRIPT_HTML_BUZZCAST = "buzzcast.html",
    TRANSCRIPT_HTML_BUZZCAST_OUTPUT = "buzzcast_html_parsed.json",
    TRANSCRIPT_HTML_PODNEWS_WEEKLY_REVIEW_2023_03_17 = "podnews_weekly_review_2023-03-17.html",
    TRANSCRIPT_HTML_PODNEWS_WEEKLY_REVIEW_2023_03_17_OUTPUT = "podnews_weekly_review_2023-03-17_html_parsed.json",
    TRANSCRIPT_JSON_BUZZCAST = "buzzcast.json",
    TRANSCRIPT_JSON_BUZZCAST_COMBINE_EQUAL_TIME_OUTPUT = "buzzcast_json_combine_equal_time_parsed.json",
    TRANSCRIPT_JSON_BUZZCAST_COMBINE_EQUAL_TIME_SPACE_OUTPUT = "buzzcast_json_combine_equal_time_space_parsed.json",
    TRANSCRIPT_JSON_BUZZCAST_OUTPUT = "buzzcast_json_parsed.json",
    TRANSCRIPT_JSON_BUZZCAST_SPEAKER_CHANGE_COMBINE_EQUAL_TIME_SPACE_OUTPUT = "buzzcast_json_speaker_change_combine_equal_time_space_parsed.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST = "how_to_start_a_podcast.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST_COMBINE_SEGMENTS_32_OUTPUT = "how_to_start_a_podcast_json_combine_segments_32_parsed.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST_COMBINE_SPEAKER_OUTPUT = "how_to_start_a_podcast_json_combine_speaker_parsed.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST_OUTPUT = "how_to_start_a_podcast_json_parsed.json",
    TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST_SPEAKER_CHANGE_OUTPUT = "how_to_start_a_podcast_json_speaker_changed_parsed.json",
    TRANSCRIPT_JSON_LALALAND = "LaLaLand.json",
    TRANSCRIPT_JSON_LALALAND_OUTPUT = "LaLaLand_json_parsed.json",
    TRANSCRIPT_JSON_PODNEWS_WEEKLY_REVIEW_2023_05_05 = "podnews_weekly_review_2023-05-05.json",
    TRANSCRIPT_JSON_PODNEWS_WEEKLY_REVIEW_2023_05_05_COMBINE_SPEAKER_OUTPUT = "podnews_weekly_review_2023-05-05_combine_speaker_json_parsed.json",
    TRANSCRIPT_JSON_PODNEWS_WEEKLY_REVIEW_2023_05_05_OUTPUT = "podnews_weekly_review_2023-05-05_json_parsed.json",
    TRANSCRIPT_JSON_PODNEWS_WEEKLY_REVIEW_2023_06_02 = "podnews_weekly_review_2023-06-02.json",
    TRANSCRIPT_JSON_PODNEWS_WEEKLY_REVIEW_2023_06_02_OUTPUT = "podnews_weekly_review_2023-06-02_json_parsed.json",
    TRANSCRIPT_SRT_BUZZCAST = "buzzcast.srt",
    TRANSCRIPT_SRT_BUZZCAST_COMBINED_SEGMENTS_128_OUTPUT = "buzzcast_srt_combined_segments_128_parsed.json",
    TRANSCRIPT_SRT_BUZZCAST_OUTPUT = "buzzcast_srt_parsed.json",
    TRANSCRIPT_SRT_BUZZCAST_SPEAKER_CHANGE_COMBINED_SEGMENTS_128_OUTPUT = "buzzcast_srt_speaker_change_combined_segments_128_parsed.json",
    TRANSCRIPT_SRT_PODCASTING_20_EPISODE_124 = "podcasting_20_episode_124.srt",
    TRANSCRIPT_SRT_PODCASTING_20_EPISODE_124_OUTPUT = "podcasting_20_episode_124_srt_parsed.json",
    TRANSCRIPT_VTT_LALALAND = "LaLaLand.vtt",
    TRANSCRIPT_VTT_LALALAND_OUTPUT = "LaLaLand_vtt_parsed.json",
    TRANSCRIPT_VTT_PODNEWS_DAILY_2024_01_25 = "podnews_daily_2024-01-25.vtt",
    TRANSCRIPT_VTT_PODNEWS_DAILY_2024_01_25_OUTPUT = "podnews_daily_2024-01-25_vtt_parsed.json",
    TRANSCRIPT_VTT_PODNEWS_WEEKLY_REVIEW_2024_01_19 = "podnews_weekly_review_2024-01-19.vtt",
    TRANSCRIPT_VTT_PODNEWS_WEEKLY_REVIEW_2024_01_19_OUTPUT = "podnews_weekly_review_2024-01-19_vtt_parsed.json",
}

/**
 * Directory to save files to during tests
 */
const OUTPUT_DIR = path.join(__dirname, "/test_output")

/**
 * Read file from `test_files` directory
 * @param filename Name of file to read
 * @returns Data read from `filename`
 */
export const readFile = (filename: string): string => {
    const filePath = path.join(__dirname, `/test_files/${filename}`)
    return readFileSync(filePath, "utf8")
}

/**
 * Save data to the filename specified in the {@link OUTPUT_DIR}
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
 * @param segments Array of Segments
 * @param filename Name of file to save segments to
 */
export const saveSegmentsToFile = (segments: Array<Segment>, filename: string): void => {
    const data = JSON.stringify(
        {
            segments,
        },
        null,
        4,
    )
    saveFile(filename, data)
}
