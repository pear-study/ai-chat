// src/logic/emotion.js

export const eyeMap = {
  neutral: '/eye-1.png',
  happy: '/eye-2.png',
  sad: '/eye-3.png',
  thinking: '/eye-1.png',
}

export const mouseMap = {
  neutral: '/mouse-1.png',
  happy: '/mouse-1.png',
  sad: '/mouse-3.png',
  thinking: '/mouse-2.png',
}

/**
 * レスポンステキストから感情を推定する
 * @param {string} text
 * @returns {'neutral'|'happy'|'sad'|'thinking'}
 */
export function detectEmotion(text) {
  if (!text) return 'neutral'

  if (
    text.includes('ありがとう') ||
    text.includes('嬉しい') ||
    text.includes('！')
  ) {
    return 'happy'
  }

  if (
    text.includes('ごめん') ||
    text.includes('悲') ||
    text.includes('つら')
  ) {
    return 'sad'
  }

  if (
    text.includes('考') ||
    text.includes('うーん')
  ) {
    return 'thinking'
  }

  return 'neutral'
}
