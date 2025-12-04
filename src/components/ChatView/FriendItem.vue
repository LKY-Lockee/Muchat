<template>
  <div class="no-drag no-select friend_item">
    <OverlayBadge
      v-if="props.avatar"
      severity="danger"
      v-hide-when-zero="props.badgeValue"
      :value="props.badgeValue"
      size="small"
    >
      <Avatar size="large" :image="props.avatar" />
    </OverlayBadge>
    <div class="column-flex">
      <div class="primary">
        {{ props.name }}
      </div>
      <div class="primary">
        {{ props.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="FriendItem">
// PrimeVue
import { Avatar, OverlayBadge } from 'primevue'

const props = defineProps({
  avatar: {
    type: String,
    default: '',
  },
  badgeValue: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.friend_item {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  padding: var(--friend-item-padding);
  gap: var(--friend-item-gap);
  border-radius: var(--friend-item-border-radius);

  &[on='true'] {
    background-color: var(--friend-item-on-bg);

    .primary {
      transition: inherit;

      color: var(--friend-item-on-text-color);
    }
  }

  &[on='true']:hover {
    background-color: var(--friend-item-on-hover-bg);
  }

  &[on='true']:active {
    background-color: var(--friend-item-on-active-bg);
  }

  &[on='false']:hover {
    background-color: var(--friend-item-hover-bg);
  }

  &[on='false']:active {
    background-color: var(--friend-item-active-bg);
  }
}
</style>

<style>
:root {
  --friend-item-padding: 0.75rem;
  --friend-item-gap: 1rem;
  --friend-item-border-radius: 5px;

  --friend-item-hover-bg: var(--p-surface-100);
  --friend-item-active-bg: var(--p-surface-200);
  --friend-item-on-hover-bg: var(--p-primary-400);
  --friend-item-on-active-bg: var(--p-primary-600);
  --friend-item-on-bg: var(--p-primary-500);
  --friend-item-on-text-color: var(--p-primary-0);
}
</style>
