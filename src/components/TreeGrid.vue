<script setup lang="ts">
import type { DemoItem } from "@/app/sample-data";

defineProps<{
  items: DemoItem[];
}>();
</script>

<template>
  <section class="tree-grid">
    <h2 class="tree-grid_title">Tree Grid</h2>

    <ul class="tree-grid_list">
      <li v-for="item in items" :key="item.id" class="tree-grid_item">
        <span class="tree-grid_label">{{ item.label }}</span>
        <span class="tree-grid_meta"> parent: {{ item.parent ?? "null" }} </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.tree-grid {
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.tree-grid_title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
}

.tree-grid_list {
  margin: 0;
  padding-left: 16px;
}

.tree-grid_item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.tree-grid_label {
  font-weight: 500;
}

.tree-grid_meta {
  color: #6b7280;
  font-size: 12px;
}
</style>
