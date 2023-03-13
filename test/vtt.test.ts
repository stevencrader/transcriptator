import { describe, expect, test } from "@jest/globals"
import { parseVTT } from "../src/formats/vtt"
import { readFile, saveSegmentsToFile, TRANSCRIPT_VTT_LALALAND, TRANSCRIPT_VTT_LALALAND_OUTPUT } from "./test_utils"

describe("Parse VTT file data", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        id: string
    }>([
        {
            filePath: TRANSCRIPT_VTT_LALALAND,
            expectedFilePath: TRANSCRIPT_VTT_LALALAND_OUTPUT,
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
