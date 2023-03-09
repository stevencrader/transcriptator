const lib = require("../dist/index.js")

TRANSCRIPT_HTML_BUZZCAST = "test_files/buzzcast.html"
TRANSCRIPT_SRT_BUZZCAST = "test_files/buzzcast.srt"
TRANSCRIPT_JSON_BUZZCAST = "test_files/buzzcast.json"
TRANSCRIPT_HTML_PODCASTING_20 = "test_files/podcasting_20.html"

test("Example Test", () => {
    lib.transcriptator()
});
