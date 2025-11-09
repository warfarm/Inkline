import type { DictionaryResult } from '@/types';

// Basic Chinese dictionary using CC-CEDICT-like data
// This is a simplified version - in production, you'd load full CC-CEDICT data
const basicChineseDict: Record<string, { pinyin: string; definition: string }> = {
  '我': { pinyin: 'wǒ', definition: 'I; me' },
  '是': { pinyin: 'shì', definition: 'to be; am; is; are' },
  '学生': { pinyin: 'xuésheng', definition: 'student' },
  '每天': { pinyin: 'měitiān', definition: 'every day; daily' },
  '去': { pinyin: 'qù', definition: 'to go' },
  '学校': { pinyin: 'xuéxiào', definition: 'school' },
  '吃': { pinyin: 'chī', definition: 'to eat' },
  '早饭': { pinyin: 'zǎofàn', definition: 'breakfast' },
  '和': { pinyin: 'hé', definition: 'and; with' },
  '朋友': { pinyin: 'péngyou', definition: 'friend' },
  '说话': { pinyin: 'shuōhuà', definition: 'to speak; to talk' },
  '学习': { pinyin: 'xuéxí', definition: 'to study; to learn' },
  '中文': { pinyin: 'zhōngwén', definition: 'Chinese (language)' },
  '喜欢': { pinyin: 'xǐhuan', definition: 'to like; to be fond of' },
  '做饭': { pinyin: 'zuòfàn', definition: 'to cook' },
  '会': { pinyin: 'huì', definition: 'can; able to; will' },
  '做': { pinyin: 'zuò', definition: 'to do; to make' },
  '中国': { pinyin: 'zhōngguó', definition: 'China' },
  '菜': { pinyin: 'cài', definition: 'dish; cuisine; vegetable' },
  '用': { pinyin: 'yòng', definition: 'to use' },
  '米': { pinyin: 'mǐ', definition: 'rice' },
  '肉': { pinyin: 'ròu', definition: 'meat' },
  '很': { pinyin: 'hěn', definition: 'very; quite' },
  '有趣': { pinyin: 'yǒuqù', definition: 'interesting; amusing' },
  '常常': { pinyin: 'chángcháng', definition: 'often; frequently' },
  '给': { pinyin: 'gěi', definition: 'to give; for' },
  '家人': { pinyin: 'jiārén', definition: 'family; family members' },
  '他们': { pinyin: 'tāmen', definition: 'they; them' },
  '都': { pinyin: 'dōu', definition: 'all; both' },
  '运动': { pinyin: 'yùndòng', definition: 'sports; exercise; to exercise' },
  '对': { pinyin: 'duì', definition: 'correct; toward; to; regarding' },
  '身体': { pinyin: 'shēntǐ', definition: 'body; health' },
  '健康': { pinyin: 'jiànkāng', definition: 'health; healthy' },
  '重要': { pinyin: 'zhòngyào', definition: 'important; significant' },
  '每周': { pinyin: 'měizhōu', definition: 'every week; weekly' },
  '健身房': { pinyin: 'jiànshēnfáng', definition: 'gym; fitness center' },
  '三': { pinyin: 'sān', definition: 'three' },
  '次': { pinyin: 'cì', definition: 'times; occasions' },
  '跑步': { pinyin: 'pǎobù', definition: 'to run; jogging' },
  '游泳': { pinyin: 'yóuyǒng', definition: 'to swim; swimming' },
  '让': { pinyin: 'ràng', definition: 'to let; to make; to allow' },
  '感觉': { pinyin: 'gǎnjué', definition: 'to feel; feeling; sense' },
  '好': { pinyin: 'hǎo', definition: 'good; well; fine' },
  '的': { pinyin: 'de', definition: 'possessive particle; of' },
  '也': { pinyin: 'yě', definition: 'also; too' },
  '我们': { pinyin: 'wǒmen', definition: 'we; us' },
  '一起': { pinyin: 'yìqǐ', definition: 'together' },
  '打': { pinyin: 'dǎ', definition: 'to hit; to play (sports)' },
  '篮球': { pinyin: 'lánqiú', definition: 'basketball' },
};

export async function lookupChinese(word: string): Promise<DictionaryResult | null> {
  try {
    // First check our basic dictionary
    if (basicChineseDict[word]) {
      const entry = basicChineseDict[word];
      return {
        word,
        reading: entry.pinyin,
        definition: entry.definition,
        example: undefined,
      };
    }

    // Try using a free API that supports CORS
    // Using chinese-dictionary-api which is CORS-enabled
    try {
      const response = await fetch(
        `https://api.peteryang.net/chinese-dictionary/search?q=${encodeURIComponent(word)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          return {
            word,
            reading: result.pinyin || '',
            definition: result.english || 'Definition available',
            example: result.example || undefined,
          };
        }
      }
    } catch (apiError) {
      console.log('API lookup failed, using fallback');
    }

    // Fallback for unknown words
    return {
      word,
      reading: '',
      definition: 'Word not found in dictionary. Try selecting a different word or visit https://www.mdbg.net/chinese/dictionary for more.',
      example: undefined,
    };
  } catch (error) {
    console.error('Error looking up Chinese word:', error);
    return null;
  }
}
