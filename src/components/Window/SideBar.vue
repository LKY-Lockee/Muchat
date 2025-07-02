<template>
  <div class="side_bar_container">
    <div class="side_bar_area title">
      <slot name="title" />
    </div>
    <div class="side_bar_area front">
      <slot name="front" />
    </div>
    <div class="side_bar_area end">
      <slot name="end" />
    </div>
  </div>
</template>

<script setup lang="ts" name="SideBar"></script>

<style scoped>
.side_bar_container {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  border-right: var(--sidebar-border-right);
  padding: var(--sidebar-padding);
  gap: var(--sidebar-container-gap);
}

.side_bar_area {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  box-sizing: border-box;

  gap: var(--sidebar-item-gap);

  &.title {
    flex-grow: 0;
    align-items: center;
  }

  &.front {
    align-items: start;
  }

  &.end {
    justify-content: flex-end;
  }
}
</style>

<style>
:root {
  --sidebar-width: 4rem;
  --sidebar-border-right: var(--default-border-1);
  --sidebar-padding: 0.75rem;
  --sidebar-container-gap: 0.5rem;
  --sidebar-item-gap: 0.5rem;
}
</style>
