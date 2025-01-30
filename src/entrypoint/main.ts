#!/usr/bin/env -S node --experimental-strip-types --experimental-transform-types --disable-warning=ExperimentalWarning
import { boostrapCli } from "../bootstrap/bootstrap.ts";

void boostrapCli().run();
