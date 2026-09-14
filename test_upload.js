// simulate the chunking logic
const base64Data = "A".repeat(5000000);
const CHUNK_SIZE = 800000;
const numChunks = Math.ceil(base64Data.length / CHUNK_SIZE);
console.log("Chunks:", numChunks);
for (let i = 0; i < numChunks; i++) {
  const chunk = base64Data.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
  console.log("Chunk", i, "length:", chunk.length);
}
