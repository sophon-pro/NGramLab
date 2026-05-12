// components/layout/ThemeScript.tsx
// Inline script that sets the initial theme class before React hydrates.
// This prevents the "flash of wrong theme" on initial page load.

export function ThemeScript() {
  const code = `
    (function() {
      try {
        var stored = localStorage.getItem('ngramlab-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored || (prefersDark ? 'dark' : 'light');
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
