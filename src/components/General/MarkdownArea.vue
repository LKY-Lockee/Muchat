<template>
  <div class="markdown_area" v-html="markdownContent" ref="markdownContainer" />
</template>

<script setup lang="ts" name="MarkdownArea">
import { ref, computed, onMounted, onUpdated } from 'vue'
import { marked, type TokenizerAndRendererExtension } from 'marked'
import characterManager from '@/scripts/store/characterManager'

import katex from 'katex'
import 'katex/dist/katex.min.css'

import hljs from 'highlight.js'
import '@/styles/markdown.css'

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const thinkSvg = `<svg
	t="1748311256735"
	class="icon think_icon"
	viewBox="0 0 1024 1024"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
	p-id="3364"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	width="25"
	height="25"
>
	<path
		d="M932.326692 421.389627C932.326692 189.732015 744.537551 1.946768 512.887726 1.946768 281.230114 1.946768 93.444867 189.735909 93.444867 421.389627c0 148.694144 78.065399 283.690829 202.331498 358.945095l0 129.1447c0 33.301414 27.028928 60.34981 60.353703 60.34981l313.511422 0c33.344243 0 60.357597-27.017247 60.357597-60.34981l0-129.140806c124.266099-75.25816 202.327605-210.250951 202.327605-358.948989zm-245.612046 316.517232a29.201521 29.201521 0 0 0-15.1186 25.580533l0 145.99203c0 1.07851-0.868259 1.946768-1.954556 1.946768l-313.507528 0a1.970129 1.970129 0 0 1-1.954555-1.946768l0-145.988137a29.201521 29.201521 0 0 0-15.122494-25.580532c-114.547833-63.055817-187.209004-183.385551-187.209004-316.521126 0-199.395772 161.644046-361.039817 361.039817-361.039817 199.395772 0 361.035924 161.644046 361.035924 361.039817 0 133.131681-72.661171 253.465308-187.209004 316.517232zM420.501901 946.129278c0 27.523407 11.960943 49.28438 33.679088 62.179771 16.512487 9.803924 36.988593 13.744183 61.712547 13.744183s45.200061-3.940259 61.712548-13.744183c21.718144-12.895392 33.679087-34.656365 33.679087-62.179771a29.201521 29.201521 0 1 0-58.403042 0c0 7.23419-1.389992 9.761095-5.092745 11.960943-5.840304 3.465247-16.718844 5.55997-31.895848 5.559969-15.177004 0-26.055544-2.094722-31.895848-5.559969-3.702753-2.199848-5.092745-4.726753-5.092745-11.960943a29.201521 29.201521 0 1 0-58.403042 0zM356.270236 860.907559l303.734753 0a29.201521 29.201521 0 0 0 0-58.403042l-303.734753 0a29.201521 29.201521 0 0 0 0 58.403042zM486.750418 582.075863l0 241.064396a29.201521 29.201521 0 0 0 58.403042 0l0-241.064396a29.201521 29.201521 0 1 0-58.403042 0zM339.504669 456.723468l151.653232 151.657125a29.201521 29.201521 0 1 0 41.298738-41.294844l-151.653232-151.657125a29.201521 29.201521 0 0 0-41.298738 41.294844zM646.90324 415.428624l-151.657126 151.653232a29.201521 29.201521 0 1 0 41.294844 41.298737l151.657126-151.653232a29.201521 29.201521 0 0 0-41.294844-41.298737z"
		p-id="3365"
	></path>
</svg>
`

const expandSvg = `<svg
    t="1748313903150"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="11692"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="18"
    height="18"
>
    <path
        d="M318.57 223.95l322.99 322.99c21.87 21.87 57.33 21.87 79.2 0 21.87-21.87 21.87-57.33 0-79.2l-323-322.99c-21.87-21.87-57.33-21.87-79.2 0-21.86 21.87-21.86 57.33 0.01 79.2z"
        p-id="11693"
    ></path>
    <path
        d="M729.75 555.95L406.76 878.93c-21.87 21.87-57.33 21.87-79.2 0-21.87-21.87-21.87-57.33 0-79.2l322.99-322.99c21.87-21.87 57.33-21.87 79.2 0 21.87 21.88 21.87 57.34 0 79.21z"
        p-id="11694"
    ></path>
</svg>
`

const copySvg = `<svg
    t="1748157448325"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="6380"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="22"
    height="22"
>
    <path
        d="M585.142857 365.714286a73.142857 73.142857 0 0 1 73.142857 73.142857v390.095238a73.142857 73.142857 0 0 1-73.142857 73.142857H195.047619a73.142857 73.142857 0 0 1-73.142857-73.142857V438.857143a73.142857 73.142857 0 0 1 73.142857-73.142857h390.095238z m0 73.142857H195.047619v390.095238h390.095238V438.857143z m-73.142857 219.428571v73.142857H268.190476v-73.142857h243.809524zM828.952381 121.904762a73.142857 73.142857 0 0 1 73.142857 73.142857v390.095238a73.142857 73.142857 0 0 1-73.142857 73.142857h-121.904762v-73.142857h121.904762V195.047619H438.857143v121.904762h-73.142857V195.047619a73.142857 73.142857 0 0 1 73.142857-73.142857h390.095238zM512 536.380952v73.142858H268.190476v-73.142858h243.809524z"
        fill="#CCCCCC"
        p-id="6381"
    ></path>
</svg>
`

const props = defineProps({
  markdown: {
    required: true,
  },
  messageId: {
    type: String,
    default: '',
  },
})

const markdownContainer = ref<HTMLDivElement | null>(null)

const markdownContent = computed(() => {
  // Replace LaTeX equations with KaTeX rendered HTML
  let md = (props.markdown as string)
    ?.replace(/\$\$(.+?)\$\$/gs, (_, content) => {
      return (
        '<katex-formula-ml class="dom-scrollbar-hide">' +
        katex.renderToString(content, {
          throwOnError: false,
        }) +
        '</katex-formula-ml>'
      )
    })
    ?.replace(/\$(.+?)\$/g, (_, content) => {
      return (
        '<katex-formula>' +
        katex.renderToString(content, {
          throwOnError: false,
        }) +
        '</katex-formula>'
      )
    })

  return marked(md)
})

function attachListeners() {
  const copyBtns = markdownContainer.value?.querySelectorAll('.copy_btn')
  copyBtns?.forEach((btn) => {
    btn.removeEventListener('click', handleCopy)
    btn.addEventListener('click', handleCopy)
  })

  const thinkExpandBtns = markdownContainer.value?.querySelectorAll('.think_expand')
  thinkExpandBtns?.forEach((think) => {
    think.removeEventListener('click', handleFoldThink)
    think.addEventListener('click', handleFoldThink)
  })
}

function handleCopy(event: Event) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const codeBlock = currentTarget?.closest('code-block')
  const codeElement = codeBlock?.querySelector('pre code')
  const codeText = codeElement?.textContent || ''

  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: '代码已复制到剪贴板',
        life: 2000,
      })
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: '复制失败',
        life: 2000,
      })
    })
}

async function handleFoldThink(event: Event) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const thinkElement = currentTarget?.closest('think')

  if (props.messageId && thinkElement) {
    await characterManager.getMessageById(props.messageId).then((message) => {
      if (message) {
        message.thinkFolded = !thinkElement.classList.contains('folded')
        characterManager.updateMessage(message)

        const thinkElements = markdownContainer.value?.querySelectorAll('think')
        thinkElements?.forEach(async (thinkElement) => {
          thinkElement.classList.remove('no-animation')
        })
      }
    })

    thinkElement.classList.toggle('folded')
  }
}

onMounted(async () => {
  attachListeners()

  if (props.messageId) {
    const message = await characterManager.getMessageById(props.messageId)

    if (message && message.thinkFolded) {
      const thinkElements = markdownContainer.value?.querySelectorAll('think')
      thinkElements?.forEach(async (thinkElement) => {
        thinkElement.classList.add('no-animation')
        thinkElement.classList.add('folded')
      })
    }
  }
})

onUpdated(() => {
  attachListeners()
})

// Marked
var renderer = new marked.Renderer()

renderer.code = (code) => {
  let lang = code.lang || 'text'
  let highlightedCode
  try {
    highlightedCode = hljs.highlight(code.text, {
      language: lang,
      ignoreIllegals: true,
    }).value
  } catch {
    highlightedCode = code.text
  }

  return `
<code-block>
    <div class="code_header">
        <span class="code_lang">${lang.toUpperCase()}</span>
        <div class="copy_btn">
            ${copySvg}
        </div>
    </div>
    <pre style="margin: 0;"><code class="hljs ${lang}">${highlightedCode}</code></pre>
</code-block>`
}

renderer.link = (link) => {
  return `<a href="${link.href}" target="_blank">${link.text}</a>`
}

const thinkExtension: TokenizerAndRendererExtension = {
  name: 'think',
  level: 'block',
  start(src) {
    return src.match(/<think>/)?.index
  },
  tokenizer(src) {
    // Closed <think> tag
    const completeRule = /^<think>(.*?)<\/think>/s
    const completeMatch = completeRule.exec(src)
    if (completeMatch) {
      return {
        type: 'think',
        raw: completeMatch[0],
        content: completeMatch[1].trim(),
        complete: true,
      }
    }

    // Incomplete <think> tag
    const incompleteRule = /^<think>(.*?)$/s
    const incompleteMatch = incompleteRule.exec(src)
    if (incompleteMatch) {
      return {
        type: 'think',
        raw: incompleteMatch[0],
        content: incompleteMatch[1].trim(),
        complete: false,
      }
    }
  },
  renderer(token) {
    if (!token.content) return ''

    return `
<think>
    <div class="think_header">
        <div class="think_icon">
            ${thinkSvg}
        </div>
        <span class="think_title">${token.complete ? '已深度思考' : '思考中'}</span>
        <div class="think_icon think_expand">
            ${expandSvg}
        </div>
    </div>
    <div class="think_content">
        ${marked(token.content.trim())}
    </div>
</think>`
  },
}

marked.use({
  extensions: [thinkExtension],
})

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
  pedantic: false,
})
</script>

<style scoped>
.markdown_area > *:first-child {
  margin-top: 0 !important;
}

.markdown_area > *:last-child {
  margin-bottom: 0 !important;
}
</style>
