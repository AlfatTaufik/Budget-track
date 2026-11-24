import test from 'node:test';
import assert from 'node:assert/strict';
import { legacyWalletTotal, walletDelta } from '../src/utils/wallet.js';

const RATE = 16000;

test('adds up the old wallets', () => {
  assert.equal(legacyWalletTotal({ cash: 50000, bca: 200000.5 }, [], RATE), 250000.5);
});

test('converts PayPal from USD', () => {
  assert.equal(legacyWalletTotal({ cash: 1000, paypal: 10 }, [], RATE), 161000);
});

test('ignores ShopeePay when SeaBank already replaced it', () => {
  assert.equal(legacyWalletTotal({ shopeepay: 70000, seabank: 70000 }, [], RATE), 70000);
  assert.equal(legacyWalletTotal({ shopeepay: 70000 }, [], RATE), 70000);
});

test('wallet rows win over the transaction history', () => {
  const txs = [{ type: 'income', amount: 999, wallet: 'cash' }];
  assert.equal(legacyWalletTotal({ cash: 500 }, txs, RATE), 500);
});

test('without wallet rows, derives the balance from transactions', () => {
  const txs = [
    { type: 'income', amount: 100000, wallet: 'cash' },
    { type: 'expense', amount: 30000, wallet: 'cash' },
    { type: 'transfer', amount: 20000, wallet: 'cash', toWallet: 'bca' },
    { type: 'transfer', amount: 10000, wallet: 'cash', toWallet: 'investasi' },
    { type: 'income', amount: 2, wallet: 'paypal' },
  ];
  assert.equal(legacyWalletTotal({}, txs, RATE), 92000);
});

test('a new account starts at zero', () => {
  assert.equal(legacyWalletTotal({}, [], RATE), 0);
});

test('refuses to guess when the needed transactions did not load', () => {
  assert.equal(legacyWalletTotal({}, null, RATE), null);
  assert.equal(legacyWalletTotal({ cash: 5 }, null, RATE), 5);
});

test('walletDelta uses the exchange rate saved with the transaction', () => {
  assert.equal(walletDelta({ type: 'expense', amount: 2, currency: 'USD', exchangeRate: 15000 }, RATE), -30000);
});
