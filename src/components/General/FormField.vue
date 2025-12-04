<template>
  <div class="form_field">
    <slot />
  </div>
</template>

<script setup lang="ts" name="FormField">
const props = defineProps({
  direction: {
    type: String,
    default: 'column',
  },
})
</script>

<style scoped>
.form_field {
  display: flex;
  flex-direction: v-bind('props.direction');
  align-items: v-bind('props.direction === "row" ? "center" : "unset"');
  gap: 0.5rem;
}
</style>
