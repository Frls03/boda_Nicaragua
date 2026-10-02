---
name: Boda Jonathan & Jasmin — Panel de los novios
description: The couple's private wedding admin at /novios; the category-standard dashboard dressed in the wedding's navy, corinto and cream.
colors:
  ink: "#1d2436"
  navy: "#2b3653"
  navy-hover: "#222b43"
  navy-soft: "#eef0f5"
  corinto: "#6b1620"
  wedding-cream: "#f4efe4"
  bg: "#f6f4ef"
  surface: "#ffffff"
  surface-2: "#faf8f4"
  line: "#e6e1d7"
  line-strong: "#d5cdbf"
  text-2: "#555c6e"
  text-3: "#868b98"
  ok: "#2f6b4f"
  ok-soft: "#e7f1eb"
  wait: "#93640f"
  wait-soft: "#f8efdc"
  "no": "#6e6860"
  no-soft: "#efece7"
  danger: "#a3242f"
  danger-soft: "#fbecec"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'lnum' 1"
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  sheet: "20px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 15px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.navy-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 15px"
    height: "38px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-2}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "0 15px"
    height: "38px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 13px"
    height: "42px"
  filter-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.full}"
    padding: "0 13px"
    height: "34px"
  filter-pill-active:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
  status-badge-confirmed:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  status-badge-pending:
    backgroundColor: "{colors.wait-soft}"
    textColor: "{colors.wait}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  status-badge-declined:
    backgroundColor: "{colors.no-soft}"
    textColor: "{colors.no}"
    rounded: "{rounded.full}"
    padding: "3px 10px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  tab-bar-item-active:
    textColor: "{colors.corinto}"
  brand-mark:
    backgroundColor: "{colors.corinto}"
    textColor: "{colors.wedding-cream}"
    width: "40px"
---

# Design System: Boda Jonathan & Jasmin — Panel de los novios

Scope: this file specifies the admin panel (`/novios`, everything under `src/admin/`, scoped by the `.adm-theme` class). The public invitation (`/`) is the incumbent brand world this panel inherits from: navy (#16233f), maroon (#6b1620) and cream (#f4efe4) on paper, Great Vibes / Cormorant Garamond / Montserrat, single column. It is governed by its own Tailwind config and is not re-specified here. The two surfaces share exactly two things: the corinto and cream values, and the J&J Monogram component.

## Overview

**Creative North Star: "The Wedding Planner's Desk"**

The category-standard dashboard (side navigation, a summary, a table) played straight, at the finish of Linear, Stripe Dashboard, Zola and Airbnb hosting, in a friendly register for two non-technical people managing their own wedding, mostly on a phone. Nothing is ironic or novel about the structure; the character comes from the wedding's own materials: warm off-white paper, navy ink, a single corinto mark, a serif reserved for titles.

Density is moderate: a 14px Montserrat base, 38–42px controls, generous card padding. White surfaces sit on warm paper with a hairline and a whisper of ink-tinted shadow. Attendance status is the one piece of color semantics, and it never changes: sage for coming, amber for waiting, stone for not coming. The login card adds a faint corinto radial glow (6% corinto) on the paper. The rejected reference is the copied predecessor panel: a dark blue slab with emoji and loose, unrelated cards.

**Key Characteristics:**
- Warm paper background, white surfaces, hairline borders, soft ink-tinted shadows.
- Navy carries text and the primary action; corinto appears only as brand mark and selection.
- Three fixed attendance colors, used identically in badges, dots, bars and legends.
- Montserrat for all interface text with lining and tabular figures; Cormorant Garamond only for titles and the headline count.
- Phosphor single-stroke icons (regular, filled when active); zero emoji.
- Desktop sidebar, phone top bar plus thumb-reach tab bar, phone dialogs as bottom sheets.

## Colors

A warm-neutral paper system with one ink (navy), one brand accent (corinto) and a fixed three-state attendance palette.

### Primary
- **Wedding Navy** (navy): primary buttons, active filter pill, focus ring, caret and accent-color, the round table surface in Mesas. A lifted, slightly lighter cousin of the invitation's #16233f so it reads as action on white rather than as a slab.
- **Pressed Navy** (navy-hover): hover state of the primary button only.
- **Navy Mist** (navy-soft): seat-count badges and empty-seat hover; the quiet navy tint.

### Secondary
- **Corinto** (corinto): the brand mark tile behind the monogram, the active nav icon on desktop, the active tab on the phone tab bar. Same value as the invitation's maroon.
- **Wedding Cream** (wedding-cream): monogram glyphs on the corinto tile and the label on the navy table surface; inherited from the invitation.

### Tertiary (attendance and danger semantics)
- **Sage** (ok / ok-soft): confirmed, coming. Badge text on its soft fill, dots, the confirmed bar segment, valid drop target on a seat.
- **Amber** (wait / wait-soft): pending, has not answered.
- **Stone** (no / no-soft): declined, not coming. Deliberately grey, not red: declining is not an error.
- **Danger Red** (danger / danger-soft): destructive actions and form errors only (delete confirm, blocked seat, error message).

### Neutral
- **Ink** (ink): headings, names, primary text; also the base of every shadow and hover tint (`rgba(29,36,54,…)`).
- **Warm Paper** (bg): page background behind everything.
- **Surface** (surface): cards, table, dialogs, inputs, the active nav item.
- **Linen** (surface-2): sidebar, table header row, modal footer, empty seats.
- **Hairline** (line) and **Strong Hairline** (line-strong): card and row borders; button and input strokes, scrollbars.
- **Slate** (text-2): secondary text, table cells, inactive nav. **Mist Grey** (text-3): tertiary text, column headers, placeholders, inactive tabs.

### Named Rules
**The Three States Rule.** Attendance is always and only sage (coming), amber (waiting), stone (not coming), in that order, everywhere: badge, dot, bar segment, legend, filter. No other hue may mean a status.

**The Corinto Is A Seal Rule.** Corinto marks brand and current selection (monogram tile, active nav icon, active tab). It is never a button fill, a link color or a status.

**The Ink-Tinted Rule.** Hover washes, overlays and shadows derive from ink (`rgba(29,36,54,α)`), never neutral black, so depth stays warm on paper.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif)
**Body Font:** Montserrat (with system-ui, sans-serif)
**Label/Mono Font:** Montserrat for labels; ui-monospace stack only for guest passwords

**Character:** A wedding serif for the few words that name things, and a clear geometric sans for everything that must be operated. The serif is set at 600 so it holds up at interface sizes.

### Hierarchy
- **Display** (600, 4rem, 0.9): one use only, the total-people count in Respuestas, the panel's memorable moment.
- **Headline** (600, 2rem, 1.1; 1.7rem under 640px): section titles (Invitados, Respuestas, Mesas) and the login title. Balanced wrap.
- **Title** (600, 1.35–1.5rem, 1.1): dialog titles, table-card names, brand names in the sidebar, the phone top-bar title.
- **Body** (400, 14px, 1.5): all interface text; subtitles cap at 62ch. Lining numerals on; tabular numerals on counts, tables and badges.
- **Label** (600, 0.75–0.8125rem): buttons, column headers, badges, tab labels. Sentence case, no tracking beyond 0.01em.

### Named Rules
**The Serif Names, Sans Operates Rule.** Cormorant Garamond appears only in titles, names and the headline count. Every control, number in a table, and label is Montserrat.

**The Tabular Count Rule.** Any number that is compared or totaled (counts, seats, pills, legends) uses tabular figures.

## Layout

Desktop and tablet (above 860px): a two-column grid, a light 248px sidebar (Linen, hairline right border, sticky full height) holding the monogram, the couple's names and date, the navigation and logout; content on the right, capped at 1180px, padded `2.25rem clamp(1.25rem, 3.5vw, 3rem) 3rem`. Each tab opens with title and subtitle at left and primary actions at top right.

Phone (860px and below): the sidebar disappears; a 56px sticky top bar (translucent paper with backdrop blur, monogram, serif title, logout icon) and a fixed three-item bottom tab bar (Invitados, Respuestas, Mesas; 52px targets, safe-area padded, translucent white) take over. Content becomes a single column padded `1.25rem 1rem` with room for the tab bar.

At 720px and below: the guest table re-flows into stacked row cards, header actions become a two-column grid with the primary action full width on top (44px), filter pills scroll horizontally with a faded right edge, and every dialog becomes a bottom sheet. Inputs go to 16px to prevent iOS zoom. Mesas grid uses `auto-fill, minmax(296px, 1fr)`.

Spacing follows a 4px-based rhythm (4, 8, 12, 16, 20, 24, 36px); gaps within cards are 12–20px, between sections 24px.

## Elevation & Depth

A hybrid: tonal layering (paper, linen, white) does most of the work, and three soft, ink-tinted shadows add lift. Shadows are low-offset with a negative spread so they read as softness under the edge, never a drop.

### Shadow Vocabulary
- **Rest** (`0 1px 2px rgba(29,36,54,0.05)`): cards, secondary buttons, active nav item, active segmented tab.
- **Raised** (`0 1px 2px rgba(29,36,54,0.04), 0 6px 18px -8px rgba(29,36,54,0.12)`): hover lift on the draggable guest chips in Mesas (with a 1px rise).
- **Overlay** (`0 2px 6px rgba(29,36,54,0.06), 0 24px 48px -16px rgba(29,36,54,0.24)`): dialogs, bottom sheets, the login card.
- **Focus halo** (`0 0 0 3px rgba(43,54,83,0.14)`): focused inputs, alongside a navy border.

### Named Rules
**The Hairline First Rule.** Every surface carries a 1px hairline; the shadow only softens it. A surface with shadow and no border is off-system.

## Shapes

Gently rounded, never pill-shaped except where the element is a token of state: controls and inputs at 8px, inner containers at 12px, cards, table wrapper and dialogs at 16px, the login card and the bottom-sheet top corners at 20px. Pills, badges, counts, dots, seats and icon buttons are fully round. The monogram tile is a tall shield (aspect 94/135, radius 24% / 17%). Mesas draws real round tables: a navy disc with numbered circular chairs around it; empty chairs are dashed.

## Components

### Buttons
Calm, compact, confident; one primary per view.
- **Shape:** gently rounded (8px), 38px tall (44–46px on phone in headers and sheet footers).
- **Primary:** navy fill, white 13px/600 label, inset top highlight; hover to Pressed Navy.
- **Secondary:** white with Strong Hairline stroke and rest shadow; hover to Linen.
- **Ghost:** transparent, Slate label; hover gets a 5% ink wash.
- **Press:** all variants nudge down 1px. Focus: 2px navy outline, 2px offset.
- **Row actions:** 32px icon-and-label buttons; delete turns Danger Red on hover and asks for inline confirmation before acting.

### Chips
- **Filter pills:** fully round, 34px, white with hairline; active is navy with white text. Each carries a status dot and a tabular count bubble.
- **Status badges:** fully round, soft fill with the strong text of the same state (Three States Rule).
- **Segmented filter tabs (Respuestas):** an ink-washed track with a white, rest-shadowed active segment.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Surface on Warm Paper.
- **Shadow Strategy:** Rest; Overlay only for dialogs.
- **Border:** 1px Hairline.
- **Internal Padding:** 16–24px.

### Inputs / Fields
- **Style:** 42px, white, Strong Hairline stroke, 8px radius, 15px text; labels above at 13px/600, help text 12px Mist Grey.
- **Focus:** navy border plus the focus halo.
- **Error:** a Danger Blush message box with Danger Red text. Passwords render in the mono stack.

### Navigation
- **Sidebar:** 40px items, Slate text with icon, 8px radius; hover is a 5% ink wash; active is a white raised tile with hairline inset, Ink text at 600 and a corinto icon (filled weight).
- **Phone tab bar:** icon over 11px label; inactive Mist Grey, active corinto with filled icon; press scales to 0.96.

### Dialogs
Centered 16px-radius dialog over a 38% ink scrim, with a serif title header, padded body and a Linen footer. Under 720px it becomes a bottom sheet with 20px top corners and a 280ms slide-up.

### Response Summary (signature)
One card: the Display count of people coming beside its label, then a single 14px proportional bar (sage / amber / stone segments with 3px gaps) and a four-column legend of counts. This is the panel's memorable moment and the only place the Display size appears.

### Seating Table (signature)
A 92px navy disc labeled in cream, ringed by circular numbered seats. Empty seats are dashed on Linen; occupied seats show the guest; a valid drop target glows sage, a blocked one glows Danger Red. Drag on desktop, press-and-hold on phone.

### Brand Mark
The J&J Monogram (Great Vibes, shared with the invitation Hero) in Wedding Cream on a corinto shield tile: 40px in the sidebar, 26px in the phone bar, 46px at login.

## Do's and Don'ts

### Do:
- **Do** scope every admin style under `.adm-theme` and read values from its custom properties.
- **Do** express attendance only through sage, amber and stone, in that order.
- **Do** use Phosphor icons at 18–22px, regular weight, filled for the active nav or tab item.
- **Do** give every surface a 1px hairline and, at most, the Rest shadow; reserve Overlay for dialogs and the login card.
- **Do** turn tables into stacked cards and dialogs into bottom sheets at 720px and below; keep every task operable by touch.
- **Do** keep tap targets at 40px or more and inputs at 16px on phones.

### Don't:
- **Don't** use emoji anywhere in the panel; icons are Phosphor.
- **Don't** fill buttons or links with corinto; it is the brand seal and selection marker only.
- **Don't** color "no asistirá" red; declining is Stone, red is for destructive actions and errors.
- **Don't** set controls, numbers or labels in Cormorant Garamond, or use the Display size anywhere but the Respuestas count.
- **Don't** return to a dark navy slab background; the panel is light paper.
- **Don't** restyle the public invitation from this file; it follows its own Tailwind world.
