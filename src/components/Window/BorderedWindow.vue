<template>
  <div class="root">
    <Suspense>
      <slot />
    </Suspense>
  </div>
</template>

<script setup lang="ts" name="BorderedWindow"></script>

<style scoped>
.root {
  display: flex;
  height: 100%;
  width: 100%;
}
</style>
