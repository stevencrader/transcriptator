const lib = require("../dist/index.js")
const fs = require('fs')

TRANSCRIPT_HTML_BUZZCAST = "test_files/buzzcast.html"
TRANSCRIPT_JSON_BUZZCAST = "test_files/buzzcast.json"
TRANSCRIPT_SRT_BUZZCAST = "test_files/buzzcast.srt"
TRANSCRIPT_SRT_PODCASTING_20 = "test_files/podcasting_20.srt"

const readFile = (filePath) => {
    return fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err
        console.error(err)
    })
}

test("Parse HTML", () => {
    lib.convertFile(readFile(TRANSCRIPT_HTML_BUZZCAST), lib.TranscriptType["TEXT_HTML"])
})

test("Parse SRT", () => {
    lib.convertFile(readFile(TRANSCRIPT_SRT_PODCASTING_20), lib.TranscriptType["TEXT_SRT"])
})
