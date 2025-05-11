import process from "node:process";
import cachedTransform, { cacheKeyFromSource } from "./cache.js";
import transform from "./transform.js";
import fs from "node:fs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const load = async (url, _context, nextLoad) => {
    if (!url.endsWith(".tsx") || url.includes("node_modules")) {
        return nextLoad(url);
    }

    let result;
    try {
        const source = fs.readFileSync(url.replace("file://", ""));
        result = {
            source,
            format: "module",
        };
    } catch (error) {
        console.error("we did not load it", { cause: { error } });
        throw error;
    }

    if (!result.source) {
        return result;
    }

    const source = result.source.toString();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const useCache = process.env.IMPORT_JSX_CACHE !== "0" && process.env.IMPORT_JSX_CACHE !== "false";

    const cacheKey = cacheKeyFromSource(source);

    try {
        const transformedSource = await cachedTransform(
            () => {
                return transform(source, url);
            },
            {
                enabled: useCache,
                key: cacheKey,
            },
        );

        return {
            source: transformedSource,
            format: "module",
            shortCircuit: true,
        };
    } catch (e) {
        console.error(e);
        throw e;
    }
};
