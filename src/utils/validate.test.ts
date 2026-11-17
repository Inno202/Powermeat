import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, isValidCell, isValidEmail, uploadProblem, safeImageUrl, proofKind, LIMITS } from './validate';

test('cleanText trims, strips control characters and caps length', () => {
  assert.equal(cleanText('  Thabo\u0000 M\u0007 ', 50), 'Thabo M');
  assert.equal(cleanText('x'.repeat(500), LIMITS.name).length, LIMITS.name);
});

test('isValidCell accepts South African numbers only', () => {
  assert.ok(isValidCell('082 123 4567'));
  assert.ok(isValidCell('+27 82 123 4567'));
  assert.ok(!isValidCell('12345'));
  assert.ok(!isValidCell('082 123 4567 999'));
  assert.ok(!isValidCell('call me'));
});

test('isValidEmail rejects malformed addresses', () => {
  assert.ok(isValidEmail('thabo@example.co.za'));
  assert.ok(!isValidEmail('thabo@'));
  assert.ok(!isValidEmail('a b@example.com'));
});

test('uploadProblem allows only small photos and PDFs', () => {
  assert.equal(uploadProblem({ type: 'image/jpeg', size: 1000 }), null);
  assert.equal(uploadProblem({ type: 'application/pdf', size: 1000 }), null);
  assert.ok(uploadProblem({ type: 'text/html', size: 1000 }));
  assert.ok(uploadProblem({ type: 'image/svg+xml', size: 1000 }));
  assert.ok(uploadProblem({ type: 'image/png', size: LIMITS.uploadBytes + 1 }));
});

test('safeImageUrl keeps https links and drops everything else', () => {
  assert.equal(safeImageUrl('https://example.com/a.jpg'), 'https://example.com/a.jpg');
  assert.equal(safeImageUrl('http://example.com/a.jpg'), undefined);
  assert.equal(safeImageUrl('javascript:alert(1)'), undefined);
  assert.equal(safeImageUrl('data:text/html;base64,AAAA'), undefined);
  assert.equal(safeImageUrl('not a link'), undefined);
});

test('proofKind recognises only photos and PDFs', () => {
  assert.equal(proofKind('data:image/png;base64,AAAA'), 'image');
  assert.equal(proofKind('data:application/pdf;base64,AAAA'), 'pdf');
  assert.equal(proofKind('data:text/html;base64,AAAA'), null);
  assert.equal(proofKind('data:image/svg+xml;base64,AAAA'), null);
  assert.equal(proofKind('https://example.com/x.png'), null);
});
