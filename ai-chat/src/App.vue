<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { eyeMap, mouseMap, detectEmotion, createBlinkController } from './logic/emotion'
  
  const emotion = ref('neutral')
  const eyeState = ref('neutral')

  const message = ref('こんにちは')
  const input = ref('')
  const loading = ref(false)

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

  onMounted(blink.start())

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
    }
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
          <img src="/body.png" class="layer body" />
          <img :src="eye" class="layer eye" />
          <img :src="mouse" class="layer mouse" />
      </div>
    </div>                          

    </div>

    <div class="ui">
      <textarea
        v-model="input"
        class="input"
        placeholder="メッセージを入力"
        rows="3"
      />
      <button
        class="send"
        :disabled="loading"
        @click="handlePostMessage"
      >
        送信
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
  overflow-y: auto;
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
  width: 100%;
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
  background-color: #8CA9FF;
  z-index: 10;
  box-sizing: border-box;

  .input {
    flex: 1;
    resize: none;
    font-size:1rem;

    .send:disabled {
      opacity: 0.5;
    }
  }
}
</style>