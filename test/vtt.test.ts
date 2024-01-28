import { describe, expect, test } from "@jest/globals"

import { parseVTT } from "../src/formats/vtt"

import { readFile, TestFiles } from "./test_utils"

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
        {
            filePath: TestFiles.KDE_EXPRESS_16_KDE_EN_TELEGRAM,
            expectedFilePath: TestFiles.KDE_EXPRESS_16_KDE_EN_TELEGRAM_OUTPUT,
            id: "KDE Express",
        },
        {
            filePath: TestFiles.TRANSCRIPT_VTT_PODNEWS_DAILY_2024_01_25,
            expectedFilePath: TestFiles.TRANSCRIPT_VTT_PODNEWS_DAILY_2024_01_25_OUTPUT,
            id: "Podnews Daily 2024-01-25",
        },
        {
            filePath: TestFiles.TRANSCRIPT_VTT_PODNEWS_WEEKLY_REVIEW_2024_01_19,
            expectedFilePath: TestFiles.TRANSCRIPT_VTT_PODNEWS_WEEKLY_REVIEW_2024_01_19_OUTPUT,
            id: "Podnews Weekly Review 2024-01-19",
        },
    ])("Parse VTT File ($id)", ({ filePath, expectedFilePath }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = parseVTT(data)
        expect(segments).toEqual(expectedJSONData.segments)
    })
})
