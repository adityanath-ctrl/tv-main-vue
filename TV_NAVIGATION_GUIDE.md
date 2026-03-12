# TV Remote Navigation Guide

Your Vue app is now TV-remote navigatable! Here's how to use it.

## How It Works

The TV navigation system allows users to navigate your app using only:
- **Arrow Keys** (↑ ↓ ← →) - Navigate between focusable elements
- **Enter Key** - Select/click the focused element
- **Escape Key** - Clear focus

## Making Components TV-Navigatable

### Method 1: Using the `data-tv-focusable` Attribute (Recommended)

Add `data-tv-focusable` to any element you want to be navigatable:

```vue
<template>
  <button data-tv-focusable>Click Me</button>
  <v-btn data-tv-focusable>Vuetify Button</v-btn>
  <a href="/page" data-tv-focusable>Link</a>
</template>
```

### Method 2: Using the `v-tv-focusable` Directive

```vue
<template>
  <button v-tv-focusable>Click Me</button>
  <v-btn v-tv-focusable>Vuetify Button</v-btn>
  <div v-tv-focusable @click="handleClick">Custom Element</div>
</template>
```

### Method 3: Using the Utility Functions

```vue
<script setup>
import { makeTVFocusable, removeTVFocusable } from '@/utils/tvNavigation'
import { ref, onMounted } from 'vue'

const buttonRef = ref(null)

onMounted(() => {
  makeTVFocusable(buttonRef.value)
})
</script>

<template>
  <button ref="buttonRef">Click Me</button>
</template>
```

## Examples

### Example 1: TV-Friendly Menu

```vue
<template>
  <div class="tv-grid">
    <button v-for="item in menuItems" :key="item.id" data-tv-focusable @click="selectItem(item)">
      {{ item.name }}
    </button>
  </div>
</template>

<script setup>
const menuItems = [
  { id: 1, name: 'Home' },
  { id: 2, name: 'Browse' },
  { id: 3, name: 'Settings' }
]

const selectItem = (item) => {
  console.log('Selected:', item.name)
}
</script>
```

### Example 2: TV-Friendly Form

```vue
<template>
  <form class="tv-form">
    <div class="form-group">
      <label>Username</label>
      <input type="text" data-tv-focusable placeholder="Enter username" />
    </div>
    
    <div class="form-group">
      <label>Password</label>
      <input type="password" data-tv-focusable placeholder="Enter password" />
    </div>
    
    <button type="submit" data-tv-focusable class="tv-button">Login</button>
    <button type="reset" data-tv-focusable class="tv-button">Cancel</button>
  </form>
</template>

<style scoped>
.tv-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group input {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 2px solid #ccc;
}

.form-group input:focus {
  border-color: #27AAE1;
}
</style>
```

### Example 3: TV-Friendly Card Grid

```vue
<template>
  <div class="tv-grid" style="grid-template-columns: repeat(3, 1fr)">
    <div v-for="card in cards" :key="card.id" class="tv-card" data-tv-focusable @click="selectCard(card)">
      <img :src="card.image" :alt="card.title" />
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
    </div>
  </div>
</template>

<script setup>
const cards = [
  { id: 1, title: 'Card 1', description: 'Description 1', image: '/img1.jpg' },
  { id: 2, title: 'Card 2', description: 'Description 2', image: '/img2.jpg' },
  { id: 3, title: 'Card 3', description: 'Description 3', image: '/img3.jpg' }
]

const selectCard = (card) => {
  console.log('Selected card:', card.title)
}
</script>

<style scoped>
.tv-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 16px;
  background: #222;
  color: white;
}

.tv-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.tv-card h3 {
  margin-top: 12px;
  font-size: 18px;
}

.tv-card p {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
}
</style>
```

## Styling Focused Elements

When an element has focus, it automatically gets the `tv-focused` class. You can customize the focus style:

```css
/* Default focus style (already in global.css) */
.tv-focused {
  outline: 3px solid #27AAE1 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 3px rgba(39, 170, 225, 0.3) !important;
  transform: scale(1.02) !important;
}

/* Custom focus style for buttons */
button.tv-focused {
  background-color: #27AAE1 !important;
  color: white !important;
}

/* Custom focus style for cards */
.tv-card.tv-focused {
  box-shadow: 0 0 20px rgba(39, 170, 225, 0.5) !important;
  transform: scale(1.05) !important;
}
```

## Navigation Behavior

### Linear Navigation (Default)
- **Up/Left**: Move to previous focusable element
- **Down/Right**: Move to next focusable element
- **Enter**: Click the focused element
- **Escape**: Clear focus

### Grid Navigation (Optional)
For grid-based layouts, you can enable grid navigation:

```typescript
import { useTVNavigation } from '@/composables/useTVNavigation'

const { enable } = useTVNavigation({
  selector: '[data-tv-focusable]',
  grid: {
    rows: 3,
    cols: 4
  },
  wrapAround: true
})
```

## Tips for TV-Friendly Design

1. **Large Touch Targets**: Make buttons and clickable elements at least 48x48px
2. **Clear Focus Indicators**: The default blue outline is visible, but you can customize it
3. **Logical Tab Order**: Add elements in the order users would naturally navigate
4. **Avoid Hover States**: TV remotes don't hover, so use focus states instead
5. **Keyboard Shortcuts**: Consider adding keyboard shortcuts for common actions
6. **Feedback**: Provide visual feedback when elements are focused or clicked
7. **Spacing**: Add adequate spacing between focusable elements (16px minimum)

## Debugging

To enable debug mode, add this to your HTML:

```html
<body class="tv-debug">
  <!-- Your app -->
</body>
```

This will show red dashed outlines around focused elements for easier debugging.

## Troubleshooting

### Elements not focusable?
- Make sure they have `data-tv-focusable` attribute
- Check that they're not hidden or disabled
- Verify they're not inside a `display: none` container

### Focus not visible?
- Check that `.tv-focused` class is being applied
- Verify CSS is not being overridden
- Check browser console for errors

### Navigation not working?
- Make sure `TVNavigationProvider` is wrapping your app in `App.vue`
- Check that keyboard events are not being prevented elsewhere
- Verify no other scripts are capturing arrow keys

## API Reference

### Composable: `useTVNavigation`

```typescript
const {
  focusableElements,      // Array of focusable elements
  currentFocusIndex,      // Current focus index
  isEnabled,              // Is navigation enabled
  focusElement,           // Focus specific element by index
  moveFocus,              // Move focus (up/down/left/right)
  enable,                 // Enable navigation
  disable,                // Disable navigation
  refresh,                // Refresh focusable elements list
  updateFocusableElements // Update focusable elements
} = useTVNavigation(options)
```

### Directive: `v-tv-focusable`

```vue
<button v-tv-focusable>Click me</button>
```

### Utilities: `tvNavigation.ts`

```typescript
makeTVFocusable(element)        // Add TV navigation to element
removeTVFocusable(element)      // Remove TV navigation from element
isTVFocusable(element)          // Check if element is TV focusable
getTVFocusableElements()        // Get all TV focusable elements
focusNextTVElement()            // Focus next element
focusPreviousTVElement()        // Focus previous element
pressFocusedElement()           // Simulate Enter on focused element
```

## Support

For issues or questions, check the console for error messages and ensure all components are properly wrapped with `data-tv-focusable` attributes.