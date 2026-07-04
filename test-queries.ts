import { getChannelBySlug } from "./src/lib/queries.js";
getChannelBySlug('whiskers-wonders').then(console.log).catch(console.error).finally(() => process.exit(0));
