# Homepage Redesign Design

**Date:** 2026-04-02
**Route:** `app/[lang]/page.tsx`
**Status:** Approved in conversational review, pending written-spec review

## Goal

Redesign the homepage into a quiet, precise personal-brand front page that introduces Léon Zhang through working philosophy rather than stack marketing, lead capture, or content promotion.

The homepage should feel like the opening page of a technical notebook: editorial, deliberate, restrained, and static. It should avoid startup-style conversion patterns, avoid featured-content rails, and avoid heavy emphasis on technologies or calls to action.

## User Intent

The approved direction is:

- Personal brand first
- Quiet and precise tone
- No call-to-action
- Mostly autobiographical and static
- Working philosophy over technical stack
- Principle-driven copy with little or no stack listing

## Current State

The current homepage is placeholder content. It renders a generic welcome heading, a short description, repeated route-test paragraphs, and language buttons. This does not match the rest of the site's editorial tone and does not communicate identity, philosophy, or purpose.

Other pages already establish a stronger direction:

- `app/[lang]/about/page.tsx` uses an editorial section structure with restrained borders and compact content blocks
- `app/[lang]/blog/page.tsx` uses a clear content-first layout with typographic hierarchy and dotted separators
- `app/globals.css` already defines the site typography, theme tokens, and border language needed for the redesign

## Design Direction

### Concept

Use a "monograph front page" approach.

The page should read like a calm introductory document rather than a promotional homepage. It should look authored, not assembled from product-marketing components.

### Tone

The tone should be:

- Restrained
- Technical
- Calm
- Personal without being confessional
- Exact without sounding cold

### What The Page Must Not Become

Do not add:

- CTA buttons
- Featured-post lists
- Recent writing rails
- Metrics, counts, or social proof
- Explicit skill-grid or stack grid
- Testimonial-style content
- Over-designed hero effects

## Information Architecture

The homepage should be a single main narrative flow with four content blocks.

### 1. Intro Block

This block introduces the person and the site in the fewest possible moves.

Content:

- Small eyebrow label
- Name or identity marker
- Philosophy-first headline
- One short introductory paragraph

Purpose:

- Establish who the site belongs to
- State how the author thinks about building and documenting software
- Set the tone for everything below

### 2. Principle Sections

This is the main body of the homepage.

Use three compact sections with concise headings and short supporting text. These should read like short notebook entries, not marketing feature cards.

Recommended section themes:

- Building with clarity
- Preferring durable systems over noise
- Treating writing as part of engineering

Each section should contain:

- Section label or short heading
- Two to four lines of copy

Purpose:

- Express worldview, not services
- Make the homepage memorable through convictions rather than claims

### 3. Site Note

This closing block explains what the site is for.

Content:

- A brief note describing the site as a working notebook, record, or archive of ideas and practical engineering lessons
- No prompt to take action
- No link-heavy footer-style behavior

Purpose:

- Clarify what readers will find here
- End the page with intent rather than conversion

### 4. Optional Closing Marker

If needed for rhythm, the page may end with a small single-line marker such as a date-less note, a quiet divider, or a minimal sentence. This is optional and should only be used if the layout feels too abrupt without it.

## Layout System

### Overall Composition

Use a narrow editorial reading width rather than a broad landing-page canvas.

Layout characteristics:

- Mobile-first
- Mostly single-column
- Left-aligned text
- Generous vertical rhythm
- Restrained max width
- Visual pacing created through whitespace and separators

### Desktop Behavior

The page should still feel document-like on large screens. Avoid turning the main body into a marketing grid.

A slight compositional shift is acceptable, such as:

- A tighter intro width with a small offset detail column
- A subtle asymmetry between intro and body
- Marginal labels or metadata-style section markers

These should remain quiet and not disrupt readability.

### Mobile Behavior

On mobile, the page should collapse into a clean single-column reading experience with strong spacing discipline and no loss of meaning.

## Visual Language

### Typography

Keep the existing IBM Plex Sans and IBM Plex Mono pairing.

Typography use:

- Monospace for headings, labels, and structural markers
- Sans for paragraph copy
- Strong headline hierarchy without oversized hero theatrics
- Tight, deliberate spacing between heading and supporting text

The page should feel typeset, not promotional.

### Color

Stay close to the existing site palette and theme tokens.

Use:

- Monochrome or near-monochrome surfaces
- Existing accent color only sparingly
- Border and separator treatments to create structure
- Subtle tinted backgrounds only if needed to prevent visual flatness

Do not introduce a new high-saturation homepage palette.

### Borders And Surfaces

Lean on the site's existing ruled and dotted separator language.

Use:

- Section dividers
- Light surface changes
- Occasional framed text regions only when structurally justified

Avoid stacked cards, nested containers, or dashboard-like blocks.

### Motion

Motion should be minimal.

Acceptable:

- Short fade or rise-in on initial sections
- Respect reduced-motion preferences

Not acceptable:

- Decorative parallax
- Floating gradients
- Attention-seeking scroll effects

## Content Rules

### Copy Priorities

Homepage copy should prioritize:

- Philosophy
- Method
- Clarity
- Documentation as engineering
- Durable thinking over trend-driven language

### Copy Avoidances

Avoid:

- Resume-summary language
- Buzzword stacking
- Long stack lists
- Agency-style positioning
- Generic "I build digital experiences" phrasing

### Localization

The page must support both English and Chinese through dictionary-backed or page-local localized content. The two versions should preserve the same structure and intent, not word-for-word literal translations at the expense of tone.

## Component Strategy

Prefer implementing the homepage in focused presentational sections instead of a single long JSX block.

Possible decomposition:

- `HomeIntro`
- `HomePrinciples`
- `HomeSiteNote`

If the final implementation stays small, this may remain in one file. Split only if it improves clarity.

## Data Strategy

The homepage should be static and content-defined.

It should not depend on:

- Blog-feed helpers
- Note indexes
- Recent post queries
- Search or discovery state

This is a hard cutover away from placeholder content, with no backward-compatibility layer required.

## Accessibility

Requirements:

- Semantic sectioning with clear heading hierarchy
- High contrast in both light and dark themes
- No meaning conveyed only by decoration
- Motion reduced or removed under reduced-motion preferences
- Maintain readable line length and spacing

## SEO And Metadata

Homepage metadata should be updated to reflect the new positioning.

The title and description should better match a philosophy-led personal engineering site rather than a generic software-engineer summary.

Open Graph text should remain consistent with the new copy direction.

## Error Handling

There is no interactive behavior that requires complex error handling.

The primary risk is content drift:

- Tone becoming too promotional
- Layout becoming too empty
- Philosophy copy becoming vague or generic

Implementation review should explicitly check for those failures.

## Testing Strategy

Implementation should verify:

- The route renders the new content for both supported languages
- Placeholder repeated paragraphs are removed
- No CTA buttons or language-switch hero buttons remain in homepage content
- The page remains readable and well-spaced on mobile and desktop
- Dark mode retains contrast and structure

Where practical, add tests around rendered homepage content or structure. At minimum, verify through focused route rendering tests and manual responsive review.

## Acceptance Criteria

The redesign is complete when:

- The homepage no longer looks like placeholder content
- The page introduces Léon Zhang through working philosophy
- The tone is quiet, precise, and editorial
- The page contains no CTA, no featured content rail, and no stack-heavy section
- The page feels native to the existing site typography and chrome
- The page works in both locales and both themes

## Implementation Notes

Likely files involved:

- `app/[lang]/page.tsx`
- `dictionaries/en.json`
- `dictionaries/zh.json`
- Possibly a new homepage component file under `components/`
- Potential metadata copy adjustments in `app/[lang]/page.tsx`

The redesign should be a clean replacement of the current homepage, not an incremental compatibility layer.
