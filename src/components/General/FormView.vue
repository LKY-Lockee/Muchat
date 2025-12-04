<template>
  <div class="form">
    <slot />
  </div>
</template>

<script setup lang="ts" name="FormView"></script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
