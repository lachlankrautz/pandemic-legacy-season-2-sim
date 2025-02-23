#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning --loader import-jsx
import { boostrapCli } from "../bootstrap/bootstrap.ts";

void boostrapCli().run(process.argv);
