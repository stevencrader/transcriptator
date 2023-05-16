import { beforeEach } from "@jest/globals"

import { Options } from "../src"

beforeEach(() => {
    Options.restoreDefaultSettings()
})
