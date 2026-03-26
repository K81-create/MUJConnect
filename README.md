
# Urban Home Services - React + Vite + TypeScript

A modern home services booking platform inspired by Urban Company, built with React, Vite, TypeScript, Tailwind CSS, and Shadcn UI components.

## Features

- 🏠 **Home Page** - Hero section, category grid, and featured services
- 📋 **Services Listing** - Filterable service catalog with tabs
- 🔍 **Service Details** - Detailed view with add-ons selection
- 🛒 **Shopping Cart** - Side drawer cart with item management
- ✅ **Checkout Flow** - Address input, date/time selection, order summary
- 📱 **Responsive Design** - Mobile-first, desktop-optimized

## Tech Stack

- **React 18**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **React Router**
- **Lucide React**

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
npm install
npm run dev


##Build for Production
npm run build
## Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── layout/          # Layout components (Navbar, AppLayout)
│   ├── ServiceCard.tsx  # Reusable service card
│   └── CategoryCard.tsx # Category card component
├── pages/               # Page components
│   ├── HomePage.tsx
│   ├── ServicesPage.tsx
│   ├── ServiceDetailsPage.tsx
│   └── CheckoutPage.tsx
├── context/             # React context (booking state)
├── data/                # Mock data
├── types/               # TypeScript types
├── lib/                 # Utilities
└── App.tsx              # Main app component
```

## Design Principles

- **Clean & Professional** - Urban Company-inspired aesthetic
- **Container Width** - Max-width 1200px for optimal readability
- **Spacing & Typography** - Consistent spacing scale and font hierarchy
- **Muted Backgrounds** - Slate-50 background with white content cards
- **Rounded Corners** - Consistent border-radius (rounded-2xl for cards)
- **Subtle Animations** - Hover effects with translate and shadow transitions

## Key Components

### UI Components (Shadcn-style)
- `Button` - Multiple variants (default, outline, ghost, secondary)
- `Input` - Styled form inputs
- `Sheet` - Side drawer for cart
- `Tabs` - Category navigation
- `AlertDialog` - Confirmation dialogs
- `Calendar` - Date picker

### Pages
- **HomePage** - Landing page with hero and categories
- **ServicesPage** - Service listing with category tabs
- **ServiceDetailsPage** - Service details with add-ons
- **CheckoutPage** - Complete checkout flow

## State Management

Uses React Context API (`BookingContext`) for:
- Cart management
- Booking details (address, date, time)
- Service selection and add-ons

## Future Enhancements

- Backend API integration
- User authentication
- Payment gateway integration
- Order history
- Reviews and ratings
- Service provider profiles

## License

MIT
>>>>>>> 1b18d69 (Initial commit)
=======
# MUJConnect
A Localized Home Services Booking and Tracking Platform.
>>>>>>> 76aafb2db5ce267a34aa550db75163f2e7b7b250
