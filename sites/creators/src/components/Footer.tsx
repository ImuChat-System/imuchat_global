import { Link } from '@/navigation';

export function Footer() {
  return (
    <footer className="border-t mt-16 py-10" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
              Creators
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li>
                <Link href="/monetization" className="hover:text-pink-400 transition-colors">
                  Monétisation
                </Link>
              </li>
              <li>
                <Link href="/imufeed" className="hover:text-pink-400 transition-colors">
                  ImuFeed
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-pink-400 transition-colors">
                  Outils
                </Link>
              </li>
              <li>
                <Link href="/live" className="hover:text-pink-400 transition-colors">
                  Live
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-pink-400 transition-colors">
                  Programme créateur
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
              Écosystème
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li>
                <a
                  href="https://app.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Application ImuChat
                </a>
              </li>
              <li>
                <a
                  href="https://store.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Abonnements
                </a>
              </li>
              <li>
                <a
                  href="https://store.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Store
                </a>
              </li>
              <li>
                <a
                  href="https://pay.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  ImuPay
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
              Communauté
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li>
                <a
                  href="https://community.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Forum
                </a>
              </li>
              <li>
                <a
                  href="https://developers.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Développeurs
                </a>
              </li>
              <li>
                <Link href="/success" className="hover:text-pink-400 transition-colors">
                  Stories de créateurs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
              Aide
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-muted)' }}>
              <li>
                <Link href="/faq" className="hover:text-pink-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-pink-400 transition-colors">
                  CGU Créateurs
                </Link>
              </li>
              <li>
                <a
                  href="https://help.imuchat.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  Centre d&apos;aide
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            © 2026 ImuChat — Plateforme Créateurs
          </p>
          <a
            href="https://imuchat.app"
            className="text-sm hover:text-pink-400 transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            imuchat.app
          </a>
        </div>
      </div>
    </footer>
  );
}
