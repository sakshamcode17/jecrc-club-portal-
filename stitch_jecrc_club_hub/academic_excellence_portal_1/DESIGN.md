---
name: Academic Excellence Portal
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44464e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4c5e86'
  primary: '#00081e'
  on-primary: '#ffffff'
  primary-container: '#0a1f44'
  on-primary-container: '#7687b2'
  inverse-primary: '#b4c6f4'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#00081f'
  on-tertiary: '#ffffff'
  tertiary-container: '#001e4d'
  on-tertiary-container: '#6b87c7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b4c6f4'
  on-primary-fixed: '#041a3f'
  on-primary-fixed-variant: '#34466d'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#afc6ff'
  on-tertiary-fixed: '#001944'
  on-tertiary-fixed-variant: '#264581'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality for this design system is authoritative, scholarly, and prestigious. It is designed for an audience of high-achieving students, faculty, and administrative stakeholders who require a sense of stability and institutional trust. 

The aesthetic follows a **Corporate / Modern** movement, leaning into a "New Academic" style. It utilizes heavy whitespace to suggest clarity of thought, balanced with deep, saturated tones to signify tradition and rigor. The interface avoids ephemeral trends in favor of timeless, high-contrast layouts that prioritize information density and legibility. The emotional response should be one of confidence, focus, and achievement.

## Colors

The palette is anchored by a deep Navy Blue, providing a professional and serious foundation. Gold is used strictly as a high-value accent to draw attention to achievements, call-to-actions, and premium statuses.

- **Primary (#0A1F44):** Used for headers, primary buttons, and navigational anchors.
- **Secondary/Accent (#F5A623):** Reserved for "Excellence" indicators, badges, and primary action highlights.
- **Tertiary (#2C4A86):** A lighter navy for hover states, secondary icons, and illustrative accents.
- **Surface Neutrals:** A range of cool grays (Slate) ensure the interface feels modern and clean, moving away from warmer, muddy tones.
- **Success/Error:** Standard semantic greens and reds are muted to match the professional density of the navy.

## Typography

This design system utilizes **Sora** across all levels to maintain a cohesive, geometric, and modern feel. Sora’s distinct rhythm and clarity make it ideal for an academic context where long-form reading and data scanning are frequent.

- **Headlines:** Use Bold and Semi-Bold weights with tighter letter-spacing for a commanding presence.
- **Body:** Use Regular weight with generous line-height (1.5x - 1.6x) to ensure maximum readability during extended study sessions.
- **Labels:** Use Semi-Bold weights at smaller sizes to maintain hierarchy without sacrificing legibility.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop (1280px max-width) and a **Fluid Grid** for mobile. The system is built on an 8px base unit, ensuring all components and layouts scale mathematically.

- **Grid:** 12-column structure with 24px gutters.
- **Margins:** Large 32px or 48px outer margins to allow the content "room to breathe," reflecting the minimalist academic aesthetic.
- **Section Spacing:** Vertical rhythm is maintained by using 80px (xl) spacing between major content blocks to prevent visual clutter.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and subtle **Ambient Shadows**. 

- **Level 0 (Background):** The base layer uses a very light cool gray (#F8FAFC).
- **Level 1 (Cards/Surface):** Pure white surfaces with a soft, diffused shadow (0px 4px 20px rgba(10, 31, 68, 0.05)).
- **Level 2 (Dropdowns/Modals):** High-contrast surfaces with a more pronounced shadow (0px 12px 32px rgba(10, 31, 68, 0.12)).
- **Level 3 (Overlay):** Used for global navigation bars, utilizing a very subtle bottom border (1px solid #E2E8F0) rather than a heavy shadow to maintain a clean top-level feel.

## Shapes

The shape language is defined by **Rounded** corners, striking a balance between the friendliness of a modern app and the structure of an educational institution. 

- **Standard Components:** Buttons, inputs, and small cards use a 0.5rem (8px) radius.
- **Container Elements:** Large content areas and feature cards use a 1rem (16px) radius.
- **Interactive Elements:** Active states should never change the shape, only the stroke or fill, to ensure layout stability.

## Components

- **Buttons:** Primary buttons use the Navy Blue (#0A1F44) with white text. Secondary buttons use a Navy ghost style (outline). The Gold accent is reserved for "High Achievement" actions or specialized portal features.
- **Input Fields:** Use a 1px Slate-200 border that thickens and changes to Navy on focus. Labels should be docked above the input in Sora Semi-Bold.
- **Cards:** White background with an 8px corner radius and Level 1 shadow. Headers within cards should use Navy text.
- **Chips/Badges:** Use a soft-tint background of the Navy (e.g., 10% opacity) for general tags. Use the Gold accent for "Awarded" or "Dean's List" status badges.
- **Progress Bars:** Utilize the Gold accent for the fill color to represent "attaining excellence" or completion.
- **Data Tables:** High-density with Navy headers and subtle Slate-50 alternating row stripes.