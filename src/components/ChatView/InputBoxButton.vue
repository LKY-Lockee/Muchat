<template>
  <div class="input_box_button_container">
    <slot />
  </div>
</template>

<script setup lang="ts" name="InputBoxButton"></script>

<style scoped>
.input_box_button_container {
  width: 25px;
  height: 25px;
  padding: 2px;
  box-sizing: border-box;
  border-radius: 5px;
  cursor: pointer;
}
</style>
