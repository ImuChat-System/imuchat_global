import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Centre d'Aide ImuChat",
  description: 'FAQ, guides, tutoriels et support pour ImuChat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
