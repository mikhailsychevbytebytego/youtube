const fs = require('fs');
const metadataStr = fs.readFileSync('ai-cache/paw-some-prankster-f8df4500/metadata.json', 'utf8');
const metadata = JSON.parse(metadataStr);
console.log(metadata.thumbnailUrl);
