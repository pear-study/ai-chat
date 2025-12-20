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
                    

  // CloudFlareWorkers経由でOpenApiを叩く
  // 個人で契約しているのでキーはサーバー側で管理！秘密
  async function handlePostMessage() {
    if (!input.value) return

    loading.value = true
    emotion.value = 'thinking'
    message.value = '...'

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
      message.value = data.text
      emotion.value = detectEmotion(data.text)
    } catch {
      message.value = 'ごめんね、もう一回お話してくれる？'
      emotion.value = 'sad'
    } finally {
      loading.value = false
      input.value = ''
      inputRef.value?.focus()
    }
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

</script>

<template>
  <main class="container">
    <div class="bubble-area">
      <div class="bubble">
        {{ message }}
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
  width: 70%;
  max-height: 30dvh;
  overflow: auto;

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

.ui button:disabled {
  opacity: 0.8;
}
</style>