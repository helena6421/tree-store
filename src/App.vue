<template>
  <main class="app">
    <h1 class="app__title">TreeStore Test Task</h1>

    <TreeGrid :items="sampleItems" />
  </main>
</template>

<script setup lang="ts">
import TreeGrid from "@/components/TreeGrid.vue";
import { sampleItems } from "@/app/sample-data";
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.app__title {
  margin: 0 0 24px;
  font-size: 32px;
  font-weight: 600;
}
</style>
