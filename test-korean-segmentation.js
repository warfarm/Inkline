// Quick test of Korean segmentation
// Run with: node test-korean-segmentation.js

// Simplified version of Korean segmentation for testing
const KOREAN_PARTICLES = [
  '은', '는', '이', '가',
  '을', '를',
  '에', '에서', '에게', '한테', '께', '으로', '로',
  '도', '만', '부터', '까지', '와', '과', '하고', '의', '보다',
  '처럼', '같이', '마다', '밖에', '나', '이나', '라고', '이라고',
  '요', '어요', '아요', '여요',
];

function detectParticle(word) {
  if (word.length <= 1) return null;

  // Check for multi-character particles first
  const multiCharParticles = KOREAN_PARTICLES
    .filter(p => p.length > 1)
    .sort((a, b) => b.length - a.length);

  for (const particle of multiCharParticles) {
    if (word.endsWith(particle) && word.length > particle.length) {
      return {
        stem: word.slice(0, -particle.length),
        particle: particle,
      };
    }
  }

  // Check for single character particles
  const lastChar = word[word.length - 1];
  if (KOREAN_PARTICLES.includes(lastChar) && word.length > 1) {
    return {
      stem: word.slice(0, -1),
      particle: lastChar,
    };
  }

  return null;
}

function segmentKorean(text) {
  if (!text) return [];

  const words = [];
  let currentPosition = 0;

  const spaceSplit = text.split(/(\s+)/);

  for (const segment of spaceSplit) {
    if (!segment) continue;

    const start = currentPosition;
    const end = currentPosition + segment.length;

    // Skip whitespace
    if (/^\s+$/.test(segment)) {
      currentPosition = end;
      continue;
    }

    // Check for particle
    const particleInfo = detectParticle(segment);

    if (particleInfo && particleInfo.stem.length > 0) {
      const stemEnd = start + particleInfo.stem.length;
      words.push({
        text: particleInfo.stem,
        start: start,
        end: stemEnd,
      });

      words.push({
        text: particleInfo.particle,
        start: stemEnd,
        end: end,
        particle: particleInfo.particle,
      });
    } else {
      words.push({
        text: segment,
        start: start,
        end: end,
      });
    }

    currentPosition = end;
  }

  return words;
}

// Test cases
const testCases = [
  '저는 한국어를 공부해요.',
  '학교에서 친구들과 공부해요.',
  '오늘은 날씨가 좋아요.',
  '한국 음식은 세계적으로 유명해요.',
];

console.log('=== Korean Segmentation Test ===\n');

testCases.forEach((text, index) => {
  console.log(`Test ${index + 1}: "${text}"`);
  const segments = segmentKorean(text);
  console.log('Segmented words:');
  segments.forEach((seg, i) => {
    const particleMarker = seg.particle ? ' [PARTICLE]' : '';
    console.log(`  ${i + 1}. "${seg.text}"${particleMarker} (${seg.start}-${seg.end})`);
  });
  console.log('');
});

console.log('✓ Korean segmentation test completed!');
