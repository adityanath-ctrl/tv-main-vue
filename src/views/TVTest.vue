<template>
  <div class="tv-test-page">
    <h1 data-tv-focusable @click="handleClick('Title')">TV Navigation Test - Click Me!</h1>
    
    <div class="test-section">
      <h2>Navigation Test Grid</h2>
      <div class="test-grid">
        <button 
          v-for="i in 12" 
          :key="i" 
          data-tv-focusable 
          class="test-button"
          @click="handleClick(`Button ${i}`)"
        >
          Button {{ i }}
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>EPG-Style Test</h2>
      <div class="epg-test">
        <div class="channels">
          <div 
            v-for="channel in channels" 
            :key="channel.id"
            data-tv-focusable
            class="channel-item"
            @click="handleClick(`Channel ${channel.name}`)"
          >
            <img :src="channel.logo" :alt="channel.name" />
            <span>{{ channel.name }}</span>
          </div>
        </div>
        <div class="programs">
          <div 
            v-for="program in programs" 
            :key="program.id"
            data-tv-focusable
            class="program-item"
            @click="handleClick(`Program ${program.title}`)"
          >
            <div class="program-title">{{ program.title }}</div>
            <div class="program-time">{{ program.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="lastClicked" class="result">
      <h3>Last clicked: <strong>{{ lastClicked }}</strong></h3>
      <button data-tv-focusable @click="lastClicked = null" class="clear-btn">
        Clear
      </button>
    </div>

    <div class="instructions">
      <h3>Instructions:</h3>
      <p>Use arrow keys (↑ ↓ ← →) to navigate, Enter to select</p>
      <p>Look for the blue outline showing which element is focused</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lastClicked = ref('')

const channels = [
  { id: 1, name: 'Channel 1', logo: 'https://via.placeholder.com/40x40/27AAE1/white?text=C1' },
  { id: 2, name: 'Channel 2', logo: 'https://via.placeholder.com/40x40/27AAE1/white?text=C2' },
  { id: 3, name: 'Channel 3', logo: 'https://via.placeholder.com/40x40/27AAE1/white?text=C3' },
  { id: 4, name: 'Channel 4', logo: 'https://via.placeholder.com/40x40/27AAE1/white?text=C4' },
]

const programs = [
  { id: 1, title: 'Morning News', time: '9:00 AM' },
  { id: 2, title: 'Talk Show', time: '10:00 AM' },
  { id: 3, title: 'Movie Time', time: '11:00 AM' },
  { id: 4, title: 'Sports', time: '12:00 PM' },
  { id: 5, title: 'Drama Series', time: '1:00 PM' },
  { id: 6, title: 'Documentary', time: '2:00 PM' },
]

const handleClick = (item) => {
  lastClicked.value = item
  console.log('Clicked:', item)
}
</script>

<style scoped>
.tv-test-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

h1 {
  font-size: 36px;
  margin-bottom: 40px;
  text-align: center;
  padding: 20px;
  border: 2px dashed #27AAE1;
  border-radius: 12px;
  cursor: pointer;
}

.test-section {
  margin-bottom: 50px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #27AAE1;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.test-button {
  padding: 20px;
  font-size: 18px;
  border: 2px solid #27AAE1;
  background: transparent;
  color: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
}

.test-button:hover {
  background: rgba(39, 170, 225, 0.1);
}

.epg-test {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  border: 2px solid #333;
  border-radius: 12px;
  padding: 20px;
}

.channels {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 2px solid #27AAE1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.channel-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.programs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.program-item {
  padding: 15px;
  border: 2px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
}

.program-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.program-time {
  font-size: 14px;
  opacity: 0.8;
}

.result {
  background: rgba(39, 170, 225, 0.1);
  border: 2px solid #27AAE1;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 40px;
}

.result h3 {
  margin-bottom: 15px;
}

.clear-btn {
  padding: 12px 24px;
  background: #27AAE1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.instructions {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #333;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.instructions h3 {
  color: #27AAE1;
  margin-bottom: 15px;
}

.instructions p {
  margin-bottom: 10px;
  font-size: 16px;
}
</style>