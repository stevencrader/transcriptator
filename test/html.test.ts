import { describe, expect, test } from "@jest/globals"
import { parseHTML } from "../src/formats/html"
import { Segment } from "../src/types"

describe("HTML formats test", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        { data: "<html></html>", expected: [], id: "Empty HTML" },
        { data: "<html><body></body></html>", expected: [], id: "Empty Body" },
        {
            data: "\n<!-- saved from url=(0054)https://feeds.buzzsprout.com/231452/9092843/transcript -->\n<html><body><cite>Alban:</cite>\n  <time>0:00</time>\n  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n  <cite>Kevin:</cite>\n  <time>0:30</time>\n  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>  </body></html>",
            expected: [
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
            ],
            id: "has body html",
        },
        {
            data: "\n<html><cite>Alban:</cite>\n  <time>0:00</time>\n  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n</html>",
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
