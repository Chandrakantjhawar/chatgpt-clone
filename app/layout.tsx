import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'ChatGPT Clone (Mobile)',
  description: 'Next.js + tRPC + Supabase + Auth0 + Gemini',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="mb-3">
            <nav className="d-flex gap-3">
              <a href="/">Home</a>
              <a href="/api/auth/login">Login</a>
              <a href="/api/auth/logout">Logout</a>
            </nav>
          </header>

          <div id="app" className="mobile-shell container py-3">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
