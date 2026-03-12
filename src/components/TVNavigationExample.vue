<template>
  <div class="tv-example-container">
    <h1 data-tv-focusable>TV Navigation Example</h1>
    
    <div class="tv-grid" style="grid-template-columns: repeat(2, 1fr)">
      <button 
        v-for="item in menuItems" 
        :key="item.id" 
        data-tv-focusable 
        class="tv-button"
        @click="handleMenuClick(item)"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="selectedItem" class="selected-info">
      <p>Selected: <strong>{{ selectedItem.label }}</strong></p>
      <button data-tv-focusable class="tv-button" @click="selectedItem = null">
        Clear Selection
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MenuItem {
  id: number
  label: string
}

const menuItems: MenuItem[] = [
  { id: 1, label: 'Home' },
  { id: 2, label: 'Browse' },
  { id: 3, label: 'Search' },
  { id: 4, label: 'Settings' },
  { id: 5, label: 'My Account' },
  { id: 6, label: 'Sign Out' }
]

const selectedItem = ref<MenuItem | null>(null)

const handleMenuClick = (item: MenuItem) => {
  selectedItem.value = item
  console.log('Clicked:', item.label)
}
</script>

<style scoped>
.tv-example-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 32px;
  margin-bottom: 40px;
  color: white;
  text-align: center;
}

.tv-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;
}

.tv-button {
  min-height: 60px;
  font-size: 18px;
  padding: 16px 24px;
  border-radius: 12px;
  border: 2px solid #27AAE1;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.tv-button:hover {
  background: rgba(39, 170, 225, 0.1);
}

.tv-button:focus {
  outline: none;
}

.selected-info {
  background: rgba(39, 170, 225, 0.1);
  border: 2px solid #27AAE1;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-top: 40px;
}

.selected-info p {
  font-size: 18px;
  margin-bottom: 20px;
  color: white;
}

.selected-info strong {
  color: #27AAE1;
}
</style>