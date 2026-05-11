---
name: Academic Excellence Portal
colors:
  surface: '#fff8f6'
  surface-dim: '#ffd0bd'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ec'
  surface-container: '#ffe9e2'
  surface-container-high: '#ffe2d7'
  surface-container-highest: '#ffdbcd'
  on-surface: '#360f00'
  on-surface-variant: '#5d3f40'
  inverse-surface: '#581e00'
  inverse-on-surface: '#ffede7'
  outline: '#916e6f'
  outline-variant: '#e6bcbd'
  surface-tint: '#9e412f'
  primary: '#9b3f2d'
  on-primary: '#ffffff'
  primary-container: '#ba5642'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a5'
  secondary: '#5e604d'
  on-secondary: '#ffffff'
  secondary-container: '#e1e1c9'
  on-secondary-container: '#636451'
  tertiary: '#8a4d0e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a76426'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#7f2a1a'
  secondary-fixed: '#e4e4cc'
  secondary-fixed-dim: '#c8c8b0'
  on-secondary-fixed: '#1b1d0e'
  on-secondary-fixed-variant: '#474836'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#fff8f6'
  on-background: '#360f00'
  surface-variant: '#ffdbcd'
typography:
  h1:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is engineered for a university environment that bridges the gap between institutional prestige and a welcoming, human-centric campus experience. The brand personality is **warm, scholarly, and grounded**. It shifts away from cold institutional aesthetics toward an atmosphere of organic growth and intellectual accessibility, positioning the portal as a supportive foundation for student achievement.

The visual style is **Terracotta Scholastic Modern**, characterized by a sun-drenched, earthy palette, fluid geometry, and a stable yet precise architecture. By utilizing warm clays and organic pill-shaped forms, the system evokes the feeling of a historic campus at golden hour—reliable and rooted in tradition, yet vibrant and approachable. The result is an interface that feels like an inviting digital commons for academic collaboration.

## Colors

The palette is anchored by a warm **Sunset Terracotta (#E1745E)**, representing the energy and approachability of the modern student body. This primary color is used for the most critical actions and brand signatures. **Campus Cream (#F5F5DC)** serves as the secondary accent, providing a soft, paper-like contrast for supportive UI elements and secondary highlights. **Sandy Oak (#F4A460)** acts as a tertiary anchor, adding organic depth to specialized content and organizational categories.

The background and neutral surfaces are derived from **Earthy Sienna (#A0522D)**, which replaces sterile grays with a rich, wood-toned professional tint that enhances the warmth of the palette. 
- **Surface:** High-clarity white or cream surfaces for content containers to ensure maximum readability and a light feel.
- **Background:** A crisp, light canvas with subtle clay tints that provide a sophisticated and stable alternative to traditional neutrals.

## Typography

This design system utilizes a dual-font strategy to differentiate intent. **Sora** is employed for headings; its geometric construction and wide apertures provide a modern, technical feel that remains highly legible at large scales. Headings maintain a bold, "locked-in" appearance that feels authoritative yet approachable.

**DM Sans** is used for all body text and UI labels. Its low-contrast strokes and neutral personality ensure that long-form content, such as club descriptions or research papers, remains readable and unobtrusive. The system relies on weights to establish hierarchy, using the font's clean profile to keep the interface feeling light and accessible.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy to ensure content density remains manageable on wide displays. A standard 12-column grid is used for desktop views, with a maximum container width of 1280px. 

Spacing is governed by an 8px linear scale. Large-scale sections are separated by 40px (lg) or 64px (xl) to create a spacious, modern feel, while internal card padding is kept at 24px (md). Margins and gutters are fixed at 24px to ensure a rhythmic vertical line across the entire portal, providing a structured skeleton for the warm UI elements.

## Elevation & Depth

Depth in this design system is achieved through **Warm Tonal Layering** and soft, sophisticated shadows. Instead of traditional grays, shadows utilize a very low-opacity tint derived from the Earthy Sienna neutral palette to ensure they feel integrated into the warm surface colors.

Three levels of elevation are defined:
1.  **Low:** Used for cards in their default state. A soft, wide-spread shadow that provides a gentle lift from the background.
2.  **Medium:** Used for hover states on cards. The shadow becomes more pronounced, occasionally combined with a subtle 2px Terracotta or Cream glow.
3.  **High:** Reserved for modals and dropdown menus, using a multi-layered shadow to create a distinct sense of floating, ensuring these elements command attention against the scholarly background.

## Shapes

The design system adopts a **Pill-shaped** (highly rounded) shape language. A base radius of 16px (1rem) is used for buttons and small input fields to create a friendly, ultra-modern aesthetic. Larger containers and cards utilize a 32px (2rem) radius, creating a very "fluid" and approachable composition. 

Interactive elements embrace this high degree of circularity as a core brand pillar, intentionally breaking away from "boxy" corporate layouts to embrace a more organic, app-like experience that feels tactile and contemporary.

## Components

### Buttons
Primary buttons are pill-shaped, solid Sunset Terracotta with white text. On hover, they transition to Sandy Oak or a deeper Sienna to provide a sophisticated state change. Secondary buttons use a Sunset Terracotta outline with a highly rounded profile.

### Cards
Cards are the primary container for information. They feature a white surface, a 32px border radius, and a subtle Sienna-tinted shadow. On hover, the card should elevate slightly, and an accent bar in Sunset Terracotta may appear to indicate focus.

### Inputs & Selects
Input fields use a very soft cream-tinted background with a high 16px border radius. Upon focus, the border weight increases and the color shifts to Sunset Terracotta. Labels must always be visible above the input field in DM Sans Bold.

### Chips & Tags
Used for club categories or event tags. These should be fully pill-shaped (rounded-full) with a light Terracotta or Sandy Oak tint (10% opacity) with high-contrast text in the same hue.

### Visual Motifs
The system uses rounded geometric "blobs" or soft gradients at low opacity in the background to reinforce the fluid, grounded brand identity without distracting from the academic content.