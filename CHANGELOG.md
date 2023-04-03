# transcriptator 1.0.5

-   For HTML transcripts, just use the next segment's startTime for the endTime instead of adding the startTime to it. ([Resolves #14](https://github.com/stevencrader/transcriptator/issues/14))

# transcriptator 1.0.4

-   Add support for specifying custom timestamp formatter ([Resolves #11](https://github.com/stevencrader/transcriptator/issues/11))
-   Make `Segment`, `TranscriptFormat`, `timestampFormatter`, `FormatterCallback` available from the root

# transcriptator 1.0.3

-   Update HTML support to not require html or body elements. ([Resolves #5](https://github.com/stevencrader/transcriptator/issues/5))
    -   Allow any order of elements.
    -   Make cite element optional.
-   Add formatted start and end times to Segment type ([Resolves #6](https://github.com/stevencrader/transcriptator/issues/6))

# transcriptator 1.0.2

Rework build and publish steps so that published data does not use dist folder

# transcriptator 1.0.1

Update version in order to publish updated README

# transcriptator 1.0.0

Initial version
