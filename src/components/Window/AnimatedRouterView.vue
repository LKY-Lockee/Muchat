<template>
  <div class="router_view_container">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="default">
        <div :key="route.matched[props.level]?.path" class="page-transition-wrapper">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts" name="AnimatedRouterView">
const props = defineProps({
  level: {
    type: Number,
    default: 0,
    required: true,
  },
})
</script>

<style scoped>
.router_view_container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.page-transition-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.15s ease;
  width: 100%;
  height: 100%;
  position: absolute;
}

.page-enter-from {
  opacity: 0;
  transform: scale(1.025);
}

.page-leave-to {
  opacity: 0;
  transform: scale(0.975);
}
</style>

<style>
.page-enter-active .hide-in-transition,
.page-leave-active .hide-in-transition {
  opacity: 0 !important;
  visibility: hidden !important;
}
</style>
