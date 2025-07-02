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
  padding: 0.75rem;
  gap: 1rem;
  border-radius: 5px;
  transition: all 0.2s ease-in-out;

  &[on='true'] {
    background-color: var(--p-primary-500);

    .primary {
      transition: inherit;
      color: var(--p-primary-0);
    }
  }

  &[on='true']:hover {
    background-color: var(--p-primary-400);
  }

  &[on='true']:active {
    background-color: var(--p-primary-600);
  }

  &[on='false']:hover {
    background-color: var(--p-surface-100);
  }

  &[on='false']:active {
    background-color: var(--p-surface-200);
  }
}
</style>
