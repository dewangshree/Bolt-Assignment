import React, { useState } from 'react';
import { Header } from './components/Header';
import { Registration } from './pages/Registration';
import { Checkout } from './pages/Checkout';

type Page = 'register' | 'checkout';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('register');

  return (
    <div className="page">
      <Header onClick={() => setPage('register')} />

      {/* Simple tab nav */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '4px',
          padding: '16px 20px 0',
          background: 'var(--color-bg)',
        }}
      >
        {(['register', 'checkout'] as Page[]).map((p) => (
          <button
            key={p}
            id={`nav-${p}`}
            onClick={() => setPage(p)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: page === p ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: page === p ? '#a5b4fc' : 'var(--color-text-muted)',
              border: page === p ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {p === 'register' ? '① Register' : '② Checkout'}
          </button>
        ))}
      </nav>

      {page === 'register' && <Registration onSuccess={() => setPage('checkout')} />}
      {page === 'checkout' && <Checkout onGoRegister={() => setPage('register')} />}
    </div>
  );
};

export default App;
