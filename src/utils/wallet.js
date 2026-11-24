// The app has exactly one spendable wallet. Legacy transactions may still carry old wallet ids / USD amounts.
export const txToIdr = (tx, usdRate) =>
  tx.wallet === 'paypal' || tx.currency === 'USD' ? tx.amount * (tx.exchangeRate || usdRate) : tx.amount;

// Effect of a transaction on the wallet balance (legacy wallet-to-wallet transfers are net zero)
export const walletDelta = (tx, usdRate) => {
  const idr = txToIdr(tx, usdRate);
  if (tx.type === 'income') return idr;
  if (tx.type === 'expense') return -idr;
  if (tx.type === 'transfer') return !tx.toWallet || tx.toWallet === 'investasi' ? -idr : 0;
  return 0;
};

/**
 * Balance for an account moving from the old multi-wallet model to the single wallet.
 * Uses the saved wallet rows, or the transactions when there are none.
 * Returns null when there are no rows and the transactions failed to load: the balance is
 * unknown, so nothing should be written.
 */
export const legacyWalletTotal = (walletBalances, transactions, usdRate) => {
  const rows = Object.entries(walletBalances);
  if (rows.length === 0) {
    return transactions ? transactions.reduce((sum, tx) => sum + walletDelta(tx, usdRate), 0) : null;
  }
  return rows.reduce((sum, [id, balance]) => {
    // SeaBank replaced ShopeePay and took over its balance, so don't count it twice
    if (id === 'shopeepay' && walletBalances.seabank) return sum;
    return sum + (id === 'paypal' ? balance * usdRate : balance);
  }, 0);
};
