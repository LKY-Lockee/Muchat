<template>
  <Button class="input_box_button_container">
    <slot />
  </Button>
</template>

<script setup lang="ts" name="InputBoxButton">
// PrimeVue
import { Button } from 'primevue'
</script>

<style scoped>
.input_box_button_container {
  box-sizing: border-box;
  cursor: pointer;

  min-width: var(--input-box-button-min-width);
  height: var(--input-box-button-height);
  padding: var(--input-box-button-padding);
  border-radius: var(--input-box-button-border-radius);
}
</style>

<style>
:root {
  --input-box-button-min-width: 1.5rem;
  --input-box-button-height: 1.5rem;
  --input-box-button-padding: 0;
  --input-box-button-border-radius: 5px;
}
</style>
