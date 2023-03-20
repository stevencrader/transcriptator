import { describe, expect, test } from "@jest/globals"

import { parseHTML } from "../src/formats/html"
import { Segment } from "../src/types"

import { readFile, TestFiles } from "./test_utils"

describe("HTML formats test", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        { data: "<html></html>", expected: [], id: "Empty HTML" },
        { data: "<html><body></body></html>", expected: [], id: "Empty Body" },
        {
            data: `
<!-- a comment -->
<html><body><cite>Alban:</cite>
<time>0:00</time>
<p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
<cite>Kevin:</cite>
<time>0:30</time>
<p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
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
            data: `
<html><cite>Alban:</cite>
  <time>0:00</time>
  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
</html>`,
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
        {
            data: `  <time>0:00</time>
  <p>Hello. And just before we start, I'm gonna sound a little bit different in this episode because I discovered that I had magically recorded myself using my inbuilt microphone on my MacBook Air. Brilliant. So you can imagine how rubbish that was. However, thanks to the tools at Adobe Podcast, I no longer sound like this. It's Friday the 17th of March, 2023, but now I sound like this. It's Friday, the 17th of March, 2023. The last word in podcasting news. This is the Pod News Weekly review with James Cridlin and Sam Sethy. I'm James Cridlin, the editor of Pod News. And I'm Courtney Kosack from the podcast, besties Newsletter, and now podcast. Yes, uh, Sam is away skiing Las Vegas last week. Kits Bull in Switzerland this week. It's, uh, it's a difficult life, isn't it, for some people  in the chapters today. Apple and Spotify are both number one. It just depends what you look at. Uh, the winners of the ihearts Podcast Awards and who didn't win there or at the MBEs. And also, hello, I'm</p>
  <cite>Norma-Jean Belenky:</cite>`,
            expected: [
                {
                    startTime: 0,
                    endTime: 0,
                    speaker: "Norma-Jean Belenky",
                    body: "Hello. And just before we start, I'm gonna sound a little bit different in this episode because I discovered that I had magically recorded myself using my inbuilt microphone on my MacBook Air. Brilliant. So you can imagine how rubbish that was. However, thanks to the tools at Adobe Podcast, I no longer sound like this. It's Friday the 17th of March, 2023, but now I sound like this. It's Friday, the 17th of March, 2023. The last word in podcasting news. This is the Pod News Weekly review with James Cridlin and Sam Sethy. I'm James Cridlin, the editor of Pod News. And I'm Courtney Kosack from the podcast, besties Newsletter, and now podcast. Yes, uh, Sam is away skiing Las Vegas last week. Kits Bull in Switzerland this week. It's, uh, it's a difficult life, isn't it, for some people  in the chapters today. Apple and Spotify are both number one. It just depends what you look at. Uh, the winners of the ihearts Podcast Awards and who didn't win there or at the MBEs. And also, hello, I'm",
                },
            ],
            id: "time, p, cite",
        },
        {
            data: `  <time>0:00</time>
  <p>Hello. And just before we start, I'm gonna sound a little bit different in this episode because I discovered that I had magically recorded myself using my inbuilt microphone on my MacBook Air. Brilliant. So you can imagine how rubbish that was. However, thanks to the tools at Adobe Podcast, I no longer sound like this. It's Friday the 17th of March, 2023, but now I sound like this. It's Friday, the 17th of March, 2023. The last word in podcasting news. This is the Pod News Weekly review with James Cridlin and Sam Sethy. I'm James Cridlin, the editor of Pod News. And I'm Courtney Kosack from the podcast, besties Newsletter, and now podcast. Yes, uh, Sam is away skiing Las Vegas last week. Kits Bull in Switzerland this week. It's, uh, it's a difficult life, isn't it, for some people  in the chapters today. Apple and Spotify are both number one. It just depends what you look at. Uh, the winners of the ihearts Podcast Awards and who didn't win there or at the MBEs. And also, hello, I'm</p>`,
            expected: [
                {
                    startTime: 0,
                    endTime: 0,
                    speaker: "",
                    body: "Hello. And just before we start, I'm gonna sound a little bit different in this episode because I discovered that I had magically recorded myself using my inbuilt microphone on my MacBook Air. Brilliant. So you can imagine how rubbish that was. However, thanks to the tools at Adobe Podcast, I no longer sound like this. It's Friday the 17th of March, 2023, but now I sound like this. It's Friday, the 17th of March, 2023. The last word in podcasting news. This is the Pod News Weekly review with James Cridlin and Sam Sethy. I'm James Cridlin, the editor of Pod News. And I'm Courtney Kosack from the podcast, besties Newsletter, and now podcast. Yes, uh, Sam is away skiing Las Vegas last week. Kits Bull in Switzerland this week. It's, uh, it's a difficult life, isn't it, for some people  in the chapters today. Apple and Spotify are both number one. It just depends what you look at. Uh, the winners of the ihearts Podcast Awards and who didn't win there or at the MBEs. And also, hello, I'm",
                },
            ],
            id: "time, p",
        },
    ])("HTML Format ($id)", ({ data, expected }) => {
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
            data: `<html><body>\n
  <time>0:00</time>\n
  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>\n
  <cite>Kevin:</cite>\n
  <time>0:30</time>\n
  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
            expected: [
                {
                    startTime: 0,
                    endTime: 30,
                    speaker: "Kevin",
                    body: "It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.",
                },
                {
                    startTime: 30,
                    endTime: 0,
                    speaker: "Kevin",
                    body: "You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.",
                },
            ],
            id: "No cite",
        },
        {
            data: `<html><body><cite>Alban:</cite>
  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
  <cite>Kevin:</cite>
  <time>0:30</time>
  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
            expected: [
                {
                    startTime: 30,
                    endTime: 0,
                    speaker: "Kevin",
                    body: "You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.",
                },
            ],
            id: "No time",
        },
        {
            data: `<html><body><cite>Alban:</cite>
  <time>0:00</time>
  <cite>Kevin:</cite>
  <time>0:30</time>
  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
            expected: [
                {
                    startTime: 0,
                    endTime: 30,
                    speaker: "Alban",
                    body: "",
                },
                {
                    startTime: 30,
                    endTime: 0,
                    speaker: "Kevin",
                    body: "You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.",
                },
            ],
            id: "No p",
        },
        {
            data: `<html><cite>Alban:</cite><cite>Joe:</cite>
  <time>0:00</time>
  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
  <cite>Kevin:</cite>
  <time>0:30</time>
  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
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
            data: `<html><cite>Alban:</cite>
  <time>0:00</time><time>0:01</time>
  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
  <cite>Kevin:</cite>
  <time>0:30</time>
  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
            expected: [
                {
                    startTime: 0,
                    endTime: 1,
                    speaker: "Alban",
                    body: "",
                },
                {
                    startTime: 1,
                    endTime: 31,
                    speaker: "Kevin",
                    body: "It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.",
                },
                {
                    startTime: 30,
                    endTime: 0,
                    speaker: "Kevin",
                    body: "You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.",
                },
            ],
            id: "duplicate time",
        },
        {
            data: `<html><cite>Alban:</cite>
<time>0:00</time>
<p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
<p>Second paragraph</p>
<cite>Kevin:</cite>
<time>0:30</time>
<p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
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
                    body: "Second paragraph",
                },
            ],
            id: "duplicate p",
        },
    ])("Bad HTML data ($id)", ({ data, expected }) => {
        expect(parseHTML(data)).toStrictEqual(expected)
    })
})

describe("HTML formats error test", () => {
    test.each<{
        data: string
        id: string
    }>([{ data: "<body></body>", id: "No HTML" }])("HTML Error Format ($id)", ({ data }) => {
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
            filePath: TestFiles.TRANSCRIPT_HTML_BUZZCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
            id: "Buzzcast",
        },
        {
            filePath: TestFiles.TRANSCRIPT_HTML_PODNEWS_WEEKLY_REVIEW,
            expectedFilePath: TestFiles.TRANSCRIPT_HTML_PODNEWS_WEEKLY_REVIEW_OUTPUT,
            id: "Podnews Weekly Review",
        },
    ])("Parse HTML File ($id)", ({ filePath, expectedFilePath }) => {
        const data = readFile(filePath)
        const expectedHTMLData = JSON.parse(readFile(expectedFilePath))

        const segments = parseHTML(data)
        expect(segments).toEqual(expectedHTMLData.segments)
    })
})
