# UI guidelines

Use Tailwind utilities and semantic design tokens. Build mobile-first layouts and verify small and desktop viewports. Merge conditional classes with `cn()`.

Use semantic HTML before ARIA. Every field requires a visible label, icon-only buttons require an accessible name, and decorative icons use `aria-hidden`. Preserve keyboard navigation, visible focus, disabled states, and sufficient contrast.

Use existing primitives in `src/components/ui` before creating new ones. Feature-specific composition remains inside its feature. Prefer composition over large prop surfaces; use CVA variants instead of accumulating boolean style props.

Animations must be brief and respect `prefers-reduced-motion`. Images need explicit dimensions and meaningful alternative text unless decorative. Test loading, empty, error, success, and narrow-screen states for data-driven UI.
