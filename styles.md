# design Guidelines & Styling System (`styles.md`)

This document defines the central design system and styling principles for the **EdTech** application. All components and layouts must strictly adhere to these rules.

---

## 1. Color Palette (Dark Gray, Green, White)

The interface is built around a premium, modern dark aesthetic with vibrant green highlights and crisp white accents. We configure these colors directly in our Tailwind CSS v4 theme.

### Semantic Mapping

| Token Name | Light Mode Value | Dark Mode Value | Usage Description |
| :--- | :--- | :--- | :--- |
| `background` | `#ffffff` (White) | `#0f1012` (Rich Dark Gray) | Core page background |
| `foreground` | `#121214` (Dark Gray) | `#fcfcfd` (Off-white) | Primary body text |
| `card` | `#fcfcfd` (Pure White) | `#16181c` (Medium Dark Gray) | Card, container, and dialog backgrounds |
| `card-foreground`| `#121214` (Dark Gray) | `#fcfcfd` (Off-white) | Text inside cards |
| `primary` | `#16a34a` (Green 600) | `#10b981` (Emerald Green 500) | Primary actions, branding, key highlights |
| `primary-foreground`| `#ffffff` (White) | `#0a0b0d` (Deep Dark Gray) | Text on top of primary colors |
| `secondary` | `#f4f4f5` (Light Gray) | `#23262d` (Slate Dark Gray) | Secondary actions, badges, minor buttons |
| `secondary-foreground`| `#18181b` (Dark Gray) | `#e4e4e7` (Light Gray) | Text on top of secondary elements |
| `muted` | `#f4f4f5` (Light Gray) | `#1e2025` (Muted Dark Gray) | Disabled states, background fills |
| `muted-foreground`| `#71717a` (Muted Gray) | `#a1a1aa` (Zinc Muted Text) | Subtitles, helper text, captions |
| `accent` | `#f0fdf4` (Soft Green) | `#122e23` (Dark Emerald/Green Glow) | Hover states, focus rings, subtle badges |
| `accent-foreground`| `#15803d` (Dark Green) | `#34d399` (Mint Green) | Text on hover/accent |
| `border` | `#e4e4e7` (Light Gray) | `#272a30` (Medium Gray Border) | Dividers, element boundaries, button borders |
| `input` | `#e4e4e7` (Light Gray) | `#272a30` (Medium Gray Border) | Input borders, fields |
| `ring` | `#16a34a` (Green 600) | `#10b981` (Emerald Green 500) | Focus rings, selection outlines |

---

## 2. Aesthetics & Mathematical Precision

### A. The Spacing Scale
All margins, paddings, and gaps must follow strict logical proportions. We align with a base-8 grid (8px, 16px, 24px, 32px, 48px, 64px) for layouts, while leveraging the **Golden Ratio ($\approx 1.618$)** for sizing relationships:
- Ratio of container width to sidebar width: $\approx 1.618$ (e.g., Main content `61.8%`, Sidebar `38.2%`).
- Font-size hierarchies and padding transitions scale proportionally (e.g., Card padding is `1.5rem` / `24px`, inner padding is `1rem` / `16px`).

### B. Borders and Radius
- **Border Widths**: Consistent `1px` borders for separation (`border-border`), with active elements occasionally using `2px`.
- **Border Radius**:
  - Cards & Dialogs: `12px` (`rounded-xl`)
  - Buttons, Inputs, & Tags: `8px` (`rounded-lg`)
  - Badges & Avatars: Full circle (`rounded-full`)

### C. Visual Effects & Elevating Design
- **Subtle Glows (Emerald/Green)**: Use soft shadow glow effects for interactive or active primary states instead of heavy colors:
  - Class: `shadow-[0_0_20px_rgba(16,185,129,0.15)]`
- **Glassmorphism**: When laying out floating navigation, headers, or overlays, use background blurs:
  - Class: `bg-background/80 backdrop-blur-md border border-border`
- **No Cheap Gradients**: Linear gradients must be subtle and use narrow hue-shifting (e.g., from Slate Dark Gray to Deep Dark Gray, or Forest Green to Emerald Green). Never transition from highly contrasting primary colors (e.g., Blue to Green) unless strictly documented.

---

## 3. Typography Rules

We use `Geist Sans` for UI copy/body text and `Geist Mono` for logs, codes, numbers, and system tags.
- **Tracking (Letter Spacing)**:
  - Headings (`h1`, `h2`): Slightly tighter tracking (`tracking-tight`) to feel professional.
  - Body text: Normal tracking (`tracking-normal`).
- **Font Weights**:
  - Headings: Semibold (`font-semibold`) or Bold (`font-bold`).
  - Labels / Tabs: Medium (`font-medium`).
  - Body: Regular (`font-normal`).

---

## 4. UI Component Guidelines (Centralization & Adaptation)

All interactive components must build upon **shadcn/ui** and **Magic UI** elements. Do not re-create components.

1. **Button Guidelines**:
   - `default` variant: Green background (`bg-primary`), white or deep gray text (`text-primary-foreground`).
   - `secondary` variant: Dark gray background (`bg-secondary`), light gray text.
   - `outline` variant: Transparent background, dark gray border (`border-border`), green accent on hover.
2. **Card Guidelines**:
   - Standard card: Medium dark background (`bg-card`), crisp thin border (`border-border`), and rounded corners.
3. **Scrollbar Design**:
   - Scrollbars should be thin and styled to match the dark gray background to prevent breaking the UI flow.

---

## 5. Tailwind CSS v4 Reference Configuration

In the CSS-first Tailwind CSS v4, custom theme extensions are declared in `app/globals.css` using the `@theme` block.

```css
@import "tailwindcss";

@theme {
  /* Design System Colors */
  --color-dark-gray-50: #f9f9fa;
  --color-dark-gray-100: #f1f2f4;
  --color-dark-gray-200: #e2e4e8;
  --color-dark-gray-300: #cbd1d8;
  --color-dark-gray-400: #9aa5b3;
  --color-dark-gray-500: #6b7787;
  --color-dark-gray-600: #545f6e;
  --color-dark-gray-700: #434c58;
  --color-dark-gray-800: #23262d; /* UI Secondary/Card hover bg */
  --color-dark-gray-900: #16181c; /* UI Card bg */
  --color-dark-gray-950: #0f1012; /* UI Background bg */

  --color-green-50: #f0fdf4;
  --color-green-100: #dcfce7;
  --color-green-200: #bbf7d0;
  --color-green-300: #86efac;
  --color-green-400: #4ade80;
  --color-green-500: #10b981; /* Emerald Primary */
  --color-green-600: #059669;
  --color-green-700: #047857;
  --color-green-800: #065f46;
  --color-green-900: #064e3b;
  --color-green-950: #022c22;
}
```
