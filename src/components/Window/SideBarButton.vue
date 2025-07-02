<template>
  <div class="side_bar_button app-no-drag">
    <div class="image">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts" name="SideBarButton"></script>

<style scoped>
.side_bar_button {
  width: 100%;
  height: unset !important;
  aspect-ratio: 1 / 1 !important;
  transition: all 0.2s ease-in-out;

  border-radius: var(--sidebar-button-border-radius);

  &.on {
    background-color: var(--sidebar-button-color-on);
  }

  &:hover {
    background-color: var(--sidebar-button-color-hover);
  }

  &:active {
    background-color: var(--sidebar-button-color-active);
  }
}

.image {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1 !important;

  padding: var(--sidebar-button-padding);
}
</style>

<style>
:root {
  --sidebar-button-border-radius: 5px;
  --sidebar-button-padding: 0.4rem;

  --sidebar-button-color-on: #00000016;
  --sidebar-button-color-hover: #00000024;
  --sidebar-button-color-active: #00000032;
}

.sidebar-button-icon * {
  fill: #2c2c2c !important;
}
</style>
