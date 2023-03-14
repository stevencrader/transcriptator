import { describe, expect, test } from "@jest/globals"

import { parseVTT } from "../src/formats/vtt"

import { readFile, saveSegmentsToFile, TestFiles } from "./test_utils"

describe("Parse VTT file data", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        id: string
    }>([
        {
            filePath: TestFiles.TRANSCRIPT_VTT_LALALAND,
            expectedFilePath: TestFiles.TRANSCRIPT_VTT_LALALAND_OUTPUT,
            id: "LaLaLand",
        },
    ])("Parse VTT File ($id)", ({ filePath, expectedFilePath, id }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = parseVTT(data)
        saveSegmentsToFile(segments, `${id}_vtt.json`) // TODO: remove this
        expect(segments).toEqual(expectedJSONData.segments)
    })
})
