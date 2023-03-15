# Contributing

Thank you for your interest in contributing to this project.

## Issues/Feature Requests

If you have encountered an issue or would like a feature to be added, please create a [GitHub Issue](https://github.com/stevencrader/transcriptator/issues) for the project.

## Code Contributions

Before making any changes or building the project locally, install [NodeJS 16.17.1](https://nodejs.org/) and [yarn 3.4.1](https://yarnpkg.com/getting-started/install) or newer.

1. For this repository
2. Clone the forked copy of the project
3. Change to the project directory
4. Before making changes, pull the latest changes from the upstream repo
5. Create a new branch
6. Make any changes
7. Track changes
8. Commit changes to branch
9. Push changes to the forked project
10. When all changes are complete, create a [Pull Request](https://github.com/stevencrader/transcriptator/pulls) to merge the changes to the `master` branch.

    - Add a title and description of the changes
    - If fixing an open Issue, reference the issue number using the GitHub syntax: `#2`
    - For a Pull Request to be accepted, all GitHub actions must pass.
        - Run the `lint-fix` script and resolve any issues.
        - Run the `test` script and resolve any failing tests.
            - If new features added, write new tests to cover the changes.
            - To get a coverage report run the `test:coverage` script
