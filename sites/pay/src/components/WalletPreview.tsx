export default function WalletPreview() {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-sm mx-auto"
      style={{
        background: 'linear-gradient(145deg, #111827, #0a0a0a)',
        border: '1px solid rgba(5,150,105,0.3)',
        boxShadow: '0 0 40px rgba(5,150,105,0.1)',
      }}
    >
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(5,150,105,0.15)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: '#9ca3af' }}>Solde total</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(5,150,105,0.15)', color: '#059669' }}
          >
            +2,4%
          </span>
        </div>
        <p className="text-3xl font-bold" style={{ color: '#f9fafb' }}>1&nbsp;248,50&nbsp;€</p>
        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>≈ 1 350,22 USD</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {[
          { label: 'Envoyer', color: '#059669' },
          { label: 'Recevoir', color: '#047857' },
          { label: 'Recharger', color: '#065f46' },
        ].map((action) => (
          <div
            key={action.label}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl cursor-pointer"
            style={{ background: `${action.color}22` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: action.color }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#d1fae5' }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="px-4 pb-5">
        <p className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>Transactions récentes</p>
        {[
          { emoji: '🛒', label: 'Carrefour', date: 'Aujourd\'hui', amount: '-34,20 €', color: '#ef4444' },
          { emoji: '💸', label: 'Sophie M.', date: 'Hier', amount: '+50,00 €', color: '#059669' },
          { emoji: '☕', label: 'Starbucks', date: '14 mars', amount: '-6,80 €', color: '#ef4444' },
        ].map((tx, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5"
            style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>{tx.emoji}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: '#f9fafb' }}>{tx.label}</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{tx.date}</p>
              </div>
            </div>
            <span className="text-sm font-bold" style={{ color: tx.color }}>{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
