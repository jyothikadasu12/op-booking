







Service Booking Application – UI/UX Design System

Design Overview
The Service Booking Application must have a modern, trustworthy, patient-first healthcare interface inspired by the visual direction of Medicover Hospitals.
Primary visual reference:
https://www.medicoverhospitals.in/

Use the reference for its healthcare-focused presentation, clear appointment entry points, strong blue-and-white visual identity, specialty discovery, doctor/hospital information hierarchy, prominent calls to action, and reassuring patient communication.

This is a design reference only. Do not copy Medicover's logo, name, exact page composition, proprietary images, illustrations, text, source code, or other brand assets. Do not present this application as an official Medicover product or imply an affiliation.

Create an original service-booking product that applies a similar professional hospital experience to this application's own customer and administrator workflows.

Design Objectives
Create a professional healthcare application.
Make appointment booking simple and intuitive.
Keep navigation consistent across all pages.
Use a clean and uncluttered interface.
Maintain a consistent design system.
Make the application responsive.
Ensure accessibility.
Reuse UI components instead of creating duplicate designs.
The application must look like a complete healthcare SaaS product rather than a basic student CRUD project.

Design Reference
Reference website:
https://www.medicoverhospitals.in/
Visual Characteristics
Use the following characteristics as inspiration, adapting them for a booking application rather than recreating the hospital marketing website:

Clean white and very-light-blue surfaces.
A confident medical-blue primary identity with restrained teal accents.
Clear, spacious sections and strong content hierarchy.
Prominent search and appointment-booking entry points.
Patient-friendly forms with clearly labelled steps.
Doctor, provider, service, and hospital information presented in structured cards.
Simple navigation with visible primary actions.
Subtle borders and soft shadows instead of heavy glass effects.
Professional photography only where suitable, using licensed or project-owned assets.
Clear status labels and accessible contrast.
Consistent design across customer and administrator interfaces.

The result should feel like a credible healthcare service platform: calm, accessible, reassuring, and easy to use. Avoid looking like a generic analytics dashboard or a copy of the public Medicover homepage.

Color Palette
Use the following color system as the initial design foundation.
3.1 Primary Colors
Token Hex Color Purpose
Primary #3B82F6 Primary buttons and links
Primary Dark #2563EB Hover and active states
Primary Light #DBEAFE Soft backgrounds
Secondary #8B5CF6 Secondary accents
Secondary Light #EDE9FE Highlight backgrounds
3.2 Background Colors
Token Hex Color Purpose
Background #F8FAFC Main page background
Surface #FFFFFF Cards and panels
Surface Muted #F1F5F9 Secondary surfaces
Border #E2E8F0 Dividers and borders
3.3 Text Colors
Token Hex Color Purpose
Heading #0F172A Main headings
Body #334155 Regular text
Muted #64748B Secondary text
Disabled #94A3B8 Disabled content
3.4 Status Colors
Status Color Background
Success #16A34A #DCFCE7
Warning #D97706 #FEF3C7
Error #DC2626 #FEE2E2
Information #2563EB #DBEAFE
Neutral #64748B #F1F5F9
3.5A Medicover-Inspired Visual Direction
Use the palette above as an original approximation of the reference's healthcare feel; these are application design tokens, not a claim that they are Medicover's official brand values.

Header and navigation:

Use a clean white top navigation for customer-facing pages.
Keep the product logo/name on the left and primary navigation/actions easy to locate.
Use medical blue for active links and primary actions.
On the admin interface, use a restrained deep-blue sidebar or a white sidebar with blue active states; do not introduce a dark, oversized dashboard theme.
Keep the topbar clean, with notifications and profile controls grouped consistently.
Page composition:

Use a clear page title, short supporting description, and one obvious primary action.
Prefer spacious white content surfaces over large gradient backgrounds.
Use light-blue section backgrounds to separate important booking or information areas.
Use service/provider cards with consistent image ratios, concise descriptions, and clearly placed actions.
Use a clear step indicator for multi-step booking flows.
Keep data tables compact, readable, and aligned with the same surface and border tokens.
Buttons and interactions:

Primary action: solid medical blue with white text.
Secondary action: white or pale-blue surface with medical-blue text and border.
Teal is a supporting accent, not a second competing primary color.
Use restrained transitions and visible keyboard focus states.
Imagery:

Use authentic, professional healthcare imagery only when assets are available and licensed.
Do not use Medicover's logo, doctors' photographs, hospital photographs, or other proprietary assets.
If no suitable image exists, use a neutral icon or a designed placeholder rather than a random stock image.
3.5 Color Usage Rules
Primary blue must be used consistently for primary actions.
Purple must be used sparingly for secondary highlights.
Green indicates successful operations.
Red indicates destructive actions or errors.
Orange indicates pending or warning conditions.
Avoid using too many bright colors on the same screen.
Do not use arbitrary colors when an existing design token is available.
4. Typography
Use Poppins as the preferred font to align with the reference website's clean, approachable healthcare presentation. If Poppins is unavailable or not already configured, use a locally available sans-serif fallback.

Fallback:
font-family: Poppins, Inter, ui-sans-serif, system-ui, sans-serif;

Do not add multiple font families or external font dependencies unnecessarily. Keep headings confident but not oversized, and prioritize readability for patients of different age groups.
Typography Scale
Element Font Size Weight
Main page title 28–32px 700
Section heading 20–24px 600
Card heading 16–18px 600
Body text 14–16px 400
Secondary text 12–14px 400
Button text 14–15px 600
Table text 13–14px 400
Typography Rules
Use clear heading hierarchy.
Avoid oversized text in dashboard cards.
Maintain readable line heights.
Do not use too many font weights.
Keep text readable on mobile.
Avoid unnecessary decorative fonts.
5. Application Layout
The application must support two primary interfaces:

Customer application.
Administrator application.
Both interfaces must share common design tokens and reusable components.

5.1 Customer Layout
The customer dashboard should have:

Responsive navigation.
Top navigation bar.
User profile menu.
Main content area.
Booking overview.
Quick booking action.
Upcoming appointment section.
Suggested layout:

text
Copy
+------------------------------------------------------+
| LOGO Search Notifications User|
+------------------------------------------------------+
| |
| Welcome back, Customer |
| Manage your clinic appointments |
| |
| +-------------+ +-------------+ +----------------+ |
| | Upcoming | | Completed | | Cancelled | |
| | Appointments| | Appointments| | Appointments | |
| +-------------+ +-------------+ +----------------+ |
| |
| [ Book Appointment ] |
| |
| Upcoming Appointments |
| +--------------------------------------------------+ |
| | Date | Service | Provider | Time | Status | |
| +--------------------------------------------------+ |
| |
+------------------------------------------------------+
5.2 Admin Layout
The admin interface should use a sidebar-based dashboard.

Suggested layout:

text
Copy
+----------------+-------------------------------------+
| LOGO | Topbar Admin Profile |
| +-------------------------------------+
| Dashboard | |
| | Welcome to Admin Dashboard |
| Appointments | |
| | +--------+ +--------+ +----------+ |
| Services | | Total | | Today | | Pending | |
| | |Bookings| |Bookings| | Bookings | |
| Availability | +--------+ +--------+ +----------+ |
| | |
| Providers | Appointment Overview |
| | |
| Settings | Recent Appointments |
| | |
| Logout | |
+----------------+-------------------------------------+
5.3 Layout Dimensions
Desktop:

Sidebar width: 240–260px.
Topbar height: 64–72px.
Main content padding: 24–32px.
Card spacing: 16–24px.
Tablet:

Sidebar may collapse.
Dashboard cards should use two columns where space permits.
Tables should support horizontal scrolling or responsive alternatives.
Mobile:

Sidebar becomes a drawer or bottom navigation.
Main content uses 16px horizontal padding.
Cards stack vertically.
Forms use full-width controls.
Tables become compact cards or scrollable regions.
6. Required Application Pages
6.1 Public Pages
Login Page
Elements:

Application logo and name.
Welcome heading.
Email field.
Password field.
Show/hide password control.
Remember-session option if supported.
Login button.
Link to registration.
Validation messages.
Registration Page
Elements:

Full name.
Email.
Phone number.
Password.
Confirm password.
Terms and conditions acceptance.
Register button.
Link to login.
Public registration must not include a selectable admin role.

6.2 Customer Pages
Customer Dashboard
Display:

Welcome message.
Upcoming appointment count.
Completed appointment count.
Cancelled appointment count.
Next appointment.
Recent bookings.
Book appointment button.
Services Page
Display:

Available clinic services.
Service name.
Description.
Duration.
Price.
Book now action.
Active/inactive availability where appropriate.
Appointment Booking Page
Display:

Service selection.
Provider selection if applicable.
Date picker.
Available time slots.
Booking reason.
Confirmation summary.
Submit booking button.
The appointment workflow should be divided into clear steps.

My Appointments Page
Display:

Appointment reference.
Service.
Provider.
Appointment date.
Appointment time.
Booking status.
View details action.
Reschedule action where permitted.
Cancel action where permitted.
Provide filters:

All
Upcoming
Pending
Confirmed
Completed
Cancelled
Booking History Page
Display:

Previous appointments.
Status changes.
Rescheduling information.
Cancellation information.
Appointment dates.
Profile Page
Display:

Full name.
Email.
Phone.
Profile information.
Update profile action.
6.3 Admin Pages
Admin Dashboard
Display:

Total bookings.
Today's bookings.
Pending bookings.
Confirmed bookings.
Completed bookings.
Cancelled bookings.
Recent appointments.
Upcoming appointments.
Service Management
Display:

Service list.
Add service.
Edit service.
Activate/deactivate service.
Service duration.
Service price.
Provider Management
Display:

Provider list.
Add provider.
Edit provider.
Specialization.
Active/inactive status.
Availability Management
Display:

Calendar view.
Provider selection.
Service selection.
Available dates.
Time slots.
Slot capacity.
Create and update slots.
Deactivate slots.
Appointment Management
Display:

All bookings.
Customer information.
Service details.
Provider details.
Appointment date and time.
Booking status.
Search and filters.
Booking detail view.
Status update actions.
7. Reusable Component Design System
Create reusable UI components inside:

text
Copy
frontend/src/components/
7.1 Buttons
Required variants:

Primary
Secondary
Outline
Ghost
Danger
Disabled
Button requirements:

Consistent height.
Rounded corners.
Clear hover states.
Visible focus states.
Loading state when submitting.
Disabled state when an action is unavailable.
7.2 Input Fields
Requirements:

Consistent height.
Clear labels.
Helpful placeholders.
Validation messages.
Error borders.
Focus states.
Disabled states.
Accessible label associations.
7.3 Cards
Use cards for:

Dashboard statistics.
Service information.
Appointment details.
Provider profiles.
Information summaries.
Card style:

White background.
Subtle border.
Rounded corners.
Soft shadow where appropriate.
Consistent internal spacing.
7.4 Badges
Use status badges for:

Pending.
Confirmed.
Completed.
Cancelled.
Active.
Inactive.
Badges must use consistent colors and readable contrast.

7.5 Tables
Tables should support:

Clear column headings.
Consistent row spacing.
Hover states.
Empty states.
Loading states.
Responsive behavior.
Pagination when necessary.
7.6 Modals and Dialogs
Use modals for:

Confirming cancellations.
Confirming destructive actions.
Viewing appointment details.
Editing records where appropriate.
Important destructive actions must require confirmation.

7.7 Feedback Components
Create reusable components for:

Loading spinner.
Skeleton loader.
Empty state.
Error message.
Success notification.
Confirmation dialog.
Avoid browser alert() and confirm() for normal application interactions.

Appointment Calendar Design
The calendar is one of the most important parts of the application.
Requirements
Display available appointment dates.
Allow customers to select dates.
Display available time slots.
Clearly distinguish unavailable slots.
Show selected slots visually.
Display appointment duration.
Support responsive layouts.
Time Slot States
State Visual Treatment
Available Light blue background
Selected Strong primary blue
Unavailable Grey and disabled
Booked Neutral or unavailable style
Loading Skeleton or placeholder
The frontend must retrieve availability from the backend.

Never assume a slot is available based only on its appearance in the UI.

Always revalidate availability on the backend during booking submission.

Forms and Validation Design
Use React Hook Form and Zod for frontend form management and validation.
Use Pydantic for backend validation.

Form Requirements
Display labels for every input.
Mark required fields.
Show validation messages near fields.
Prevent duplicate submissions.
Show loading states.
Preserve valid input when an API request fails.
Display clear success and failure feedback.
Registration Validation
Name is required.
Email must be valid.
Password must meet security requirements.
Confirm password must match.
Phone number must follow the configured format.
Booking Validation
Service is required.
Provider is required when applicable.
Date is required.
Time slot is required.
Booking reason follows configured length limits.
The selected slot must be available.
Backend validation is mandatory even when frontend validation succeeds.

Responsive Design Requirements
The application must work across:
Desktop.
Laptop.
Tablet.
Mobile.
Use Tailwind CSS responsive utilities.

Suggested breakpoints:

Breakpoint Minimum Width Design
sm 640px Large mobile
md 768px Tablet
lg 1024px Small desktop
xl 1280px Desktop
2xl 1536px Large desktop
Responsive Rules
Desktop:

Full sidebar.
Multi-column dashboard.
Full appointment tables.
Wide forms where appropriate.
Tablet:

Collapsible sidebar.
Two-column cards.
Flexible forms.
Compact tables.
Mobile:

Mobile navigation.
Single-column content.
Full-width buttons.
Stacked form fields.
Touch-friendly controls.
Scrollable or card-based appointment lists.
Avoid horizontal overflow.

Do not hide essential functionality on smaller screens.

Accessibility Requirements
Follow WCAG 2.2 AA principles where practical.
Requirements:

Use semantic HTML.
Provide labels for form controls.
Support keyboard navigation.
Maintain visible focus indicators.
Use sufficient color contrast.
Do not communicate status using color alone.
Provide accessible names for icon-only buttons.
Support screen readers.
Provide descriptive validation messages.
Manage keyboard focus in modals.
Use appropriate heading hierarchy.
Make touch targets comfortably usable.
Respect reduced-motion preferences.
12. Loading, Empty and Error States
Every data-driven page must support three important states.

Loading State
Use skeleton loaders for cards and tables.
Prevent confusing repeated submissions.
Show a loading indicator during API operations.
Empty State
Examples:

No appointments available.
No bookings found.
No services available.
No booking history.
Empty states should explain what happened and provide a useful next action where appropriate.

Error State
Show clear and user-friendly messages.
Provide retry options when appropriate.
Avoid displaying raw server errors.
Preserve the user's input where possible.
13. Tailwind CSS Rules
Use Tailwind CSS for the primary styling system.

Requirements:

Use Tailwind utility classes.
Use reusable components for repeated patterns.
Define shared design tokens.
Avoid unnecessary inline styles.
Avoid arbitrary colors when tokens exist.
Maintain consistent spacing.
Use responsive utilities.
Keep class names readable.
The AI assistant must use the Tailwind version selected in the project setup and follow that version's configuration conventions.

Do not introduce unnecessary competing styling frameworks.

Iconography
Use Lucide React.
Examples:

LayoutDashboard
CalendarDays
CalendarCheck
Clock
Users
UserRound
Stethoscope
ClipboardList
Settings
LogOut
Search
Bell
Plus
Pencil
Trash2
CheckCircle
XCircle
Rules:

Maintain consistent icon sizes.
Do not mix unrelated icon libraries.
Use icons with accessible labels when necessary.
Do not use decorative icons excessively.
15. Motion and Interactions
Use subtle animations only where they improve usability.

Examples:

Button hover transitions.
Sidebar transitions.
Modal fade-in.
Dropdown opening.
Skeleton loading.
Toast notifications.
Avoid excessive animations.

Respect prefers-reduced-motion.

Frontend Performance Guidelines
Use reusable components.
Avoid unnecessary re-renders.
Load data only when needed.
Use pagination for large lists.
Avoid unnecessary API requests.
Lazy-load suitable page components.
Optimize images.
Avoid large dependencies without a clear need.
Keep component responsibilities focused.
Design Consistency Rules for AI Assistant
The AI assistant must follow these rules:
Read this file before creating or modifying frontend components.
Use Medicover Hospitals (https://www.medicoverhospitals.in/) as the visual reference for a professional, patient-first healthcare experience.
Follow the medical-blue, white, and restrained teal color palette defined in this file.
Use Poppins as the preferred font, with the documented sans-serif fallback.
Maintain the same design language across all pages.
Reuse shared components.
Follow the responsive design requirements.
Never create an unrelated design for an individual page.
Avoid excessive gradients and decorative effects.
Do not use random colors or arbitrary spacing.
Do not create unnecessarily oversized dashboards.
Keep appointment information easy to understand.
Display booking statuses consistently.
Ensure all forms have validation feedback.
Include loading, error and empty states.
Follow accessibility requirements.
Use JavaScript and React only, not TypeScript.
Use Tailwind CSS for styling.
Use Lucide React for icons.
Do not copy Medicover's logo, name, branding, proprietary images, page composition, or source code. The application must remain an original product and must not imply an official affiliation.
Test designs at desktop, tablet and mobile widths.
Do not remove existing working UI features, routes, API integrations, data fields, validation, or booking logic while updating the design. Treat this as a visual redesign, not a functional rewrite.
18. Design Completion Criteria
The design implementation is considered complete when:

Login and registration pages are consistent.
Customer dashboard is implemented.
Admin dashboard is implemented.
Appointment booking interface is implemented.
Calendar and time-slot selection work correctly.
Booking history is readable and organized.
Service and provider management interfaces are consistent.
Shared components are reusable.
Responsive behavior works on desktop, tablet and mobile.
Forms provide proper validation feedback.
Loading, empty and error states are implemented.
Keyboard navigation and accessibility are considered.
The overall design follows the Medicover-inspired professional, patient-first healthcare direction while remaining an original product.
End of design.md

SL
⚙
Create richer images from your files
Upgrade to transform your uploaded files and images with more precision, consistency, and detail using increased reasoning.



