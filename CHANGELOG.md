# transcriptator 1.1.0

New `Options`:

-   `combineEqualTimes` and `combineEqualTimesSeparator`: Combine segments if the `startTime`, `endTime`, and `speaker` match between the current and prior segments. ([Resolves #19](https://github.com/stevencrader/transcriptator/issues/19))
-   `speakerChange`: Only include `speaker` when speaker changes. ([Resolves #20](https://github.com/stevencrader/transcriptator/issues/20))
-   `combineSegments` and `combineSegmentsLength`: Replaces `combineSingleWordSegments` function. Combine segments where speaker is the same and concatenated `body` fits in the `combineSegmentsLength`
-   Change `timestampFormatter` to `TimestampFormatter`

**Breaking Changes:**

-   `combineSingleWordSegments` function is now handled by the `combineSegments` and `combineSegmentsLength` options
-   `timestampFormatter` is now `TimestampFormatter`

# transcriptator 1.0.6

-   Add step to replace main entry in distributed package.json

# transcriptator 1.0.5

-   For HTML transcripts, just use the next segment's startTime for the endTime instead of adding the startTime to
    it. ([Resolves #14](https://github.com/stevencrader/transcriptator/issues/14))

# transcriptator 1.0.4

-   Add support for specifying custom timestamp
    formatter ([Resolves #11](https://github.com/stevencrader/transcriptator/issues/11))
-   Make `Segment`, `TranscriptFormat`, `TimestampFormatter`, `FormatterCallback` available from the root

# transcriptator 1.0.3

-   Update HTML support to not require html or body
    elements. ([Resolves #5](https://github.com/stevencrader/transcriptator/issues/5))
    -   Allow any order of elements.
    -   Make cite element optional.
-   Add formatted start and end times to Segment
    type ([Resolves #6](https://github.com/stevencrader/transcriptator/issues/6))

# transcriptator 1.0.2

Rework build and publish steps so that published data does not use dist folder

# transcriptator 1.0.1

Update version in order to publish updated README

# transcriptator 1.0.0

Initial version
