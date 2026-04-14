
# Law Firm Careers Directory

## Overview
A searchable directory of the top 150 US law firms (based on the Am Law 200 ranking) with card-style layout, each linking to the firm's careers page.

## Pages
1. **Home (`/`)** — Hero section with title, description, and search/filter bar, followed by a grid of firm cards
2. **About (`/about`)** — Brief explanation of the site's purpose and data sources

## Features

### Firm Cards
Each card displays:
- Firm name and Am Law ranking
- Headquarters city & state
- Number of attorneys (approximate)
- Practice area tags (e.g., Corporate, Litigation, IP)
- Direct link button to the firm's careers page (opens in new tab)

### Search & Filters
- **Text search** — Filter firms by name in real-time
- **State filter** — Dropdown to filter by headquarters state
- **Size filter** — Filter by firm size (e.g., 500+, 1000+, 2000+ attorneys)
- **Sort options** — By ranking, alphabetical, or firm size

### Data
- A static JSON dataset of the top 150 firms compiled from the Am Law ranking, including firm name, ranking, HQ location, approximate attorney count, practice areas, and career page URL
- No database needed — data is bundled with the app

### Design
- Clean, professional look with a light theme
- Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Each card has a prominent "View Careers" button
- Result count shown above the grid
