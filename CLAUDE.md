Build a full-featured, mobile-first React web application called Ski Butlers — an internal operations tool for ski rental technicians and shop staff. The entire UI must be oriented vertically (portrait mode) — no horizontal scrolling anywhere. Design for iPad use with large tap targets, minimal text entry, and bold readable typography. Use a clean, dark alpine aesthetic — navy/charcoal backgrounds, white text, gold (#FFD700) as the primary accent color. Use React with React Router for navigation and mock data throughout (no backend required).
Before starting each phase, confirm the previous phase passes all tests. Do not proceed to the next phase until all tests in the current phase are green.

PHASE 1 — PROJECT SETUP + LOGIN
Build:

Initialize React app with React Router
Global CSS: portrait-only layout, dark alpine theme (navy/charcoal bg, white text, gold accent #FFD700), minimum 48px tap targets
Login page: Ski Butlers logo centered, username + password fields, submit button
Accepted credentials: username: Christo / password: Swag
On success → navigate to Tech Home (stub page is fine for now)
On failure → inline error message: "Invalid credentials"

Tests — Phase 1:

 App loads without console errors
 Login page renders logo, both input fields, and submit button
 Entering wrong credentials shows "Invalid credentials" error
 Entering correct credentials (Christo / Swag) routes to the next page
 No horizontal scrolling present on a 768px-wide viewport
 All tap targets are at minimum 48px tall


PHASE 2 — TECH HOME (Route Dashboard) + BOTTOM NAV
Build:

Header: tech name ("Christo") + today's date
AM/PM shift toggle (AM: 7AM–2PM, PM: 2PM–10PM) — switching filters route cards shown
Scrollable vertical list of route stop cards. Each card shows:

Stop number, customer name, address, neighborhood tag
Delivery cards: EXPRESS or SIGNATURE badge, number of renters
Pickup cards: visually distinct color/icon, labeled "PICKUP"


Bottom nav bar with 4 icons: Schedule, Search, Packing, New Reservation (routes to stub pages for now)
Seed mock data: 3 AM stops (2 deliveries, 1 pickup) + 3 PM stops (2 deliveries, 1 pickup). Each delivery has 2–3 renters.

Tests — Phase 2:

 Route cards render for AM shift by default
 Toggling to PM shift replaces the list with PM stops
 Delivery cards show renter count and delivery type badge
 Pickup cards are visually distinct from delivery cards
 Neighborhood tag appears on every card
 Bottom nav renders all 4 icons and tapping each navigates to its stub page
 No horizontal scroll at any point
 Tapping a delivery card navigates to a stub Delivery Detail page (Phase 3 will build this out)


PHASE 3 — DELIVERY DETAIL PAGE
Build:

Address + neighborhood tag at top
"Add / Remove Equipment" button (opens modal — wire up in Phase 4)
"Pay Bill" button — grayed out until all renters have signed waivers, then turns gold/active
Per-renter collapsible cards:

Header: renter name + expand/collapse chevron
When expanded:

Equipment image (placeholder) next to 5-digit inventory number field (editable) + ⓘ More Info icon → modal with product name, specs, short description
Boot selection: 2 size options, recommended one highlighted in gold. Ski boot sizes display in half sizes (25.5, 26.5, etc.) or whole sizes (26, 27, etc.)
Poles (with length) or Bindings (with DIN setting) shown below boots
After a boot is selected → "Sign Waiver" button appears
Tapping "Sign Waiver" → modal with waiver text + touchable signature canvas. On confirm → green checkmark appears on that renter's card




Once ALL renters have signed → "Pay Bill" button becomes gold and active

Tests — Phase 3:

 Delivery detail page loads with correct address and stop data
 Each renter card collapses and expands correctly
 Equipment image, inventory number field, and ⓘ icon all render
 ⓘ modal opens and closes correctly
 Two boot size options display; recommended one is highlighted gold
 Tapping a boot size selects it (visual confirmation)
 "Sign Waiver" button does not appear until a boot is selected
 Signature modal opens, accepts touch/mouse input, and confirms
 Signed renter shows green checkmark
 "Pay Bill" remains grayed out until every renter is signed
 "Pay Bill" turns gold once all renters have signed


PHASE 4 — ADD/REMOVE EQUIPMENT MODAL + PAY BILL FLOW
Build — Add/Remove Equipment Modal (3 steps):

Step 1: Select renter (list of names at this stop)
Step 2: Equipment options with price per day:

Helmet (size selector: XS/S/M/L/XL)
Goggles
Upgrade to Premium Comfort Boots
Upgrade to High Performance Boots


Step 3: Confirm screen — summary of changes + updated total

Build — Pay Bill Flow:

Screen 1: Itemized receipt (all renters, equipment, add-ons). Scroll to see total. Tip options: 15% / 20% / 25% / Custom / No Tip. "Pay" button at bottom.
Screen 2: Shop contact info + equipment pickup instructions. "Next" button.
Screen 3: Full-screen thank-you + survey link (5% off next rental) + "Thank you for renting with us!"

Small X in top-right → tech-facing Pickup Notes screen:

Dropdown: "In front of house" / "From Ski Valet" / "Slope Side Lounge" / "Other"
Selecting "Other" reveals a text input
"Confirm" button saves the note





Tests — Phase 4:

 "Add/Remove Equipment" button opens modal
 Step 1 shows all renters at the stop as selectable
 Step 2 shows all 4 equipment options with per-day pricing
 Helmet size selector works correctly
 Step 3 shows accurate summary and updated total
 Confirming add/remove closes modal and reflects changes in renter card
 Pay Bill Screen 1 shows itemized receipt with correct totals
 All 5 tip options work; custom tip accepts numeric input
 "Pay" navigates to Screen 2
 "Next" on Screen 2 navigates to thank-you Screen 3
 Survey link is present and tappable
 X button on Screen 3 opens Pickup Notes screen
 "Other" selection in dropdown reveals text input
 "Confirm" saves pickup note and closes screen


PHASE 5 — PICKUP DETAIL PAGE
Build:

Accessed by tapping a pickup card from the route
Address displayed prominently at top
"Open in Google Maps" button → links to https://maps.google.com/?q=ADDRESS
Pickup notes displayed below (editable inline)
Checklist of items to collect with checkboxes

Tests — Phase 5:

 Tapping a pickup card from the route navigates to this page
 Address renders correctly at the top
 Google Maps button opens correct URL with address pre-filled
 Pickup notes are visible and editable
 Each item in the checklist can be checked/unchecked
 Checked items show visual completion state


PHASE 6 — SEARCH PAGE
Build:

Search bar (name or reservation ID)
Default date = today (auto-populated)
"Expand Search" toggle reveals date range picker
Collapsible filter panel:

Delivery Type: Express | Signature
Price Range: slider ($0–$1000+)
Assigned Tech: dropdown (Christo, Jake, Maria, Devon)
Date Range: start + end date pickers
Status: Upcoming | Completed | Cancelled
Neighborhood: dropdown


Results: vertical cards showing name, date, delivery type, status badge, assigned tech
Seed 5–6 past reservations in mock data

Tests — Phase 6:

 Search page loads with today's date pre-populated
 Typing in search bar filters results in real time
 "Expand Search" toggle shows/hides date range picker
 Filter panel opens and closes
 Each filter (type, price, tech, status, neighborhood) correctly narrows results
 Results display all required fields per card
 Empty state shown when no results match filters
 No horizontal scroll


PHASE 7 — PACKING PAGE
Build — Day View:

Left/right arrows to navigate dates; current date centered at top
Scrollable list of pack items: renter name + packed status icon (✅ packed / ⬜ not packed)

Build — Pack Item Detail (tap to open):

What they rented: ski or snowboard, type/model, package name
2 recommended boot sizes (auto-calculated from shoe size using mondo sizing conversion)
Per boot size: 5-digit inventory input with first 2 digits pre-filled (e.g. size 26.5 → "26___", size 25.5 → "25___")
Poles section: recommended length or "N/A"
Bindings section: DIN range or "N/A"
"Mark as Packed" button

Build — Quick Pack Screen (tab/toggle within Packing):

Groups all items for selected day by category: Skis, Snowboards, Boots (by size), Poles (by length), Helmets (by size), Goggles
Seed 6–8 pack items across today and tomorrow

Tests — Phase 7:

 Day view loads with today's date
 Left/right arrows correctly change the date and reload the correct pack list
 Pack items show correct status icons
 Tapping a pack item opens the detail view
 Boot sizes are correctly auto-calculated and pre-filled
 Inventory number inputs accept only the last 3 digits (first 2 pre-filled)
 Poles/bindings section renders correctly or shows "N/A"
 "Mark as Packed" updates the icon in the day view list
 Quick Pack tab renders and correctly groups all items by category
 Counts per category are accurate


PHASE 8 — CREATE RESERVATION (Multi-Step Flow)
Build:

Step 1: Number of renters (stepper: +/-)
Step 2: Per-renter form — Name, Height (ft/in), Weight (lbs), Shoe size (US), Ability (Beginner / Intermediate / Advanced / Expert — large tap buttons)
Step 3: Package selection per renter — large image cards with package name, description, price/day, discount callout:

Basic Ski, Signature Ski, Performance Ski, Basic Snowboard, Signature Snowboard


Step 4: Delivery details — AM or PM window, delivery address, Express or Signature type
Step 5: Order summary + Confirm button
On confirmation:

Auto-generate neighborhood tag via keyword matching (e.g. "Beaver Creek" → "Beaver Creek Village", "Bachelor" → "Bachelor Gulch", "Arrowhead" → "Arrowhead", default → "Avon / Edwards")
Show confirmation screen with reservation ID, full summary, neighborhood tag
New reservation appears in Search results and on the correct day's route



Tests — Phase 8:

 Step 1 stepper correctly sets renter count (minimum 1)
 Step 2 generates the correct number of renter forms
 All renter fields validate (no empty submission)
 Ability selector highlights the selected option
 Step 3 shows one package selection screen per renter
 Selecting a package highlights it and enables "Next"
 Step 4 delivery window toggle, address field, and delivery type all work
 Step 5 summary shows all renters, packages, delivery details, and correct pricing
 Confirming generates a unique reservation ID
 Neighborhood tag is correctly auto-assigned based on address
 New reservation appears in Search page results
 New reservation appears on the Tech Home route for the correct shift


FINAL INTEGRATION TEST (Run after all phases complete)

 Full login → home → delivery → sign waivers → pay flow completes without errors
 Full login → home → pickup card → maps link works
 Add/remove equipment updates receipt total correctly
 New reservation created in Phase 8 flows into route and search correctly
 Packing page reflects newly created reservations
 Bottom nav works correctly from every page
 No console errors throughout any flow
 No horizontal scroll on any page at 768px viewport width
 All gold/green/red state colors appear at correct moments
 App is fully usable by touch input (no hover-only interactions)