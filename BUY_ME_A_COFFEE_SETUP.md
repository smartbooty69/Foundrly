# Buy Me a Coffee Integration Setup

## Overview
We've successfully migrated from Stripe to Buy Me a Coffee for donations. This provides a simpler, more cost-effective solution for accepting small donations.

## What's Changed

### ✅ Removed
- Stripe payment processing
- Custom donation form with amount input
- `/api/donate` route
- Stripe dependency from package.json

### ✅ Added
- `BuyMeACoffeeWidget` component for floating widget
- `BuyMeACoffeeButton` component for direct links
- Updated donation page with Buy Me a Coffee integration

## Setup Instructions

### 1. Create Buy Me a Coffee Account
1. Go to [buymeacoffee.com](https://buymeacoffee.com)
2. Sign up for an account
3. Complete your profile setup
4. Note your username (e.g., `foundrly`)

### 2. Update Configuration

Replace the placeholder usernames in these files:

#### In `app/donate/page.tsx`:
```tsx
// Replace "YOUR_BUY_ME_A_COFFEE_USERNAME" with your actual username
<BuyMeACoffeeWidget 
  username="foundrly"  // Your actual username
  // ... other props
/>

// Replace "YOUR_USERNAME" with your actual username
<BuyMeACoffeeButton username="foundrly" className="px-6 py-3 text-lg">
```

#### In `components/BuyMeACoffeeWidget.tsx`:
```tsx
// Update the default description and message as needed
description = "Support Foundrly",
message = "Thank you for supporting Foundrly! Your contribution helps us keep building amazing features for the startup community.",
```

### 3. Customize the Widget

You can customize the Buy Me a Coffee widget with these options:

- **color**: Hex color code (default: "#4E71FF")
- **position**: "Left" or "Right" (default: "Right")
- **xMargin/yMargin**: Position margins in pixels
- **description**: Widget description
- **message**: Thank you message

### 4. Add Widget to Other Pages

To add the floating widget to other pages, simply import and use:

```tsx
import BuyMeACoffeeWidget from '@/components/BuyMeACoffeeWidget';

// In your component
<BuyMeACoffeeWidget username="foundrly" />
```

### 5. Add Button to Navigation

To add a Buy Me a Coffee button to your navbar or footer:

```tsx
import BuyMeACoffeeButton from '@/components/BuyMeACoffeeButton';

// In your navbar/footer
<BuyMeACoffeeButton username="foundrly" />
```

## Benefits of Buy Me a Coffee

### ✅ Advantages
- **Lower fees**: 5% + $0.25 per transaction (vs Stripe's 2.9% + $0.30)
- **Simpler setup**: No payment processing code needed
- **Built-in features**: Supporter management, analytics, messaging
- **Trusted platform**: Users are familiar with Buy Me a Coffee
- **Mobile optimized**: Works great on all devices

### ⚠️ Considerations
- **Limited customization**: Less control over the payment flow
- **Platform dependency**: Tied to Buy Me a Coffee's platform
- **Currency**: Primarily USD (though supports multiple currencies)

## Environment Variables

You can remove these Stripe-related environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`

## Testing

1. Update the usernames in the code
2. Run your development server
3. Visit `/donate` to see the new donation page
4. Test the Buy Me a Coffee widget and button

## Analytics

Buy Me a Coffee provides built-in analytics:
- Number of supporters
- Total donations
- Supporter messages
- Monthly/quarterly reports

Access these through your Buy Me a Coffee dashboard.

## Support

For Buy Me a Coffee support:
- [Documentation](https://www.buymeacoffee.com/help)
- [Widget Documentation](https://www.buymeacoffee.com/widgets)
- [Contact Support](https://www.buymeacoffee.com/help/contact) 