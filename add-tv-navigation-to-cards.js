import fs from 'fs';
import path from 'path';

// Card components to update
const cardComponents = [
  'src/components/cards/CardLiveTV.vue',
  'src/components/cards/CardEvents.vue', 
  'src/components/cards/CardLiveSports.vue',
  'src/components/cards/CardRadioStation.vue',
  'src/components/cards/CardVod.vue',
  'src/components/cards/CardContinueWatching.vue',
  'src/components/cards/CardSearchLiveTV.vue'
];

// Card row components to update
const cardRowComponents = [
  'src/components/card-rows/CardEventsRow.vue',
  'src/components/card-rows/CardLiveSportsRow.vue', 
  'src/components/card-rows/CardRadioStationsRow.vue',
  'src/components/card-rows/CardVodRow.vue',
  'src/components/card-rows/CardContinueWatchingRow.vue',
  'src/components/card-rows/CardRecentlyWatchedRow.vue'
];

function addTVNavigationToFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add data-tv-focusable to main card containers
  if (content.includes('@click="handleCardClick()"') && !content.includes('data-tv-focusable')) {
    content = content.replace(
      /@click="handleCardClick\(\)"/g,
      '@click="handleCardClick()" data-tv-focusable'
    );
    modified = true;
  }

  // Add data-tv-focusable to buttons in popups
  if (content.includes('class="popup-btn"') && !content.includes('data-tv-focusable')) {
    content = content.replace(
      /class="popup-btn"/g,
      'class="popup-btn" data-tv-focusable'
    );
    modified = true;
  }

  // Add data-tv-focusable to swiper navigation buttons
  if (content.includes('swiper-button-prev') && !content.includes('data-tv-focusable')) {
    content = content.replace(
      /class="swiper-top-position swiper-button-prev"/g,
      'class="swiper-top-position swiper-button-prev" data-tv-focusable'
    );
    content = content.replace(
      /class="swiper-top-position swiper-button-next"/g,
      'class="swiper-top-position swiper-button-next" data-tv-focusable'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Update all card components
console.log('Adding TV navigation to card components...');
[...cardComponents, ...cardRowComponents].forEach(addTVNavigationToFile);

console.log('TV navigation added to all card components!');