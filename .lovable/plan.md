

# MedBridge Healthcare Dashboard

## Overview
A modern, responsive hospital-to-hospital collaboration dashboard for Nigerian healthcare providers. Dark blue (#0B3C5D) primary theme with card-based layouts, sidebar navigation, and 9 core pages.

## Pages & Features

### 1. Layout Shell
- **Fixed sidebar** with collapsible icon mode: Dashboard, Facilities, Equipment, Requests, Map Locator, AI Recommendations, Profile/Settings — each with medical/tech Lucide icons
- **Top navbar** with search bar, notification bell with badge, and user avatar dropdown
- Dark blue sidebar background with white/light text

### 2. Dashboard (Home)
- 4 stat cards: Total Hospitals, Total Laboratories, Available Equipment, Pending Requests — with icons and color accents
- Quick action buttons: "Add Equipment", "Request Equipment"
- Recent Requests table with status badges (Pending/Approved/Rejected)
- Loading skeletons for all data sections

### 3. Facilities Management
- Searchable/filterable table: Name, Address, Contact, Distance
- "Add Facility" button opens a dialog form
- "View Details" button per row opening a detail sheet
- Empty state illustration when no facilities

### 4. Equipment Management
- Table: Equipment Name, Hospital, Quantity, Status (Available/In Use/Maintenance)
- Add/Edit/Delete actions with confirmation dialogs
- Status badges with color coding

### 5. Equipment Request (Form Page)
- Multi-step or single form: Select hospital (searchable dropdown), select equipment, quantity input
- Submit button with loading state and success toast

### 6. Request Tracking
- List/table of requests with status badges (yellow Pending, green Approved, red Rejected)
- Timeline/progress indicator per request showing request stages
- Filter by status

### 7. Map Locator
- Large map placeholder area (styled container ready for Google Maps integration)
- Side panel listing nearby facilities with distance, available equipment count
- Clickable facility cards that highlight on map

### 8. AI Recommendations
- Recommendation cards showing: hospital name, distance, equipment availability, "Why recommended" explanation text
- "Refer Patient" CTA button per card
- Loading skeleton state

### 9. Profile/Settings
- User info display and edit form
- Hospital affiliation details

## Design System
- **Primary**: Dark blue `#0B3C5D`, **Accent**: Soft blue `#1D6FA5`, **Success**: Green, **Warning**: Yellow, **Error**: Red
- Inter font via Google Fonts
- 8-12px border radius on cards
- Subtle shadows, card-based layouts
- Hover micro-interactions and smooth page transitions
- Responsive: desktop-first with mobile-adaptive sidebar (off-canvas on mobile)

## Component Architecture
- Reusable: `StatCard`, `StatusBadge`, `DataTable`, `FacilityCard`, `RecommendationCard`, `RequestTimeline`, `PageHeader`, `EmptyState`, `LoadingSkeleton`
- All pages as route components under sidebar layout
- Mock data for all sections (no backend initially)

