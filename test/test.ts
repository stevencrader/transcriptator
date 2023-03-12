import { describe, expect, test } from "@jest/globals"
import { convertFile, determineType } from "../src"
import { TranscriptType } from "../src/types"
import {
    readFile,
    TRANSCRIPT_JSON_BUZZCAST,
    TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
    TRANSCRIPT_JSON_LALALAND,
    TRANSCRIPT_JSON_LALALAND_OUTPUT,
    TRANSCRIPT_SRT_BUZZCAST,
    TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
    TRANSCRIPT_SRT_PODCASTING_20,
    TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
} from "./test_utils"

describe("Determine Transcript Type", () => {
    // noinspection HtmlRequiredLangAttribute
    test.each<{
        data: string
        expected: TranscriptType
    }>([
        {
            data: " <!-- html comment --><html></html>",
            expected: TranscriptType.HTML,
        },
        { data: "<html></html>", expected: TranscriptType.HTML },
        { data: "\nWEBVTT", expected: TranscriptType.VTT },
        { data: "WEBVTT", expected: TranscriptType.VTT },
        {
            data: '{"version":"1.0.0","segments":[{"speaker":"Alban","startTime":0.0,"endTime":4.8,"body":"It is so stinking nice to"}]}',
            expected: TranscriptType.JSON,
        },
        {
            data: "1\n00:00:00,780 --> 00:00:06,210\nAdam Curry: podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            expected: TranscriptType.SRT,
        },
        {
            data: "2\n00:00:00,780 --> 00:00:06.210\nAdam Curry: podcasting 2.0 March\n",
            expected: TranscriptType.SRT,
        },
        {
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            expected: TranscriptType.JSON,
        },
        {
            data: '{"version": "1.0.0","segments": [{"speaker": "Alban","startTime": 0.0,"endTime": 4.8,"body": "It is so stinking nice to"}]}',
            expected: TranscriptType.JSON,
        },
    ])("Transcript Type ($expected)", ({ data, expected }) => {
        expect(determineType(data)).toBe(expected)
    })
})

describe("Unknown transcript type data", () => {
    test.each<{
        data: string
        id: string
    }>([{ data: "", id: "Empty" }])("Transcript Type Unknown ($id)", ({ data, id }) => {
        expect(() => determineType(data)).toThrow(Error)
    })
})

describe("Convert File", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        transcriptType: TranscriptType
        id: string
    }>([
        {
            filePath: TRANSCRIPT_SRT_BUZZCAST,
            transcriptType: undefined,
            expectedFilePath: TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
            id: "SRT Detect",
        },
        {
            filePath: TRANSCRIPT_SRT_PODCASTING_20,
            transcriptType: TranscriptType.SRT,
            expectedFilePath: TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
            id: "SRT",
        },
        {
            filePath: TRANSCRIPT_JSON_BUZZCAST,
            transcriptType: undefined,
            expectedFilePath: TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
            id: "JSON Detect",
        },
        {
            filePath: TRANSCRIPT_JSON_LALALAND,
            transcriptType: TranscriptType.JSON,
            expectedFilePath: TRANSCRIPT_JSON_LALALAND_OUTPUT,
            id: "JSON",
        },
    ])("Convert File ($id)", ({ filePath, transcriptType, expectedFilePath, id }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = convertFile(data, transcriptType)
        expect(segments).toEqual(expectedJSONData.segments)
    })
})

describe("Convert File Error", () => {
    test.each<{
        data: string
        transcriptType: TranscriptType | string
        id: string
    }>([
        {
            data: "",
            transcriptType: "txt",
            id: "Unknown type",
        },
        {
            data: "1\n00:00:00,780 --> 00:00:06,210\nAdam Curry: podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            transcriptType: TranscriptType.VTT,
            id: "SRT, wrong type",
        },
        {
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            transcriptType: TranscriptType.SRT,
            id: "JSON, wrong type",
        },
        // TODO: add more after additional types supported
    ])("Convert File Error ($id)", ({ data, transcriptType, id }) => {
        expect(() => convertFile(data, transcriptType as TranscriptType)).toThrow(Error)
    })
})
