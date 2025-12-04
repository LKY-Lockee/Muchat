<template>
  <ScrollView>
    <div
      ref="text_input_ref"
      class="text_input"
      contenteditable="plaintext-only"
      role="textbox"
      @input="onInput"
      :placeholder="props.placeholder"
      :style="{ minHeight: props.minHeight }"
    />
  </ScrollView>
</template>

<script setup lang="ts" name="InputArea">
// VUE
import { nextTick, ref, watch, onMounted } from 'vue'
// Components
import ScrollView from './ScrollView.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  minHeight: {
    type: String,
    default: '40px',
  },
  padding: String,
})
const emit = defineEmits(['update:modelValue'])

const text_input_ref = ref<HTMLDivElement | null>(null)

const setContent = (val: string) => {
  const el = text_input_ref.value
  if (el && el.innerText !== val) {
    el.innerText = val
  }
}

const onInput = () => {
  nextTick(() => {
    const el = text_input_ref.value
    if (el && el.childNodes.length === 1 && el.childNodes[0].nodeName === 'BR') {
      el.innerHTML = ''
    }
    emit('update:modelValue', el?.innerText)
  })
}

watch(
  () => props.modelValue,
  (val) => {
    setContent(val)
  },
)

onMounted(() => {
  setContent(props.modelValue)
})
</script>

<style scoped>
.text_input {
  display: inline-block;
  border: none;
  outline: none;
  box-sizing: border-box;
  overflow: auto;

  padding: v-bind('props.padding');
}

.text_input:empty::before {
  content: attr(placeholder);
  color: #aaaaaa;
  cursor: text;
}
</style>
