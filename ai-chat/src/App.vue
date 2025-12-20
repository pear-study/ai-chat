<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { eyeMap, mouseMap, detectEmotion, createBlinkController } from './logic/emotion'
  
  const emotion = ref('neutral')
  const eyeState = ref('neutral')

  const message = ref('こんにちは')
  const loading = ref(false)

  // ユーザーの入力値
  const input = ref('')
  const inputRef = ref(null)

  const eye = computed(() => eyeMap[eyeState.value])
  const mouse = computed(() => mouseMap[emotion.value])

  // まばたき
  const BLINKABLE_EMOTIONS = ['neutral', 'thinking']
  const blink = createBlinkController({
    getEmotion: () => emotion.value,
    onEyeChange: (state) => {
      eyeState.value =state
    },
  })
let blinkTimer = null
  let bodyTimer = null
let bodyIndex = 0

onMounted(() => {
  blinkRef.value.src = blinkFrames[0];
  bodyTimer = setInterval(() => {
    if (!bodyRef.value) return
    bodyRef.value.src = bodyFrames[bodyIndex]
    bodyIndex = (bodyIndex + 1) % bodyFrames.length
  }, 1000 / 4)
    blinkTimer = setInterval(() => {
    // 表情が落ち着いてるときだけ
    if (emotion.value === 'neutral' || emotion.value === 'thinking') {
      playBlink()
    }
  }, 6000 + Math.random() * 4000)
})

  onBeforeUnmount(() => blink.stop())

  watch(loading, (val) => {
    if (val) {
      blink.pause()
    } else {
      if (BLINKABLE_EMOTIONS.includes(emotion.value)) {
        blink.resume()
      }
    }
  })

  watch(emotion, (val) => {
    console.log('表情が変化:',val)
    // 表情が変わった瞬間は一旦止める
    blink.pause()
    eyeState.value = val

    if (BLINKABLE_EMOTIONS.includes(val)) {
      setTimeout(() => {
        blink.resume()
      }, 600)
    }
  })
  
  const fullMessage = ref('')
const displayMessage = ref('こんにちは')
let thinkStartFinished = false


function typeMessage(text, speed = 80) {
  displayMessage.value = ''
  let i = 0

  const timer = setInterval(() => {
    displayMessage.value += text[i]
    i++
    if (i >= text.length) {
      clearInterval(timer)
    }
  }, speed)
}

  // CloudFlareWorkers経由でOpenApiを叩く
  // 個人で契約しているのでキーはサーバー側で管理！秘密
  async function handlePostMessage() {
      if (loading.value) return
    if (!input.value) return

    loading.value = true
    emotion.value = 'thinking'
    displayMessage.value = ''

    playThinkFaceStart()

    try {
      const res = await fetch('https://ai-chat.ffvkbzmm49.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input.value }]
        })
      })

      // 返却されたメッセージを表示する
      const data = await res.json()
      console.log(data)
      const tags = extractTags(data.text)
      const parsedMessage = extractMessage(data.text)
      
      
      pendingThinkEnd = () => {
  fullMessage.value = parsedMessage
  emotion.value = detectEmotion(parsedMessage)

  const showMessage = () => {
    typeMessage(fullMessage.value, 40)
  }

  if (tags.includes('happy')) {
    playSmile()
  }
    showMessage()
}

// ★ think_start がもう終わってたら即実行
if (thinkStartFinished) {
  const cb = pendingThinkEnd
  pendingThinkEnd = null
  playThinkFaceEnd(cb)
}



    } catch {
      message.value = 'ごめんね、もう一回お話してくれる？'
      emotion.value = 'sad'
    } finally {
      input.value = ''
      inputRef.value?.focus()
    }
  }

  let playingThinkFace = false
  let pendingThinkEnd = null


  const thinkFaceFrames = [
  '/think_start/frame_1.png',
  '/think_start/frame_2.png',
  '/think_start/frame_3.png',
  '/think_start/frame_4.png',
  '/think_start/frame_5.png',
  '/think_start/frame_6.png',
  '/think_start/frame_7.png',
  '/think_start/frame_8.png',
  '/think_start/frame_9.png',
]

  const thinkEndFaceFrames = [
  '/think_end/frame_1.png',
  '/think_end/frame_2.png',
  '/think_end/frame_3.png',
  '/think_end/frame_4.png',
  '/think_end/frame_5.png',
  '/think_end/frame_6.png',
  '/think_end/frame_7.png',
  '/think_end/frame_8.png',
  '/think_end/frame_9.png',
]

const smileFaceFrames = [
  '/smile/frame_01.png',
  '/smile/frame_02.png',
  '/smile/frame_03.png',
  '/smile/frame_04.png',
  '/smile/frame_05.png',
  '/smile/frame_06.png',
  '/smile/frame_07.png',
  '/smile/frame_08.png',
  '/smile/frame_09.png',
  '/smile/frame_10.png',
  '/smile/frame_11.png',
  '/smile/frame_12.png',
  '/smile/frame_13.png',
  '/smile/frame_14.png',
  '/smile/frame_15.png',
  '/smile/frame_16.png',
  '/smile/frame_17.png',
]
function playThinkFaceStart() {
  if (!blinkRef.value || playingThinkFace) return

  playingThinkFace = true
  blinking = true // 通常まばたき止める

  let i = 0
  const timer = setInterval(() => {
    blinkRef.value.src = thinkFaceFrames[i]
    i++

    if (i >= thinkFaceFrames.length) {
  clearInterval(timer)
  playingThinkFace = false
  blinking = false
  thinkStartFinished = true

  // ★ end が待ってたらここで再生
  if (pendingThinkEnd) {
    const cb = pendingThinkEnd
    pendingThinkEnd = null
    playThinkFaceEnd(cb)
  }
}
  }, 1000 / 4)
}

function playThinkFaceEnd(onFinish) {
  if (!blinkRef.value || playingThinkFace) return

  playingThinkFace = true
  blinking = true
  
  let i = 0
  const timer = setInterval(() => {
    blinkRef.value.src = thinkEndFaceFrames[i]
    i++
    
    if (i >= thinkEndFaceFrames.length) {
      clearInterval(timer)
      playingThinkFace = false
      blinking = false
      blinkRef.value.src = blinkFrames[0]
      loading.value = false
      emotion.value = 'neutral'
      onFinish?.()
    }
  }, 1000 / 4)
}

const bodyRef = ref(null)

const bodyFrames = [
  '/body/frame_01.png',
  '/body/frame_02.png',
  '/body/frame_03.png',
  '/body/frame_04.png',
  '/body/frame_06.png',
  '/body/frame_07.png',
  '/body/frame_08.png',
  '/body/frame_09.png',
  '/body/frame_10.png',
  '/body/frame_11.png',
  '/body/frame_12.png',
  '/body/frame_13.png',
  '/body/frame_14.png',
  '/body/frame_15.png',
  '/body/frame_16.png',
  '/body/frame_17.png',
  '/body/frame_18.png',
];

const blinkRef = ref(null)

const blinkFrames = [
  '/blink/frame_1.png',
  '/blink/frame_2.png',
  '/blink/frame_3.png',
  '/blink/frame_4.png',
  '/blink/frame_5.png',
]

let blinking = false

function playBlink() {
  if (blinking || !blinkRef.value) return
  blinking = true

  let i = 0
  const timer = setInterval(() => {
    blinkRef.value.src = blinkFrames[i]
    i++
    if (i >= blinkFrames.length) {
      clearInterval(timer)
      blinking = false
    }
  }, 1000 / 4)
}

function extractTags(text) {
  const match = text.match(/<tags>([\s\S]*?)<\/tags>/)
  if (!match) return []
  console.log('タグあり', match)
  return match[1]
    .split('\n')
    .map(t => t.replace('#', '').trim())
    .filter(Boolean)
}

function extractMessage(text) {
  const match = text.match(/<message>([\s\S]*?)<\/message>/)
  return match ? match[1].trim() : text
}

function playSmile(onFinish) {

  blinking = true
  let i = 0
  const timer = setInterval(() => {
    blinkRef.value.src = smileFaceFrames[i]
    i++
    if (i >= smileFaceFrames.length) {
      clearInterval(timer)
      blinkRef.value.src = blinkFrames[0]
      blinking = false
      emotion.value = 'neutral'
      onFinish?.()
    }
  }, 1000 / 4)
}

</script>

<template>
  <main class="container">
    <div class="bubble-area">
      <div class="bubble">
        <span
          class="thinking"
          :class="{ hidden: !loading }"
        >
          <span>.</span><span>.</span><span>.</span>
        </span>

        <span
          class="message"
          :class="{ hidden: loading }"
        >
          {{ displayMessage }}
        </span>
      </div>
    </div>

    <div class="character">
      <div class="character-inner">
        <div class="character-stack">
          <img ref="bodyRef" class="layer body" />
          <img ref="blinkRef" class="layer blink" />
      </div>
    </div>                          

    </div>

    <div class="ui">
      <textarea
        ref="inputRef"
        v-model="input"
        class="input"
        placeholder="メッセージを入力してください"
        :disabled="loading"
        rows="3"
        @keydown.enter.prevent="handlePostMessage"
        @keydown.shift.enter.stop
      />
      <button
        :disabled="loading || !input.length"
        @click="handlePostMessage"
      >
        {{ loading ? '送信中' : '送信' }}
      </button>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 420px;
  height: 100dvh;
  margin: 0 auto;
  display: flex;
  position: relative;
  background-color: #aac4f5;
  overflow: hidden;
}


/* 吹き出し */
.bubble-area {
  position: absolute;
  top: 4%;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.bubble {
  font-family: 'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif;
  width: 70%;
  max-height: 2.5em;
  overflow: auto;

  position: relative;
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* キャラ表示エリア */
.character {
  position: absolute;
  inset: 0;
  width: 100%;
  overscroll-behavior: none;
}

.character-inner {
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.character-stack {
  position: relative;   /* absolute の基準 */
  width: 115%;
  aspect-ratio: 3/5;
}

/* 全レイヤー共通 */
.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.thinking span {
  display: inline-block;
  animation: bounce 1.2s infinite ease-in-out;
}

.thinking span:nth-child(1) { animation-delay: 0s; }
.thinking span:nth-child(2) { animation-delay: 0.15s; }
.thinking span:nth-child(3) { animation-delay: 0.3s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.thinking,
.message {
  transition: opacity 0.25s ease;
}

.hidden {
  opacity: 0;
  pointer-events: none;
}

/* UI */
.ui {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  gap: 8px;
  padding: 1rem;
  background-color: transparent;
  z-index: 10;
  box-sizing: border-box;

}

.input {
  flex: 1;
  resize: none;
  border-radius: 8px;
  padding: 10px ;
  font-size:1rem;
  outline: none;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.25);
}

.input:focus {
  border-color: rgba(0, 0, 0, 0.35);
}

.input:disabled {
  border-color: rgba(0, 0, 0, 0.25);
  opacity: 0.8;
}


.ui button {
  background: white;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 10px;
  padding: 0 12px;
}

.ui,
.input,
.ui button {
  font-family: 'Noto Sans JP', system-ui, sans-serif;
}

.ui button:disabled {
  opacity: 0.8;
}
</style>