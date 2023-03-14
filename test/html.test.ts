import { describe, expect, test } from "@jest/globals"

import { parseHTML } from "../src/formats/html"
import { Segment } from "../src/types"

import { readFile, saveSegmentsToFile, TRANSCRIPT_HTML_BUZZCAST, TRANSCRIPT_HTML_BUZZCAST_OUTPUT } from "./test_utils"

const _HTML_SEGMENTS_BOTH: Array<Segment> = [
    {
        startTime: 0,
        endTime: 30,
        speaker: "Alban",
        body: "It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.",
    },
    {
        startTime: 30,
        endTime: 0,
        speaker: "Kevin",
        body: "You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.",
    },
]

const _HTML_SEGMENTS_2_ONLY: Array<Segment> = [_HTML_SEGMENTS_BOTH[1]]

describe("HTML formats test", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        { data: "<html></html>", expected: [], id: "Empty HTML" },
        { data: "<html><body></body></html>", expected: [], id: "Empty Body" },
        {
            data:
                "\n" +
                "<!-- a comment -->\n" +
                "<html><body><cite>Alban:</cite>\n" +
                "  <time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>  </body></html>",
            expected: _HTML_SEGMENTS_BOTH,
            id: "has body html",
        },
        {
            data:
                "\n" +
                "<html><cite>Alban:</cite>\n" +
                "  <time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "</html>",
            expected: [
                {
                    startTime: 0,
                    endTime: 0,
                    speaker: "Alban",
                    body: "It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.",
                },
            ],
            id: "no body html",
        },
    ])("HTML Format ($id)", ({ data, expected, id }) => {
        expect(parseHTML(data)).toStrictEqual(expected)
    })
})

describe("Bad HTML data", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        {
            data:
                "<html><body>\n" +
                "  <time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>" +
                "  </body></html>",
            expected: _HTML_SEGMENTS_2_ONLY,
            id: "No cite",
        },
        {
            data:
                "<html><body><cite>Alban:</cite>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>" +
                "  </body></html>",
            expected: _HTML_SEGMENTS_2_ONLY,
            id: "No time",
        },
        {
            data:
                "<html><body><cite>Alban:</cite>\n" +
                "  <time>0:00</time>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>" +
                "  </body></html>",
            expected: _HTML_SEGMENTS_2_ONLY,
            id: "No p",
        },
        {
            data:
                "\n" +
                "<html><cite>Alban:</cite><cite>Joe:</cite>\n" +
                "  <time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>" +
                "  </body></html>",
            expected: [
                {
                    startTime: 0,
                    endTime: 30,
                    speaker: "Joe",
                    body: "It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.",
                },
                {
                    startTime: 30,
                    endTime: 0,
                    speaker: "Kevin",
                    body: "You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.",
                },
            ],
            id: "duplicate cite",
        },
        {
            data:
                "\n" +
                "<html><cite>Alban:</cite>\n" +
                "  <time>0:00</time><time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>" +
                "  </body></html>",
            expected: _HTML_SEGMENTS_BOTH,
            id: "duplicate time",
        },
        {
            data:
                "\n" +
                "<html><cite>Alban:</cite>\n" +
                "  <time>0:00</time>\n" +
                "  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n" +
                "<p>Second paragraph</p>\n" +
                "  <cite>Kevin:</cite>\n" +
                "  <time>0:30</time>\n" +
                "  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>" +
                "  </body></html>",
            expected: _HTML_SEGMENTS_BOTH,
            id: "duplicate p",
        },
    ])("Bad HTML data ($id)", ({ data, expected, id }) => {
        expect(parseHTML(data)).toStrictEqual(expected)
    })
})

describe("HTML formats error test", () => {
    test.each<{
        data: string
        id: string
    }>([{ data: "<body></body>", id: "No HTML" }])("HTML Error Format ($id)", ({ data, id }) => {
        expect(() => parseHTML(data)).toThrow(Error)
    })
})

describe("Parse HTML file data", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        id: string
    }>([
        {
            filePath: TRANSCRIPT_HTML_BUZZCAST,
            expectedFilePath: TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
            id: "Buzzcast",
        },
    ])("Parse HTML File ($id)", ({ filePath, expectedFilePath, id }) => {
        const data = readFile(filePath)
        const expectedHTMLData = JSON.parse(readFile(expectedFilePath))

        const segments = parseHTML(data)
        saveSegmentsToFile(segments, `${id}_html.json`) // TODO: remove this
        expect(segments).toEqual(expectedHTMLData.segments)
    })
})
