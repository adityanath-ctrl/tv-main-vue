// Debug script to test TV navigation
// Run this in browser console to see what elements are detected

console.log('=== TV Navigation Debug ===');

// Check for focusable elements
const focusableElements = document.querySelectorAll('[data-tv-focusable]');
console.log(`Found ${focusableElements.length} focusable elements:`);

focusableElements.forEach((el, index) => {
  const rect = el.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0;
  const computedStyle = window.getComputedStyle(el);
  const isDisplayed = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
  
  console.log(`${index + 1}. ${el.tagName} - ${el.className}`);
  console.log(`   Visible: ${isVisible}, Displayed: ${isDisplayed}`);
  console.log(`   Position: ${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`);
  console.log(`   Text: "${el.textContent?.trim().substring(0, 50)}..."`);
  console.log('---');
});

// Check for EPG specific elements
const channels = document.querySelectorAll('.channel-logo-container');
const programs = document.querySelectorAll('.program-card');
console.log(`\nEPG Elements:`);
console.log(`Channels: ${channels.length}`);
console.log(`Programs: ${programs.length}`);

// Test focus
console.log('\n=== Testing Focus ===');
if (focusableElements.length > 0) {
  const firstElement = focusableElements[0];
  firstElement.classList.add('tv-focused');
  console.log('Added focus to first element');
  
  setTimeout(() => {
    firstElement.classList.remove('tv-focused');
    console.log('Removed focus from first element');
  }, 2000);
}

// Check for navigation provider
const navProvider = document.querySelector('.tv-navigation-provider');
console.log(`\nNavigation Provider: ${navProvider ? 'Found' : 'Not found'}`);

// Check for EPG container
const epgContainer = document.querySelector('.epg-container');
console.log(`EPG Container: ${epgContainer ? 'Found' : 'Not found'}`);

console.log('\n=== Debug Complete ===');