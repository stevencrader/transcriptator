import { describe, expect, test } from "@jest/globals"

import { combineSingleWordSegments, convertFile, determineFormat } from "../src"
import { Segment, TranscriptFormat } from "../src/types"

import {
    ONE_WORD_SEGMENTS,
    ONE_WORD_SEGMENTS_OUTPUT_32,
    ONE_WORD_SEGMENTS_OUTPUT_50,
    readFile,
    saveSegmentsToFile,
    TRANSCRIPT_HTML_BUZZCAST,
    TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
    TRANSCRIPT_JSON_BUZZCAST,
    TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
    TRANSCRIPT_JSON_LALALAND,
    TRANSCRIPT_JSON_LALALAND_OUTPUT,
    TRANSCRIPT_SRT_BUZZCAST,
    TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
    TRANSCRIPT_SRT_PODCASTING_20,
    TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
    TRANSCRIPT_VTT_LALALAND,
    TRANSCRIPT_VTT_LALALAND_OUTPUT,
} from "./test_utils"

describe("Determine Transcript Type", () => {
    // noinspection HtmlRequiredLangAttribute
    test.each<{
        data: string
        expected: TranscriptFormat
    }>([
        {
            data: " <!-- html comment --><html></html>",
            expected: TranscriptFormat.HTML,
        },
        { data: "<html></html>", expected: TranscriptFormat.HTML },
        { data: "\nWEBVTT", expected: TranscriptFormat.VTT },
        { data: "WEBVTT", expected: TranscriptFormat.VTT },
        {
            data: '{"version":"1.0.0","segments":[{"speaker":"Alban","startTime":0.0,"endTime":4.8,"body":"It is so stinking nice to"}]}',
            expected: TranscriptFormat.JSON,
        },
        {
            data: "1\n00:00:00,780 --> 00:00:06,210\nAdam Curry: podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            expected: TranscriptFormat.SRT,
        },
        {
            data: "2\n00:00:00,780 --> 00:00:06.210\nAdam Curry: podcasting 2.0 March\n",
            expected: TranscriptFormat.SRT,
        },
        {
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            expected: TranscriptFormat.JSON,
        },
        {
            data: '{"version": "1.0.0","segments": [{"speaker": "Alban","startTime": 0.0,"endTime": 4.8,"body": "It is so stinking nice to"}]}',
            expected: TranscriptFormat.JSON,
        },
    ])("Transcript Type ($expected)", ({ data, expected }) => {
        expect(determineFormat(data)).toEqual(expected)
    })
})

describe("Unknown transcript format data", () => {
    test.each<{
        data: string
        id: string
    }>([{ data: "", id: "Empty" }])("Transcript Type Unknown ($id)", ({ data }) => {
        expect(() => determineFormat(data)).toThrow(Error)
    })
})

describe("Convert File", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        transcriptFormat: TranscriptFormat | undefined
        id: string
    }>([
        {
            filePath: TRANSCRIPT_SRT_BUZZCAST,
            transcriptFormat: undefined,
            expectedFilePath: TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
            id: "SRT Detect",
        },
        {
            filePath: TRANSCRIPT_SRT_PODCASTING_20,
            transcriptFormat: TranscriptFormat.SRT,
            expectedFilePath: TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
            id: "SRT",
        },
        {
            filePath: TRANSCRIPT_JSON_BUZZCAST,
            transcriptFormat: undefined,
            expectedFilePath: TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
            id: "JSON Detect",
        },
        {
            filePath: TRANSCRIPT_JSON_LALALAND,
            transcriptFormat: TranscriptFormat.JSON,
            expectedFilePath: TRANSCRIPT_JSON_LALALAND_OUTPUT,
            id: "JSON",
        },
        {
            filePath: TRANSCRIPT_HTML_BUZZCAST,
            transcriptFormat: undefined,
            expectedFilePath: TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
            id: "HTML Detect",
        },
        {
            filePath: TRANSCRIPT_HTML_BUZZCAST,
            transcriptFormat: TranscriptFormat.HTML,
            expectedFilePath: TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
            id: "HTML",
        },
        {
            filePath: TRANSCRIPT_VTT_LALALAND,
            transcriptFormat: undefined,
            expectedFilePath: TRANSCRIPT_VTT_LALALAND_OUTPUT,
            id: "VTT Detect",
        },
        {
            filePath: TRANSCRIPT_VTT_LALALAND,
            transcriptFormat: TranscriptFormat.VTT,
            expectedFilePath: TRANSCRIPT_VTT_LALALAND_OUTPUT,
            id: "VTT",
        },
    ])("Convert File ($id)", ({ filePath, transcriptFormat, expectedFilePath }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = convertFile(data, transcriptFormat)
        expect(segments).toEqual(expectedJSONData.segments)
    })
})

describe("Convert File Error", () => {
    test.each<{
        data: string
        transcriptFormat: TranscriptFormat | string
        id: string
    }>([
        {
            data: "",
            transcriptFormat: "txt",
            id: "Unknown format",
        },
        {
            data:
                "1\n" +
                "00:00:00,780 --> 00:00:06,210\n" +
                "Adam Curry: podcasting 2.0 March\n" +
                "4 2023 Episode 124 on D flat",
            transcriptFormat: TranscriptFormat.VTT,
            id: "SRT, wrong format",
        },
        {
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            transcriptFormat: TranscriptFormat.SRT,
            id: "JSON, wrong format",
        },
        {
            data:
                "<!-- a comment -->\n" +
                "<html><body><cite>Alban:</cite>\n" +
                "  <time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>  </body></html>",
            transcriptFormat: TranscriptFormat.JSON,
            id: "HTML, wrong format",
        },
        {
            data: `WEBVTT

1
00:00:00.001 --> 00:00:05.000
Subtitles: @marlonrock1986 (^^V^^)
`,
            transcriptFormat: TranscriptFormat.JSON,
            id: "VTT, wrong format",
        },
    ])("Convert File Error ($id)", ({ data, transcriptFormat }) => {
        expect(() => convertFile(data, transcriptFormat as TranscriptFormat)).toThrow(Error)
    })
})

describe("Combine Single Word Segments", () => {
    // noinspection HtmlRequiredLangAttribute
    test.each<{
        segments: Array<Segment> | string
        maxLength: number
        expected: Array<Segment> | string
        id: string
    }>([
        {
            segments: [],
            maxLength: 32,
            expected: [],
            id: "Empty",
        },
        {
            segments: ONE_WORD_SEGMENTS,
            maxLength: 32,
            expected: ONE_WORD_SEGMENTS_OUTPUT_32,
            id: "length 32",
        },
        {
            segments: ONE_WORD_SEGMENTS,
            maxLength: 50,
            expected: ONE_WORD_SEGMENTS_OUTPUT_50,
            id: "length 50",
        },
    ])("Combine Single Word Segments ($id)", ({ segments, maxLength, expected, id }) => {
        const segmentsJSON = typeof segments === "string" ? JSON.parse(readFile(segments)) : segments
        const expectedJSON = typeof expected === "string" ? JSON.parse(readFile(expected)) : expected

        const outSegments = combineSingleWordSegments(segmentsJSON as Array<Segment>, maxLength)
        saveSegmentsToFile(outSegments, `${id}_word.json`) // TODO: remove this
        expect(outSegments).toStrictEqual(expectedJSON)
    })
})

describe("Unsupported segment data", () => {
    test.each<{
        segments: Array<Segment>
        maxLength: number
        id: string
    }>([
        {
            segments: [
                {
                    speaker: "Travis",
                    startTime: 0.3,
                    endTime: 0.93,
                    body: "Hey, Travis",
                },
                {
                    speaker: "Travis",
                    startTime: 0.931,
                    endTime: 1.08,
                    body: "Albritain",
                },
                {
                    speaker: "Travis",
                    startTime: 1.321,
                    endTime: 1.65,
                    body: "here.",
                },
            ],
            maxLength: 32,
            id: "Space 1",
        },
    ])("Unsupported segment data ($id)", ({ segments, maxLength }) => {
        expect(() => combineSingleWordSegments(segments, maxLength)).toThrow(Error)
    })
})
