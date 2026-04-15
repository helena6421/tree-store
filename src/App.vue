<template>
  <main class="app">
    <div class="app__container">
      <h1 class="app__title">Дерево элементов</h1>

      <TreeGrid :items="sampleItems" />
    </div>
  </main>
</template>

<script setup lang="ts">
import TreeGrid from '@/components/TreeGrid.vue'
import { sampleItems } from '@/app/sample-data'
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 42px 24px 56px;
}

.app__container {
  max-width: 1560px;
  margin: 0 auto;
}

.app__title {
  margin: 0 0 18px;
  font-size: clamp(32px, 4vw, 56px);
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #101010;
}

@media (max-width: 1024px) {
  .app {
    padding: 28px 16px 32px;
  }

  .app__title {
    margin-bottom: 14px;
  }
}
</style>
