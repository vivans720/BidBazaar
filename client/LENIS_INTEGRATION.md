# 🌊 Lenis Smooth Scrolling Integration

This document outlines the implementation of Lenis smooth scrolling in the BidBazaar application.

## 🚀 Installation & Setup

### 1. Package Installation

```bash
npm install lenis
```

### 2. Files Added

- `src/context/LenisContext.jsx` - React context provider for Lenis
- `src/styles/lenis.css` - Lenis-specific CSS styles
- `src/hooks/useScrollToTop.js` - Custom hooks for scroll functionality
- `src/components/layout/ScrollToTopButton.jsx` - Floating scroll-to-top button
- `src/components/layout/SmoothScrollLink.jsx` - Component for smooth scroll links

### 3. Configuration Applied

- **Duration**: 1.2 seconds for smooth animations
- **Easing**: Custom easing function for natural feel
- **Direction**: Vertical scrolling
- **Auto RAF**: Enabled for optimal performance
- **Touch Multiplier**: 2x for better mobile experience

## 🎯 Features Implemented

### ✅ Core Features

- **Smooth Page Scrolling**: All page scrolling is now smooth and natural
- **Scroll to Top Button**: Appears after scrolling 300px down
- **Context Provider**: Centralized Lenis management
- **Custom Hooks**: Easy-to-use scroll functionality

### ✅ Components Available

#### LenisProvider

Wraps your entire application and provides Lenis context:

```jsx
import { LenisProvider } from "./context/LenisContext";

<LenisProvider>
  <App />
</LenisProvider>;
```

#### ScrollToTopButton

Floating button that appears when user scrolls down:

```jsx
import ScrollToTopButton from "./components/layout/ScrollToTopButton";

// Automatically appears in App.jsx
```

#### SmoothScrollLink

For smooth scrolling to specific elements:

```jsx
import SmoothScrollLink from "./components/layout/SmoothScrollLink";

<SmoothScrollLink to="#section-id" offset={-100}>
  Scroll to Section
</SmoothScrollLink>;
```

#### useScrollToTop Hook

For programmatic scrolling:

```jsx
import { useScrollToTop } from "./hooks/useScrollToTop";

const scrollToTop = useScrollToTop();

const handleClick = () => {
  scrollToTop();
};
```

## 🔧 Usage Examples

### Basic Smooth Scrolling

All page scrolling is automatically smooth - no additional code needed!

### Scroll to Specific Element

```jsx
import { useLenis } from "./context/LenisContext";

const MyComponent = () => {
  const { scrollTo } = useLenis();

  const handleScrollToProducts = () => {
    scrollTo("#products-section", {
      offset: -80,
      duration: 1.5,
    });
  };

  return <button onClick={handleScrollToProducts}>View Products</button>;
};
```

### Prevent Smooth Scrolling on Specific Elements

Add the `data-lenis-prevent` attribute:

```jsx
<div data-lenis-prevent>
  {/* This content will have normal scrolling */}
  <div style={{ height: "500px", overflow: "auto" }}>
    <p>Content with normal scroll behavior</p>
  </div>
</div>
```

### Control Lenis Programmatically

```jsx
import { useLenis } from "./context/LenisContext";

const MyComponent = () => {
  const { start, stop, lenis } = useLenis();

  const pauseScrolling = () => stop();
  const resumeScrolling = () => start();

  return (
    <div>
      <button onClick={pauseScrolling}>Pause Smooth Scroll</button>
      <button onClick={resumeScrolling}>Resume Smooth Scroll</button>
    </div>
  );
};
```

## 🎨 CSS Classes Available

### Lenis CSS Classes

```css
/* Applied automatically */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
```

### Custom Scrollbar Styling

Enhanced scrollbar appearance included in `lenis.css`.

## 📱 Mobile Considerations

- **Touch Multiplier**: Set to 2x for better mobile responsiveness
- **Smooth Touch**: Disabled by default for better iOS compatibility
- **Gesture Orientation**: Vertical only for consistent behavior

## ⚡ Performance

- **Auto RAF**: Enabled for optimal performance
- **Lightweight**: Minimal impact on bundle size
- **GPU Accelerated**: Uses modern browser APIs for smooth animations

## 🔧 Configuration Options

The Lenis instance is configured in `LenisContext.jsx`:

```javascript
const lenis = new Lenis({
  duration: 1.2, // Animation duration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
  direction: "vertical", // Scroll direction
  gestureOrientation: "vertical", // Gesture orientation
  smooth: true, // Enable smooth scrolling
  smoothTouch: false, // Disable on touch devices
  touchMultiplier: 2, // Touch sensitivity
  infinite: false, // Disable infinite scroll
  autoRaf: true, // Auto request animation frame
});
```

## 🚀 Benefits for BidBazaar

1. **Enhanced UX**: Smooth, natural scrolling throughout the application
2. **Modern Feel**: Professional, polished user experience
3. **Better Navigation**: Smooth transitions between sections
4. **Accessibility**: Maintained scroll behavior with enhanced smoothness
5. **Performance**: Optimized for modern browsers

## 🛠️ Troubleshooting

### Common Issues

**Scrolling feels too slow/fast:**

```javascript
// Adjust duration in LenisContext.jsx
duration: 0.8; // Faster
duration: 1.8; // Slower
```

**Issues with modals or overlays:**

```jsx
// Add data-lenis-prevent to modal containers
<div data-lenis-prevent className="modal">
  Modal content
</div>
```

**Need to disable on mobile:**

```javascript
// In LenisContext.jsx
smoothTouch: true; // Enable on touch devices
```

## 📋 Next Steps

1. ✅ Lenis installed and configured
2. ✅ Context provider created
3. ✅ Scroll-to-top button added
4. ✅ Custom hooks available
5. ✅ CSS styles applied

### Optional Enhancements

- Add scroll progress indicator
- Implement scroll-triggered animations
- Add smooth scrolling to navigation links
- Create scroll-spy navigation highlighting

The smooth scrolling is now active throughout your BidBazaar application! 🎉
