# Transcriptator

Library for converting the various transcript file formats to a common format.

Originally designed to help users of the [Podcast Namespace](https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/1.0.md#transcript) `podcast:transcript` tag.

## Supported File Formats

### SRT

Transcripts which follow the SRT/SubRip format

```text
1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat

2
00:00:06,210 --> 00:00:12,990
formable hello everybody welcome
to a delayed board meeting of

```

The timestamp may contain the hour and minutes but is not required. The millisecond may be separated with either a comma or decimal.

Attempts to find the speaker's name from the beginning of the first line of each segment.

References:

-   https://en.wikipedia.org/wiki/SubRip

### HTML

HTML data in format below are considered to be transcripts.

A set of `cite`, `time`, and `p` elements are used to define a segment.

The elements must either be a direct child of the `html` or `body` element.

Elements do not need to be on separate lines.

```html
<html>
    <body>
        <cite>Alban:</cite>
        <time>0:00</time>
        <p>
            It is so stinking nice to like, show up and record this show. And Travis has already put together an
            outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the
            work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least
            two thirds of the team. Yeah, I mean, exactly.
        </p>
        <cite>Kevin:</cite>
        <time>0:30</time>
        <p>
            You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was
            like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I
            don't want to do this.
        </p>
    </body>
</html>
```

### JSON

JSON data in one of the formats below are considered to be transcripts.

In both formats, the data does not need to be in pretty print format.

**Format 1**

```json
{
    "version": "1.0.0",
    "segments": [
        {
            "speaker": "Alban",
            "startTime": 0.0,
            "endTime": 4.8,
            "body": "It is so stinking nice to"
        },
        {
            "speaker": "Alban",
            "startTime": 0.0,
            "endTime": 4.8,
            "body": "like, show up and record this"
        }
    ]
}
```

There must be a `segments` list of objects containing `speaker`, `startTime`, `endTime`, and `body`.

The `startTime` and `endTime` are assumed to be in seconds.

**Format 2**

```json
[
    {
        "start": 1,
        "end": 5000,
        "text": "Subtitles: @marlonrock1986 (^^V^^)"
    },
    {
        "start": 25801,
        "end": 28700,
        "text": "It's another hot, sunny day today\nhere in Southern California."
    }
]
```

The top level element must be a list of objects containing `start`, `end`, and `text`.

The `start` and `end` are assumed to be in milliseconds.

Attempts to find the speaker's name from the beginning of the `text` value.

### WebVTT

Transcripts which follow the WebVTT/VTT format

```
WEBVTT

1
00:00:00.001 --> 00:00:05.000
Subtitles: @marlonrock1986 (^^V^^)

2
00:00:25.801 --> 00:00:28.700
It's another hot, sunny day today
here in Southern California.

```

The timestamp may contain the hour and minutes but is not required. The millisecond may be separated with either a comma or decimal.

Attempts to find the speaker's name from the beginning of the first line of each segment.

References:

-   https://www.w3.org/TR/webvtt1/
-   https://en.wikipedia.org/wiki/WebVTT

## Test Transcripts

Transcripts used for testing are excerpts from the following shows.

-   [Podcasting 2.0](https://podcastindex.org/podcast/920666)
    -   podcasting_20.srt
-   [Buzzcast](https://buzzcast.buzzsprout.com/231452/12364929-podcasts-finally-added-to-youtube-music)
    -   buzzcast.html
    -   buzzcast.srt
    -   buzzcast.json
-   [How to Start a Podcast](https://feeds.buzzsprout.com/1/2562823/)
    -   how_to_start_a_podcast.json
    -   how_to_start_a_podcast.html
-   [subtitle.js](https://github.com/gsantiago/subtitle.js)
    -   LaLaLand.vtt
    -   LaLaLand.json
