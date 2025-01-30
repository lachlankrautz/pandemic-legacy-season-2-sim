#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning
import { boostrapCli } from "../bootstrap/bootstrap.ts";

void boostrapCli().run();
