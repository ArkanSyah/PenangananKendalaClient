name: Microdata Executive
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3f484a'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6f797b'
  outline-variant: '#bfc8ca'
  surface-tint: '#206773'
  primary: '#003d46'
  on-primary: '#ffffff'
  primary-container: '#005662'
  on-primary-container: '#89c9d7'
  inverse-primary: '#90d1df'
  secondary: '#48626e'
  on-secondary: '#ffffff'
  secondary-container: '#cbe7f5'
  on-secondary-container: '#4e6874'
  tertiary: '#003f37'
  on-tertiary: '#ffffff'
  tertiary-container: '#00584d'
  on-tertiary-container: '#73cfbe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acedfb'
  primary-fixed-dim: '#90d1df'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e59'
  secondary-fixed: '#cbe7f5'
  secondary-fixed-dim: '#afcbd8'
  on-secondary-fixed: '#021f29'
  on-secondary-fixed-variant: '#304a55'
  tertiary-fixed: '#97f3e2'
  tertiary-fixed-dim: '#7ad7c6'
  on-tertiary-fixed: '#00201b'
  on-tertiary-fixed-variant: '#005047'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Open Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Open Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Open Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Open Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Open Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Open Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Open Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Open Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  scale: '{''xs'': ''4px'', ''sm'': ''8px'', ''md'': ''16px'', ''lg'': ''24px'', ''xl'':
    ''32px'', ''xxl'': ''48px'', ''xxxl'': ''64px''}'
  layout: '{''gutter'': ''16px'', ''margin-mobile'': ''16px'', ''margin-desktop'':
    ''32px'', ''max-width'': ''1440px''}'
---

## Brand & Style
The design system is engineered for high-density information environments where clarity, speed of cognition, and professional reliability are paramount. It follows a **Minimalist-Corporate** aesthetic, heavily influenced by Material 3’s structural logic but stripped of excessive ornamentation.

The visual narrative focuses on "Data as the Hero." This is achieved through expansive whitespace, the elimination of heavy drop shadows (favoring tonal separation), and a strict adherence to a logic-driven interface. The emotional response should be one of "controlled efficiency"—reducing the anxiety associated with high-volume ticket management through a calm, predictable, and utilitarian interface.

## Colors
The palette is anchored by **Professional Teal (#005662)**, chosen for its association with precision and stability. This color is used for primary actions, active navigation states, and key interactive focal points.

- **Backgrounds:** A neutral, cool-toned gray (`#F8F9FA`) is used for the application canvas to reduce eye strain, while pure white is reserved for content containers (cards, sheets) to create a clear "layer of work."
- **Status Logic:** Semantic colors follow standard industrial patterns. **Urgent Red (#C62828)** is reserved strictly for high-priority issues or destructive actions. **Warning Amber (#FBC02D)** identifies items requiring attention but not immediate intervention.
- **Contrast:** AA/AAA compliance is mandatory for all text-on-background combinations to ensure accessibility in professional environments.

## Typography
This design system utilizes **Open Sans** across all levels. It provides a humanist touch to an otherwise clinical interface, maintaining high legibility in dense data tables and long-form issue descriptions.

- **Scale:** A strict typographic hierarchy ensures users can scan ticket IDs, priority levels, and client names instantaneously.
- **Labels:** Small, all-caps labels are used for metadata headers (e.g., "DATE CREATED", "ASSIGNED TO") to distinguish them clearly from user-generated content.
- **Weights:** Use Semi-Bold (600) for interactive elements and headers; Regular (400) for all body text and descriptive content.

## Layout & Spacing
The layout is governed by a **strict 8px grid system**. Every element—from icon sizes to padding within a table cell—must be a multiple of 8px (or 4px for micro-adjustments).

- **Grid Model:** Use a 12-column fluid grid for the main content area.
- **Sidebar:** A fixed-width navigation rail (72px collapsed, 240px expanded) sits on the far left.
- **Data Density:** In the "Issue Handling" view, vertical spacing is condensed to `8px` between rows to maximize visible data points, while the "Issue Detail" view expands spacing to `24px` to improve readability during deep focus.
- **Breakpoints:**
  - Mobile: < 600px (1 column, 16px margins)
  - Tablet: 600px - 1024px (6 columns, 24px margins)
  - Desktop: > 1024px (12 columns, 32px margins)

## Elevation & Depth
In alignment with the "Elevation-less" requirement, this design system rejects the use of drop shadows for depth. Instead, it utilizes **Tonal Layering** and **Stroke-based containment**.

- **Surface 0 (Background):** `#F8F9FA` (The base canvas).
- **Surface 1 (Cards/Panels):** `#FFFFFF` with a 1px border of `#E0E0E0`. No shadow.
- **Surface 2 (Overlays/Modals):** `#FFFFFF` with a 1px border of `#CFD8DC` and a subtle 4px blur backdrop to focus attention.
- **Interaction:** On hover, a surface does not "lift." Instead, its border color shifts to the Primary Teal or its background shifts to a very light 5% tint of the Primary color.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a subtle modern feel without the playfulness of fully rounded corners.

- **Small Components:** Checkboxes, tags, and input fields use the `rounded-sm` (2px - 4px) setting.
- **Containers:** Main content cards and modals use `rounded-lg` (8px).
- **Buttons:** Use `rounded-sm` to maintain a professional, architectural look. Avoid pill shapes unless used for specific high-contrast "Status Badges."

## Components
Consistent implementation of these components ensures the system remains intuitive.

- **Data Tables:** Use a 1px solid bottom border (`#EEEEEE`) for rows. Header cells use `label-lg` typography with a subtle gray background (`#F1F3F4`).
- **Outlined Inputs:** All form fields must use a 1px outline (`#BDBDBD`). On focus, the border thickens to 2px and changes to the Primary Teal. Labels should be "floating" or placed strictly above the field using `label-md`.
- **Badges:** Priority and Status badges use a "Soft-Pill" shape. Use high-transparency backgrounds (15% opacity) of the status color with full-opacity text for better readability (e.g., Urgent badge: Light red background, Dark red text).
- **Buttons:** 
  - *Primary:* Solid Teal background, white text.
  - *Secondary:* Outlined Teal, no background.
  - *Ghost:* No border, Teal text, for low-emphasis actions.
- **Cards:** No shadows. Define boundaries using a 1px border. Group related information with `8px` internal padding for density or `16px` for clarity.
- **Priority Indicators:** Use a vertical color bar (4px width) on the far left edge of a ticket card or table row to provide an immediate visual cue for urgency without overwhelming the text.