import { describe, expect, test } from "@jest/globals"

import { parseJSON } from "../src/formats/json"
import { Segment } from "../src/types"

import { readFile, TestFiles } from "./test_utils"

describe("JSON formats test", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        { data: "[]", expected: [], id: "Empty List" },
        { data: "{}", expected: [], id: "Empty Dict" },
        {
            // language=JSON
            data: '{"version": "1.0.0","segments": [{"speaker": "Alban","startTime": 0.0,"endTime": 4.8,"body": "It is so stinking nice to"}]}',
            expected: [
                {
                    startTime: 0.0,
                    endTime: 4.8,
                    speaker: "Alban",
                    body: "It is so stinking nice to",
                },
            ],
            id: "Dict segments",
        },
        {
            // language=JSON
            data: '[{"start": 1,"end": 5000,"text": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            expected: [
                {
                    startTime: 0.001,
                    endTime: 5,
                    speaker: "Subtitles",
                    body: "@marlonrock1986 (^^V^^)",
                },
            ],
            id: "List",
        },
    ])("JSON Format ($id)", ({ data, expected }) => {
        expect(parseJSON(data)).toStrictEqual(expected)
    })
})

describe("JSON invalid formats", () => {
    test.each<{
        data: string
        id: string
    }>([
        {
            data: "",
            id: "Empty",
        },
        {
            // language=JSON
            data: '{"version": "1.0.0"}',
            id: "invalid format",
        },
        {
            // language=JSON
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            id: "Wrong list format",
        },
        {
            data: '{"segments": [],}',
            id: "Invalid JSON",
        },
        {
            // language=JSON
            data: '[{"start": "A","end": 5000,"text": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            id: "start is NaN",
        },
        {
            // language=JSON
            data: '[{"start": 0,"end": "Z","text": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            id: "end is NaN",
        },
        {
            data: '[{"end":5000,"start":1,"text":"Subtitles: @marlonrock1986 (^^V^^)"},{"end":"A","start":25801,"text":"It\'s another hot, sunny day today\\nhere in Southern California."}]',
            id: "Error in later segment",
        },
    ])("JSON invalid formats ($id)", ({ data }) => {
        expect(() => parseJSON(data)).toThrow(Error)
    })
})

describe("Parse JSON file data", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        id: string
    }>([
        {
            filePath: TestFiles.TRANSCRIPT_JSON_BUZZCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
            id: "Buzzcast",
        },
        {
            filePath: TestFiles.TRANSCRIPT_JSON_LALALAND,
            expectedFilePath: TestFiles.TRANSCRIPT_JSON_LALALAND_OUTPUT,
            id: "LaLaLand",
        },
        {
            filePath: TestFiles.TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_JSON_HOW_TO_START_A_PODCAST_OUTPUT,
            id: "How to Start a Podcast",
        },
    ])("Parse JSON File ($id)", ({ filePath, expectedFilePath }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = parseJSON(data)
        expect(segments).toEqual(expectedJSONData.segments)
    })
})
