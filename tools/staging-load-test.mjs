// Synthetic, non-email load test for a staging Apps Script deployment.
// It exercises health only; it never creates users, sends OTP mail, or writes Drive data.
const base = process.argv[2];
if (!base) throw new Error('Usage: node tools/staging-load-test.mjs <staging-exec-url> [count]');
const count = Math.min(100, Math.max(1, Number(process.argv[3] || 20)));
const results = await Promise.all(Array.from({length: count}, async () => {
  const started = Date.now();
  const response = await fetch(base + '?action=health');
  return {status: response.status, ms: Date.now() - started};
}));
const ok = results.filter((item) => item.status === 200).length;
console.log(JSON.stringify({requests: count, successful: ok, failed: count - ok, maxMs: Math.max(...results.map((item) => item.ms))}, null, 2));
if (ok !== count) process.exitCode = 1;
