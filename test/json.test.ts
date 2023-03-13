import { describe, expect, test } from "@jest/globals"
import { parseJSON } from "../src/formats/json"
import { Segment } from "../src/types"
import {
    readFile,
    saveSegmentsToFile,
    TRANSCRIPT_JSON_BUZZCAST,
    TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
    TRANSCRIPT_JSON_LALALAND,
    TRANSCRIPT_JSON_LALALAND_OUTPUT
} from "./test_utils"

describe("JSON formats test", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        { data: "[]", expected: [], id: "Empty List" },
        { data: "{}", expected: [], id: "Empty Dict" },
        {
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
    ])("JSON Format ($id)", ({ data, expected, id }) => {
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
            data: '{"version": "1.0.0"}',
            id: "invalid format",
        },
        {
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            id: "Wrong list format",
        },
    ])("JSON invalid formats ($id)", ({ data, id }) => {
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
            filePath: TRANSCRIPT_JSON_BUZZCAST,
            expectedFilePath: TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
            id: "Buzzcast",
        },
        {
            filePath: TRANSCRIPT_JSON_LALALAND,
            expectedFilePath: TRANSCRIPT_JSON_LALALAND_OUTPUT,
            id: "LaLaLand",
        },
    ])("Parse JSON File ($id)", ({ filePath, expectedFilePath, id }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = parseJSON(data)
        saveSegmentsToFile(segments, `${id}_json.json`) // TODO: remove this
        expect(segments).toEqual(expectedJSONData.segments)
    })
})
