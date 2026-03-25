# Design System Documentation: The Cognitive Grid

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

We are moving away from the cluttered density of traditional social networks and toward the precision of a high-end research tool fused with the elegance of a luxury editorial journal. This system is designed to visualize complex human simulation data with clinical clarity and aesthetic grace. 

To break the "template" look, we employ intentional asymmetry: headers may be offset, data visualizations should bleed into margins, and typography must vary drastically in scale to create an authoritative, curated hierarchy. The interface should feel like a living blueprint—a structured, intelligent space where every pixel serves the simulation.

---

## 2. Colors & Tonal Architecture
The palette is rooted in a monochromatic foundation to maintain a "data-first" focus, using accent colors strictly as functional signifiers for social stances.

### The Palette
*   **Monochromatic Base:** Utilizes `surface` (#fcf9f8) for expansive breathing room and `on_surface` (#323233) for high-contrast, legible content.
*   **Stance: Support (Primary):** `primary` (#066b53) — A soft emerald used to signify positive alignment.
*   **Stance: Oppose (Secondary):** `secondary` (#94484f) — A muted rose used for friction or opposition.
*   **Stance: Neutral (Tertiary):** `tertiary` (#516170) — A cool slate for objective or unaligned data.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Definition must be achieved through **Background Tonal Shifts**. For example, a main content area using `surface` should be distinguished from a sidebar using `surface-container-low` (#f6f3f2). Boundaries are felt through color blocks, not drawn with lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. To create depth without shadows:
1.  **Level 0 (Base):** `surface`
2.  **Level 1 (Section):** `surface-container-low`
3.  **Level 2 (Card/Inset):** `surface-container-lowest` (#ffffff)
This "nesting" creates a sophisticated, recessed look that implies data is embedded within the platform.

### Signature Textures
For high-impact CTAs or Hero data points, use a subtle linear gradient from `primary` to `primary_container`. This adds a "lithographic" quality that flat hex codes cannot achieve, elevating the platform from a tool to an experience.

---

## 3. Typography
We utilize **Inter** as our typographic anchor. To achieve an editorial feel, lean heavily into varied weights and generous tracking.

*   **Display (Large Scale):** Use `display-lg` for high-impact simulation titles. Set with `tracking-tight` (-0.02em) and `font-weight: 700` to command authority.
*   **Data Labels:** Use `label-md` or `label-sm`. These must be set in **All Caps** with `tracking-widest` (0.1em) and `font-weight: 600`. This mimics the look of technical architectural drawings.
*   **Body Narrative:** `body-lg` should be used for simulation descriptions. Maintain a line-height of 1.6 to ensure the text "breathes" against the grid.

---

## 4. Elevation & Depth
In this design system, depth is a product of light and material, not artificial CSS effects.

*   **The Layering Principle:** Use the Spacing Scale (specifically `3` and `4`) to create "internal gutters" between layered surfaces. This gap is more effective at showing hierarchy than a stroke.
*   **Ambient Shadows:** Floating elements (like Modals or Hovering Tooltips) use extremely diffused shadows: `box-shadow: 0 20px 40px rgba(50, 50, 51, 0.06)`. The shadow color is a 6% opacity version of `on_surface`, creating a natural lift.
*   **The "Ghost Border" Fallback:** If containment is required for accessibility, use a **Ghost Border**. Apply `outline-variant` (#b2b2b1) at **15% opacity**. It should be felt more than seen.
*   **Glassmorphism:** For global navigation or floating stance-filters, use `surface` at 80% opacity with a `backdrop-blur: 12px`. This allows simulation data to peak through the UI, maintaining the "structured network" feel.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` background with `on_primary` text. Use `rounded-md` (0.75rem).
*   **Secondary/Tertiary:** High-tracking labels with a Ghost Border. No fill.
*   **Interaction:** On hover, shift background to `primary_dim` and apply a subtle 0.35rem vertical lift.

### Stance Chips
*   Used to categorize simulation participants.
*   **Styling:** Small, high-tracking labels. Use `surface-container-highest` for the background, with a 4px left-aligned vertical bar of the stance color (`primary`, `secondary`, or `tertiary`) to denote the "stance" without overwhelming the chip with color.

### Simulation Cards
*   **Constraint:** No divider lines.
*   **Structure:** Use `surface-container-lowest` on a `surface` background. Use `padding: 2rem` (Spacing 6) to separate header, body, and metadata.
*   **Data Nodes:** Use `px` (1px) lines in `outline-variant` (20% opacity) to create small grid-subsections within the card, implying a "technical readout."

### Input Fields
*   **Standard:** Use `surface-container-low` with a Ghost Border.
*   **Focus State:** The border opacity increases to 100% of `primary`. Use a subtle `primary_container` glow (4px blur).

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. If a column is 8 units wide, let the caption float in a 2-unit gutter to the left.
*   **Do** use `surface-bright` for highlights in data visualizations to draw the eye without using color.
*   **Do** respect the Spacing Scale. Use large values (`10`, `12`) for section transitions to create "Luxury White Space."

### Don't:
*   **Don't** use 100% black. Use `on_surface` (#323233) to keep the editorial feel soft and readable.
*   **Don't** use standard "drop shadows" with high opacity. They break the "frosted glass and paper" metaphor.
*   **Don't** use dividers or horizontal rules (`<hr>`). Use a 2rem vertical gap or a subtle shift in surface color to denote a new section.