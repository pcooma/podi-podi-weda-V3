import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUsername, safeFilename } from "../src/identity.js";

test("normalizes usernames consistently", () => {
  assert.equal(normalizeUsername("  Sunil.Perera_28  "), "sunil.perera_28");
  assert.equal(normalizeUsername("SUNIL PERERA"), "sunilperera");
});

test("sanitizes filenames without losing the extension", () => {
  assert.equal(safeFilename("My NIC (front).jpg"), "My-NIC-front-.jpg");
  assert.equal(safeFilename("../../certificate.pdf"), "..-..-certificate.pdf");
});

