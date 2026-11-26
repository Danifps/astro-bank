import assert from 'node:assert/strict';
import test from 'node:test';
import { detectDocumentType } from './documentUpload.js';

const validSignatures = [
  [Buffer.from('%PDF-1.7'), { ext: 'pdf', mime: 'application/pdf' }],
  [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), { ext: 'png', mime: 'image/png' }],
  [Buffer.from([0xff, 0xd8, 0xff, 0xe0]), { ext: 'jpg', mime: 'image/jpeg' }],
  [Buffer.from('RIFF0000WEBP'), { ext: 'webp', mime: 'image/webp' }]
];

for (const [signature, expectedType] of validSignatures) {
  test(`detects ${expectedType.ext} from its content signature`, () => {
    assert.deepEqual(detectDocumentType(signature), expectedType);
  });
}

test('rejects unknown and incomplete signatures', () => {
  assert.equal(detectDocumentType(Buffer.from('not a document')), null);
  assert.equal(detectDocumentType(Buffer.from([0x89, 0x50, 0x4e])), null);
  assert.equal(detectDocumentType(Buffer.from('RIFF0000')), null);
});
