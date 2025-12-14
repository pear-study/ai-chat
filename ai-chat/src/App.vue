<script setup>
  import { ref } from 'vue'

  const eye = ref('/eye-1.png')
  const mouse = ref('/mouse-1.png')
  const message = ref('こんにちは')

</script>

<template>
  <main class="container">
    <div class="character">
      <img src="/body.png" class="layer body" />
      <img :src="eye" class="layer eye" />
      <img :src="mouse" class="layer mouse" />
      <!-- 差し替え用 -->
      <!-- <img src="/face_happy.png" class="layer face" /> -->
      <div class = "bubble">
        <p>{{ message }}</p>
      </div>
    </div>

    <div class="ui">
      <textarea
        class="input"
        placeholder="メッセージを入力"
        rows="3"
      />
      <button class="send">送信</button>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 420px;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  background-color: lightcyan;
}


/* 吹き出し */
.bubble {
  position: absolute;
  top: 5%;          /* 顔の上あたり */
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;

  background: white;
  border-radius: 16px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  line-height: 1.4;

  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 三角 */
.bubble::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px 8px 0;
  border-style: solid;
  border-color: white transparent transparent;
}

/* キャラ表示エリア */
.character {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 5;   /* 素体画像の比率に合わせる */
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
  padding: 1rem;
}
</style>