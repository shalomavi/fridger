# Frontend Design System Review — Findings & Remediation Plan

Review date: 2026-09-30. Scope:
- **Read in full:** `src/index.css`, everything in `src/shared/ui/`,
  `src/shared/alerts/`, `src/shared/useTheme.tsx`, `src/app/routes.tsx`,
  `index.html`, and the shopping row components.
- **Checked by searching the codebase:** raw colors, the type, radius and
  z-index scales, focus styles, ARIA usage, reduced-motion handling, and
  `<button>` vs `<Button>`.

This complements `design-review-plan.md`, which covers backend, data and
security. Contrast ratios below are approximate (computed from Tailwind v4's
palette). Confirm them with a checker, e.g. the DevTools contrast picker,
before and after each fix.

---

## Part 1 — Findings

### Scorecard

| Best-practice area | Verdict |
|---|---|
| Design tokens (color) | 🟡 Semantic tokens exist and are used almost everywhere, but dark values are defined 3 times and some theming is done in JS |
| Design tokens (shadow, type, radius, motion, z-index) | 🔴 No tokens. Shadows are JS string constants; the rest are ad-hoc Tailwind steps |
| Theming (light/dark) | 🟡 Works, but 4 components branch on `theme` in React instead of letting CSS variables switch |
| Component library | 🟡 Good primitives (`Button`, `Input`, `Select`, `Surface`), but under-used (39 raw `<button>` vs 22 `<Button>`) and missing Dialog, Checkbox and IconButton |
| Accessibility | 🔴 Pinch-zoom disabled, no visible focus on several controls, a dialog with no dialog semantics, toasts screen readers don't announce, contrast failures |
| Internationalization / RTL | 🟡 Logical properties (`ps-`, `ms-`, `text-start`) are used well, but `dir`/`lang` are set per-component instead of on `<html>` |
| Motion | 🟡 A consistent enter/exit language, but only the WebGL backdrop respects `prefers-reduced-motion` |
| Mobile / PWA | 🟡 `viewport-fit=cover` without safe-area insets; some touch targets under 44px |
| Documentation & governance | 🟡 Excellent inline comments; no design-system reference page, no a11y lint rules |

### What's already good

- **Semantic color tokens.** `bg-surface`, `text-text-muted`, `text-warning`
  and friends are used almost everywhere. Only 12 raw palette classes exist
  in the whole of `src/` (11× `text-white`, 1× `text-teal-500`), which is
  unusually disciplined.
- **Thin primitive wrappers.** `Button`/`Input`/`Surface` wrap native
  elements and pass everything else through, so the native semantics stay
  intact.
- **RTL is done correctly at the utility level.** Logical properties are
  used throughout: `ps-8`, `ms-auto`, `inset-s-*`, `text-start`. There are
  no hard-coded `left`/`right` except in `ScrollToTopButton`, which is
  centered, so it doesn't matter there.
- **Icons are inline SVG components using `currentColor`**, so they follow
  text tokens automatically.
- **One coherent motion language.** `item-in`/`item-out`/`toast-in` share
  the same curve and opacity timing.
- **Theme is applied before first paint** (in `index.html`), with a sensible
  "system preference until the user picks one" default.
- **Placeholder and autofill colors are tokenized.** Most apps miss this.

### T — Tokens

**T1. Dark theme values defined three times.**
- `index.css` repeats the full dark palette in `@theme` (lines 17–30), under
  `@media (prefers-color-scheme: dark)` (73–101), and under
  `[data-theme='dark']` (103–129).
- The `@theme` block also *defaults to dark* while `:root` defaults to
  light. That's confusing, and any edit has to touch three places.

**T2. Shadow system lives in JS strings, not tokens.**
- `elevation.ts` has 7 hand-written `shadow-[…]` literals that duplicate
  each other's numbers.
- Its own comments explain why: Tailwind can't see strings built at runtime.
  Tailwind v4's answer is `--shadow-*` tokens in `@theme`, which generate
  real utilities (`shadow-raised`, `shadow-field`, …) that the scanner does
  see.

**T3. No type, radius, spacing-role, motion or z-index tokens.**
- **Type sizes:** `text-sm` 61×, `text-xs` 20×, plus `lg`, `xl`, `2xl`,
  `3xl` and `base` mixed. There are no named roles (title / body / caption
  / label).
- **Radius:** `rounded-lg` 19×, `rounded-md` 11×, `rounded` 4×,
  `rounded-xl` 1×, `rounded-full` 4×. Buttons use `rounded-lg`, the dialog
  buttons `rounded-md`, the inline editors `rounded`, and toasts
  `rounded-xl`.
- **Motion:** `duration-300` plus `ease-out`/`ease-in` is repeated inline
  on every interactive element, with no `--duration-*` or `--ease-*`
  tokens.
- **Z-index:** `z-10/20/30/50` are magic numbers. Dialog and toasts are both
  `z-50`.

**T4. Fonts: two tokens hold the same value.**
- `--font-ui-he` and `--font-ui-en` are both `'Varela Round'`.
- The `lang === 'he' ? 'font-ui-he' : 'font-ui-en'` ternary is repeated in
  5 places.

**T5. Primary color identical in both themes.**
- `--color-primary` is `teal-700` in light and dark. As a *fill* behind
  white text that's fine (~5.5:1).
- As *text or an icon on dark surfaces* it fails (see A5). That's why
  `titleGlow.ts` falls back to a raw `text-teal-500` in dark mode.
- The token set is missing a "primary as foreground" role.

### TH — Theming

**TH1. Theme branching in React instead of CSS.**
- `Button.tsx` (`surface` variant swaps to `secondary` in dark),
  `titleGlow.ts` (`titleTextClass`, `titleGlow`), `inactiveElevationShadow`,
  and `routes.tsx`'s curried `tabClass(theme)` all read `useTheme()` just to
  choose a class.
- As a result, these components re-render on theme change, and theme logic
  is split between CSS and TS.
- Best practice is that components reference *roles* (`bg-button-surface`,
  `shadow-inactive`, `text-title`) and only the token layer knows about
  themes.

### C — Component library

**C1. Primitives under-used.**
- There are 39 raw `<button>`s against 22 `<Button>`s. `ConfirmDialog`,
  `ToastContainer`, `DeleteButton`, `ExpiryEditor`, `ShoppingRow`, and the
  sign-out link each restyle buttons by hand.
- `rounded-md px-3 py-1.5 text-sm … active:scale-95` appears repeatedly.
- `Button` also leaves padding and size entirely to the caller, so there's
  no `size` scale.

**C2. Missing primitives:**
- **Dialog:** `ConfirmDialog` and `RecipeImportModal`/`ImportRecipeSheet`
  build overlays by hand.
- **Checkbox:** `ShoppingRow` builds one from a `<button>` and a `<span>`.
- **IconButton:** delete, scroll-to-top, and the toggles each size their own
  tap area.
- **Toast** isn't a primitive either; it's inline in the container.
- **InlineEditor:** `DetailsEditor`, `QuantityEditor` and `ExpiryEditor`
  repeat the same tap-to-edit shell (dotted-underline trigger → small
  `bg-surface-muted` input with `outline-none`).

**C3. Two select patterns.**
- `Select.tsx` is a custom listbox, built to theme the option hover color.
- `QuantityEditor` uses a native `<select>` overlaid with `opacity-0`.
- Pick one per context and document it. The native one is the better
  mobile experience; the custom one is prettier.

**C4. Shared component living in a feature.**
`DeleteButton` sits in `features/shopping/` but is imported by
`features/recipes/RecipeCard.tsx`. It belongs in `shared/ui/` (as an
`IconButton` + confirm).

### A — Accessibility (WCAG 2.2 AA)

**A1. Pinch-zoom disabled.** `index.html` has `maximum-scale=1` in the
viewport meta, which fails WCAG 1.4.4 (Resize Text). It's usually added to
stop iOS zooming into inputs. The proper fix for that is a 16px minimum font
size on inputs, not blocking zoom.

**A2. No visible keyboard focus on several controls.**
- `outline-none` with no replacement is used in `DetailsEditor`,
  `QuantityEditor` and `ExpiryEditor`.
- No component in the app uses `focus-visible:`.
- `Button` relies on the browser default outline, which is unthemed and
  nearly invisible on teal.

**A3. `ConfirmDialog` isn't a dialog.**
- It has no `role="dialog"`/`aria-modal`/`aria-labelledby`.
- It doesn't move focus into the dialog, trap it, close on Escape, or return
  focus afterwards.
- Screen-reader and keyboard users can interact with the page behind it.

**A4. Toasts aren't announced.**
- There's no `role="status"`/`aria-live` region, so "Item added / Undo" is
  silent to screen readers.
- The auto-dismiss timer with an Undo action also runs into WCAG 2.2.1
  (Timing Adjustable). Pause the countdown on hover/focus, and keep the
  Undo available long enough.

**A5. Contrast failures (approximate, verify):**

| Where | Pair | ≈ Ratio | Needs |
|---|---|---|---|
| Toast "Undo" button, dark | `text-primary` (teal-700) on `bg-surface-muted` (slate-700) | ~1.9:1 | 4.5:1 |
| Toast/row check icons, dark | `text-primary` icon on dark glass | ~2:1 | 3:1 (non-text) |
| Expiring-soon date, light | `text-warning` (amber-600) on white | ~3.1:1 | 4.5:1 (it's `text-sm`) |
| Scroll-to-top, light | `text-white` icon on `bg-primary/15` over a light gradient | ~1.3:1 | 3:1 |
| `text-text-subtle` (slate-500) on the teal-100 end of the light gradient | | ~4.3:1 | 4.5:1 |

The translucent "glass" surfaces (`bg-surface/10` toasts, `bg-surface/5`
fields, `bg-surface/70` dialog) make contrast depend on whatever sits behind
them. That's the root cause of several of these.

**A6. Custom controls missing their roles.**
- `ShoppingRow`'s check-off `<button>` has no `role="checkbox"` +
  `aria-checked`, or `aria-pressed`, so its state isn't exposed.
- In `Select.tsx`:
  - The options have no `id` and there's no `aria-activedescendant`, so
    arrowing through the list is silent.
  - `aria-label` on the trigger *replaces* the visible selected value in the
    accessible name.
  - There's no Home/End or typeahead, Tab doesn't close the list, and focus
    doesn't return to the trigger after picking.

**A7. Page language not exposed.**
- `<html lang="en">` is never updated, so Hebrew content is read with an
  English voice.
- `dir` is set on the `Layout` div, and separately again in `ConfirmDialog`
  and `ToastContainer` because they sit outside it.
- Setting `lang` and `dir` on `document.documentElement` fixes both issues
  and removes the duplication.

**A8. Touch targets.** The delete icon (`p-1`, ~28–32px), the inline editor
triggers (plain `text-sm` links), and the sign-out text link are below
WCAG 2.5.8's 24px minimum spacing in places, and well below the 44–48px
mobile guideline.

**A9. No a11y linting.** `.oxlintrc.json` enables `react`, `typescript` and
`oxc` but not oxlint's built-in `jsx-a11y` plugin. That plugin would catch
A2/A3/A6-style issues automatically.

### M — Motion

**M1. `prefers-reduced-motion` is ignored by CSS animations.**
- Only `ghostFibers/renderLoop.ts` checks it.
- `item-in`/`item-out`/`toast-in`/`icon-fill`, `active:scale-95`,
  `behavior: 'smooth'` scrolling, and the toast countdown all run
  regardless.

**M2. Animation durations duplicated between CSS and JS.**
- `ShoppingRow` hard-codes `300ms` inline plus a `600ms` safety timeout.
- `index.css` has `300ms`, and `TOAST_DURATION_MS` lives in TS.
- Make these one token each (see T3).

### P — Mobile / PWA layout

**P1. Safe-area insets unused.**
- `viewport-fit=cover` is set, but nothing uses `env(safe-area-inset-*)`.
- In the installed PWA, the header can sit under the status bar or cutout,
  and `ScrollToTopButton` (`bottom-6`) can collide with the gesture bar.

**P2. Heavy use of glass effects.**
- `backdrop-blur` is used on fields, the dialog, toasts and scroll-to-top.
- It's expensive on low-end Android during scrolling. Combined with A5, it's
  worth limiting to one or two surfaces, e.g. overlays only.

### D — Documentation & governance

**D1. No design-system reference.**
- Rationale is excellent but scattered across component comments.
- There's no single page listing tokens, their roles, the components and
  when to use each.

**D2. No guardrail against drift.**
- Nothing stops new raw palette classes, arbitrary `shadow-[…]`, or a new
  hand-styled `<button>`.

---

## Part 2 — Remediation plan

Rules for every step:
- Keep CLAUDE.md's limits: files ≤150 lines, and no new dependencies without
  asking.
- Each step is a self-contained commit.
- Verify visually in both themes and both languages on the deployed app.
- Check contrast with the DevTools color picker.

### Phase 1 — Accessibility blockers (small, high value)

**1.1 Re-enable zoom.**
- `index.html`: remove `maximum-scale=1` from the viewport meta.
- Make sure every text input is at least `text-base` (16px), so iOS doesn't
  auto-zoom. The inline editors are `text-sm` today: bump the *input* to
  `text-base` and keep the trigger text `text-sm`.

**1.2 Set language and direction globally.**
- In a small `useDocumentLocale(lang)` effect called once from `Layout`, set
  `document.documentElement.lang = lang` and
  `document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'`.
- Reset both to `en`/`ltr` on the auth/setup screens.
- Remove the per-component `dir=` from `Layout`, `ConfirmDialog` and
  `ToastContainer`.

**1.3 Visible focus everywhere.**
- Add one global rule in `index.css`:
  ```css
  :where(button, a, input, select, textarea, [tabindex]):focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
  ```
  Add `--color-focus` per theme: `teal-700` in light, `teal-400` in dark.
- Remove `outline-none` from `DetailsEditor`, `QuantityEditor` and
  `ExpiryEditor`.
- In `fieldClass`, change `focus:` to `focus-visible:`, and keep its
  shadow-based ring.

**1.4 Announce toasts.**
- Wrap `ToastContainer`'s list in `role="status" aria-live="polite"`.
  Error toasts use `role="alert"`.
- Pause the dismiss timer and the countdown animation
  (`animation-play-state: paused`) while the toast is hovered or has focus
  inside it.

**1.5 Fix the contrast failures from A5.**
- Add a foreground role token, `--color-primary-fg`: `teal-700` in light,
  `teal-400` in dark (≈ 7:1 on slate-800). Use `text-primary-fg` for the
  toast Undo button, the check icons, and `titleTextClass` (removing the
  raw `text-teal-500`).
- Change light `--color-warning` to `amber-700` (≈ 4.9:1 on white).
- In light theme, give `ScrollToTopButton` a solid `bg-primary`, or keep the
  glass but use `text-primary-fg`.
- Move light `--color-text-subtle` from `slate-500` to `slate-600` where it
  sits on the gradient, or darken the gradient's teal-100 stop.

**1.6 Expose control state.**
- `ShoppingRow` (and `PantryRow`'s equivalent, if it has one): add
  `role="checkbox" aria-checked={purchased}` on the toggle button. Better
  still, use the new `Checkbox` from 3.2.
- `Select.tsx`:
  - Give each option `id={`${id}-opt-${i}`}` and the listbox
    `aria-activedescendant`.
  - Replace the trigger's `aria-label` with `aria-labelledby` (a visually
    hidden label plus the value span), so the chosen value is announced.
  - Add Home/End keys, close on Tab and blur, and return focus to the
    trigger after a choice.

**1.7 Turn on a11y lint.**
- `.oxlintrc.json`: add `"jsx-a11y"` to `plugins`.
- Start with its recommended rules as `warn`, then fix or triage. The user
  runs `npm run lint` locally.

### Phase 2 — Token layer (removes the JS theming)

**2.1 Define each theme once.**
Recommended: CSS `light-dark()`. Each token is written once, with both of
its values:
```css
:root                      { color-scheme: light dark; }
:root[data-theme='light']  { color-scheme: light; }
:root[data-theme='dark']   { color-scheme: dark; }

@theme {
  --color-bg: light-dark(var(--color-slate-50), var(--color-slate-900));
  --color-surface: light-dark(var(--color-white), var(--color-slate-800));
  /* …one line per token… */
}
```
- `color-scheme` decides which value applies, and it follows the OS
  preference automatically unless `data-theme` pins it.
- This removes both dark blocks and the `@theme`-defaults-to-dark
  confusion.
- `light-dark()` only works for colors. The gradient and the per-theme
  shadows (2.2) keep one small `[data-theme='dark']` + `@media` pair.
- It's supported in Chrome/Android 123+, which fits this Android-first PWA.

**2.2 Shadow tokens.**
Move `elevation.ts` into `@theme`:
```css
@theme {
  --shadow-raised:   inset 0 2px 0 rgb(255 255 255 / .25), inset 0 -2px 0 rgb(0 0 0 / .25), 0 2px 4px rgb(0 0 0 / .3), 0 8px 20px rgb(0 0 0 / .35);
  --shadow-button:   inset 0 -2px 0 rgb(0 0 0 / .25), 0 2px 5px 2px rgb(0 0 0 / .2), 0 10px 24px 6px rgb(0 0 0 / .24);
  --shadow-field:    inset 0 -2px 0 rgb(0 0 0 / .35), 0 2px 5px rgb(0 0 0 / .2), 0 10px 24px rgb(0 0 0 / .24);
  --shadow-pressed:  inset 0 3px 6px rgb(0 0 0 / .45), inset 0 1px 2px rgb(0 0 0 / .3);
  --shadow-glow:     0 0 14px color-mix(in srgb, var(--color-primary) 35%, transparent);
  --shadow-inactive: var(--shadow-inactive-themed);
}
```
- Set `--shadow-inactive-themed` per theme in the `:root` and dark blocks.
  This replaces `inactiveElevationShadow`'s `Record<Theme, …>`.
- Components then use `shadow-raised`, `shadow-button`, `shadow-field`,
  `focus-visible:shadow-[var(--shadow-field),0_0_0_2px_var(--color-focus)]`
  (a single arbitrary value is fine here), and so on.
- Delete `elevation.ts`, or reduce it to nothing.

**2.3 Remove `useTheme()` from styling.**
- `Button`: add a `--color-button-surface` token (`surface` in light,
  `surface-muted` in dark) and use `bg-button-surface`.
- `titleGlow.ts`: add `--color-title` and `--title-glow`
  (a `drop-shadow` list per theme) and use a `.text-title` utility via
  `@utility`.
- `routes.tsx`: `tabClass` no longer needs `theme`.
- Afterwards, `useTheme()` should only be used by `ThemeToggle` and
  `AuthBackdrop` (WebGL needs real color values).

**2.4 Scale tokens.**
In `@theme`:
- **Radius roles:** `--radius-control` (lg), `--radius-chip` (md),
  `--radius-card` (lg), `--radius-overlay` (xl). Replace the bare `rounded`
  / `rounded-md` mix.
- **Type roles:** use `@utility` classes `text-title` (2xl/semibold),
  `text-heading` (lg/medium), `text-body` (base), `text-label` (sm),
  `text-caption` (xs). Then migrate call sites gradually; not in one big
  pass, per CLAUDE.md's scope rule.
- **Motion:** `--duration-fast: 150ms`, `--duration-base: 300ms`,
  `--ease-out`, `--ease-in`. Reference them from the keyframe utilities and
  from JS via `getComputedStyle` where timing matters (`ShoppingRow`), or
  keep one shared TS constant *and* one CSS variable, with a comment tying
  them together.
- **Z-index:** `--z-sticky: 10`, `--z-popover: 20`, `--z-fab: 30`,
  `--z-toast: 50`, `--z-dialog: 60`. Toasts should sit above or below the
  dialog on purpose.

**2.5 Collapse the font tokens.**
- Use one `--font-ui` (Varela Round covers both scripts).
- Keep `--font-list-he`/`--font-list-en` (they differ), and pick them with
  the existing `isHebrewText()`.
- Delete the 5 `lang === 'he' ? 'font-ui-he' : 'font-ui-en'` ternaries and
  put `font-ui` on `body`.

### Phase 3 — Component library

**3.1 `Button` gets `size` and `tone`, and becomes the only button.**
- Sizes `sm | md | lg` (padding, text role, min-height 44px for `md`/`lg`).
- Variants `primary | surface | secondary | danger | ghost`.
- Migrate `ConfirmDialog`, `ToastContainer`'s Undo, sign-out (`ghost`), and
  the other hand-styled buttons. `active:scale-95` and the transition live
  only here.

**3.2 New primitives in `src/shared/ui/`, each ≤150 lines:**
- **`IconButton`:** `aria-label` required, 44×44 hit area even when the icon
  is 20px (padding or `::before` expansion). Used by delete, scroll-to-top
  and the toggles.
- **`Checkbox`:** round visual as today, with native `<input type="checkbox">`
  semantics (visually hidden input plus a styled span), so role, state and
  keyboard handling come for free.
- **`Dialog`:** built on native `<dialog>` with `showModal()`, which gives
  focus trapping, Escape, the `::backdrop` and `aria-modal` for free. Title
  goes in `aria-labelledby`. `ConfirmDialog`, `RecipeImportModal` and
  `ImportRecipeSheet` then use it.
- **`InlineEditor`:** the shared tap-to-edit shell for `DetailsEditor`,
  `QuantityEditor` and `ExpiryEditor` (trigger styling, focus, commit on
  blur or Enter, cancel on Escape).
- **`Toast`:** a single-toast component that `ToastContainer` maps over.

**3.3 Move `DeleteButton` to `shared/ui/`** as `ConfirmIconButton`, or as
`IconButton` plus a `useConfirm` call at the call site. Fix the
`features/recipes → features/shopping` import.

**3.4 Decide on one select pattern.**
- Recommendation: native `<select>` everywhere on mobile, for OS pickers,
  accessibility for free, and less code. Style the closed trigger with
  `fieldClass`, and accept the unthemed native option list.
- If the themed popup matters more, keep `Select.tsx` (with the 1.6 fixes)
  and convert `QuantityEditor` to it.
- Record the choice in the doc from 5.1.

### Phase 4 — Motion & mobile layout

**4.1 Honor reduced motion.** Add to `index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```
- Use 1ms rather than 0 so `animationend` still fires, which `ShoppingRow`'s
  deferred action depends on.
- In `ScrollToTopButton`, use `behavior: 'auto'` when
  `matchMedia('(prefers-reduced-motion: reduce)')` matches.

**4.2 Safe-area insets.**
- `Layout`: `padding-top: max(1.5rem, env(safe-area-inset-top))`, plus the
  equivalent for the bottom.
- `ScrollToTopButton`: `bottom: calc(1.5rem + env(safe-area-inset-bottom))`.
- Toasts: `top: calc(1rem + env(safe-area-inset-top))`.

**4.3 Trim the glass effects.**
- Keep `backdrop-blur` for overlays (dialog, toasts).
- Make fields a solid `bg-surface` with the field shadow. This also removes
  the background-dependent contrast from A5.
- Check scroll smoothness on the phone before and after.

### Phase 5 — Documentation & guardrails

**5.1 `docs/design-system.md`**, one page:
- Token table: role → light value → dark value → use for.
- Type, radius, motion and z-index roles.
- Component catalogue: purpose, props, do/don't, and the a11y contract
  (e.g. "IconButton requires aria-label").
- Patterns: tap-to-edit, confirm-then-undo, toasts, empty and loading
  states.
- The rules in 5.2.

Link it from `CLAUDE.md` and `README.md`.

**5.2 Add these rules to `CLAUDE.md`:**
- No raw palette classes (`bg-teal-*`, `text-white`, …) outside
  `index.css`. Add a token instead. `text-white` on `bg-primary` becomes
  `text-on-primary`.
- No `shadow-[…]`, `z-[…]` or ad-hoc `rounded` steps. Use the tokens.
- No `useTheme()` for styling. Only `ThemeToggle`/`AuthBackdrop` use it.
- Every interactive element is a `Button`, `IconButton`, `Checkbox`, `Input`
  or `Select` from `shared/ui/`.
- New overlays use `Dialog`.

**5.3 A cheap drift check (no new dependency).**
Add `scripts/check-design-tokens.sh`, which searches `src/**/*.tsx` for
these and exits non-zero on any match:
- `\b(bg|text|border|ring|fill|stroke)-(slate|teal|amber|rose|emerald|white|black)`
- `shadow-\[`
- `z-\[`
- `outline-none`

The meal illustration SVGs (`features/meals/*Icon.tsx`) are exempt. Run it
in CI next to lint.

**5.4 (Optional, ask first, it's a new dependency) visual regression.**
A Playwright screenshot pass over the 5 tabs × 2 themes × 2 languages.
Skip it if you'd rather not add dependencies.

---

## Summary checklist

- [ ] 1.1 Remove `maximum-scale=1`; inputs ≥16px
- [ ] 1.2 `lang`/`dir` on `<html>`; drop the per-component `dir`
- [ ] 1.3 Global `:focus-visible` ring; remove bare `outline-none`
- [ ] 1.4 Toasts: live region, pause on hover/focus
- [ ] 1.5 Contrast: `--color-primary-fg`, amber-700 warning, scroll-to-top, subtle text
- [ ] 1.6 Checkbox state; `Select` activedescendant, labelling, keys, focus return
- [ ] 1.7 Enable oxlint `jsx-a11y`
- [ ] 2.1 One definition per theme (or `light-dark()`)
- [ ] 2.2 Shadow tokens in `@theme`; retire `elevation.ts`
- [ ] 2.3 Remove `useTheme()` from Button, titleGlow, tabs
- [ ] 2.4 Radius, type, motion and z-index role tokens
- [ ] 2.5 Single `--font-ui`; drop the 5 ternaries
- [ ] 3.1 `Button` sizes/tones; migrate hand-styled buttons
- [ ] 3.2 `IconButton`, `Checkbox`, `Dialog`, `InlineEditor`, `Toast`
- [ ] 3.3 Move `DeleteButton` to `shared/ui`
- [ ] 3.4 Pick one select pattern
- [ ] 4.1 `prefers-reduced-motion`
- [ ] 4.2 Safe-area insets
- [ ] 4.3 Limit `backdrop-blur` to overlays
- [ ] 5.1 `docs/design-system.md`
- [ ] 5.2 Design rules in CLAUDE.md
- [ ] 5.3 Token drift check script
- [ ] 5.4 (optional) Visual regression screenshots
