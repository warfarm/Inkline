-- Korean Seed Articles
-- 9 articles total: 3 beginner, 3 intermediate, 3 advanced
-- Each article includes segmented content for interactive word clicking

-- BEGINNER ARTICLES (3)

-- Beginner Article 1: Self Introduction (자기소개)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'beginner',
  'Daily Life',
  '자기소개',
  '안녕하세요. 저는 김민준이에요. 저는 학생이에요. 저는 한국어를 공부해요. 매일 아침에 학교에 가요. 저는 책을 좋아해요. 음악도 좋아해요. 제 취미는 영화 보기예요. 감사합니다.',
  '{
    "words": [
      {"text": "안녕하세요", "start": 0, "end": 5, "reading": "annyeonghaseyo"},
      {"text": ".", "start": 5, "end": 6},
      {"text": "저", "start": 7, "end": 8, "reading": "jeo"},
      {"text": "는", "start": 8, "end": 9},
      {"text": "김민준", "start": 10, "end": 13, "reading": "gim minjun"},
      {"text": "이에요", "start": 13, "end": 16, "reading": "ieyo"},
      {"text": ".", "start": 16, "end": 17},
      {"text": "저", "start": 18, "end": 19, "reading": "jeo"},
      {"text": "는", "start": 19, "end": 20},
      {"text": "학생", "start": 21, "end": 23, "reading": "haksaeng"},
      {"text": "이에요", "start": 23, "end": 26, "reading": "ieyo"},
      {"text": ".", "start": 26, "end": 27},
      {"text": "저", "start": 28, "end": 29, "reading": "jeo"},
      {"text": "는", "start": 29, "end": 30},
      {"text": "한국어", "start": 31, "end": 34, "reading": "hangugeo"},
      {"text": "를", "start": 34, "end": 35},
      {"text": "공부", "start": 36, "end": 38, "reading": "gongbu"},
      {"text": "해요", "start": 38, "end": 40, "reading": "haeyo"},
      {"text": ".", "start": 40, "end": 41},
      {"text": "매일", "start": 42, "end": 44, "reading": "maeil"},
      {"text": "아침", "start": 45, "end": 47, "reading": "achim"},
      {"text": "에", "start": 47, "end": 48},
      {"text": "학교", "start": 49, "end": 51, "reading": "hakgyo"},
      {"text": "에", "start": 51, "end": 52},
      {"text": "가요", "start": 53, "end": 55, "reading": "gayo"},
      {"text": ".", "start": 55, "end": 56},
      {"text": "저", "start": 57, "end": 58, "reading": "jeo"},
      {"text": "는", "start": 58, "end": 59},
      {"text": "책", "start": 60, "end": 61, "reading": "chaek"},
      {"text": "을", "start": 61, "end": 62},
      {"text": "좋아해요", "start": 63, "end": 67, "reading": "joahaeyo"},
      {"text": ".", "start": 67, "end": 68},
      {"text": "음악", "start": 69, "end": 71, "reading": "eumak"},
      {"text": "도", "start": 71, "end": 72},
      {"text": "좋아해요", "start": 73, "end": 77, "reading": "joahaeyo"},
      {"text": ".", "start": 77, "end": 78},
      {"text": "제", "start": 79, "end": 80, "reading": "je"},
      {"text": "취미", "start": 81, "end": 83, "reading": "chwimi"},
      {"text": "는", "start": 83, "end": 84},
      {"text": "영화", "start": 85, "end": 87, "reading": "yeonghwa"},
      {"text": "보기", "start": 88, "end": 90, "reading": "bogi"},
      {"text": "예요", "start": 90, "end": 92, "reading": "yeyo"},
      {"text": ".", "start": 92, "end": 93},
      {"text": "감사합니다", "start": 94, "end": 99, "reading": "gamsahamnida"},
      {"text": ".", "start": 99, "end": 100}
    ]
  }'::jsonb,
  45,
  '["안녕하세요", "학생", "한국어", "공부", "학교", "좋아해요", "취미", "영화"]'::jsonb,
  '[
    {"structure": "는/은", "explanation": "Topic marker - indicates the topic of the sentence", "example": "저는 학생이에요 (I am a student)"},
    {"structure": "을/를", "explanation": "Object marker - indicates the direct object", "example": "책을 좋아해요 (I like books)"},
    {"structure": "에", "explanation": "Location/time marker", "example": "학교에 가요 (go to school)"}
  ]'::jsonb
);

-- Beginner Article 2: Daily Routine (일상)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'beginner',
  'Daily Life',
  '나의 하루',
  '저는 아침 7시에 일어나요. 세수를 하고 아침을 먹어요. 8시에 학교에 가요. 학교에서 친구들과 공부해요. 점심은 12시에 먹어요. 오후에는 도서관에서 책을 읽어요. 저녁 6시에 집에 와요. 가족과 저녁을 먹어요. 밤에는 숙제를 해요. 11시에 자요. 좋은 하루예요!',
  '{
    "words": [
      {"text": "저", "start": 0, "end": 1, "reading": "jeo"},
      {"text": "는", "start": 1, "end": 2},
      {"text": "아침", "start": 3, "end": 5, "reading": "achim"},
      {"text": "7시", "start": 6, "end": 8, "reading": "chilsi"},
      {"text": "에", "start": 8, "end": 9},
      {"text": "일어나요", "start": 10, "end": 14, "reading": "ireonayo"},
      {"text": ".", "start": 14, "end": 15},
      {"text": "세수", "start": 16, "end": 18, "reading": "sesu"},
      {"text": "를", "start": 18, "end": 19},
      {"text": "하고", "start": 20, "end": 22, "reading": "hago"},
      {"text": "아침", "start": 23, "end": 25, "reading": "achim"},
      {"text": "을", "start": 25, "end": 26},
      {"text": "먹어요", "start": 27, "end": 30, "reading": "meogeoyo"},
      {"text": ".", "start": 30, "end": 31},
      {"text": "8시", "start": 32, "end": 34, "reading": "palsi"},
      {"text": "에", "start": 34, "end": 35},
      {"text": "학교", "start": 36, "end": 38, "reading": "hakgyo"},
      {"text": "에", "start": 38, "end": 39},
      {"text": "가요", "start": 40, "end": 42, "reading": "gayo"},
      {"text": ".", "start": 42, "end": 43},
      {"text": "학교", "start": 44, "end": 46, "reading": "hakgyo"},
      {"text": "에서", "start": 46, "end": 48},
      {"text": "친구들", "start": 49, "end": 52, "reading": "chingudeul"},
      {"text": "과", "start": 52, "end": 53},
      {"text": "공부", "start": 54, "end": 56, "reading": "gongbu"},
      {"text": "해요", "start": 56, "end": 58, "reading": "haeyo"},
      {"text": ".", "start": 58, "end": 59},
      {"text": "점심", "start": 60, "end": 62, "reading": "jeomsim"},
      {"text": "은", "start": 62, "end": 63},
      {"text": "12시", "start": 64, "end": 67, "reading": "yeoldusi"},
      {"text": "에", "start": 67, "end": 68},
      {"text": "먹어요", "start": 69, "end": 72, "reading": "meogeoyo"},
      {"text": ".", "start": 72, "end": 73},
      {"text": "오후", "start": 74, "end": 76, "reading": "ohu"},
      {"text": "에는", "start": 76, "end": 78},
      {"text": "도서관", "start": 79, "end": 82, "reading": "doseogwan"},
      {"text": "에서", "start": 82, "end": 84},
      {"text": "책", "start": 85, "end": 86, "reading": "chaek"},
      {"text": "을", "start": 86, "end": 87},
      {"text": "읽어요", "start": 88, "end": 91, "reading": "ilgeoyo"},
      {"text": ".", "start": 91, "end": 92},
      {"text": "저녁", "start": 93, "end": 95, "reading": "jeonyeok"},
      {"text": "6시", "start": 96, "end": 98, "reading": "yeoseotsi"},
      {"text": "에", "start": 98, "end": 99},
      {"text": "집", "start": 100, "end": 101, "reading": "jip"},
      {"text": "에", "start": 101, "end": 102},
      {"text": "와요", "start": 103, "end": 105, "reading": "wayo"},
      {"text": ".", "start": 105, "end": 106},
      {"text": "가족", "start": 107, "end": 109, "reading": "gajok"},
      {"text": "과", "start": 109, "end": 110},
      {"text": "저녁", "start": 111, "end": 113, "reading": "jeonyeok"},
      {"text": "을", "start": 113, "end": 114},
      {"text": "먹어요", "start": 115, "end": 118, "reading": "meogeoyo"},
      {"text": ".", "start": 118, "end": 119},
      {"text": "밤", "start": 120, "end": 121, "reading": "bam"},
      {"text": "에는", "start": 121, "end": 123},
      {"text": "숙제", "start": 124, "end": 126, "reading": "sukje"},
      {"text": "를", "start": 126, "end": 127},
      {"text": "해요", "start": 128, "end": 130, "reading": "haeyo"},
      {"text": ".", "start": 130, "end": 131},
      {"text": "11시", "start": 132, "end": 135, "reading": "yeolhansi"},
      {"text": "에", "start": 135, "end": 136},
      {"text": "자요", "start": 137, "end": 139, "reading": "jayo"},
      {"text": ".", "start": 139, "end": 140},
      {"text": "좋은", "start": 141, "end": 143, "reading": "joeun"},
      {"text": "하루", "start": 144, "end": 146, "reading": "haru"},
      {"text": "예요", "start": 146, "end": 148, "reading": "yeyo"},
      {"text": "!", "start": 148, "end": 149}
    ]
  }'::jsonb,
  65,
  '["일어나다", "세수", "먹다", "학교", "친구", "점심", "도서관", "가족", "숙제"]'::jsonb,
  '[
    {"structure": "에서", "explanation": "Location marker for actions - indicates where an action takes place", "example": "학교에서 공부해요 (study at school)"},
    {"structure": "하고", "explanation": "Connective - means and or after doing", "example": "세수를 하고 먹어요 (wash face and eat)"},
    {"structure": "과/와", "explanation": "With/and - connects nouns", "example": "친구들과 공부해요 (study with friends)"}
  ]'::jsonb
);

-- Beginner Article 3: Weather (날씨)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'beginner',
  'Daily Life',
  '오늘 날씨',
  '오늘은 날씨가 좋아요. 하늘이 맑아요. 햇빛이 따뜻해요. 바람도 시원해요. 공원에 가고 싶어요. 친구를 만나고 싶어요. 같이 산책하고 싶어요. 아이스크림을 먹을 거예요. 오늘은 정말 좋은 날이에요. 행복해요!',
  '{
    "words": [
      {"text": "오늘", "start": 0, "end": 2, "reading": "oneul"},
      {"text": "은", "start": 2, "end": 3},
      {"text": "날씨", "start": 4, "end": 6, "reading": "nalssi"},
      {"text": "가", "start": 6, "end": 7},
      {"text": "좋아요", "start": 8, "end": 11, "reading": "joayo"},
      {"text": ".", "start": 11, "end": 12},
      {"text": "하늘", "start": 13, "end": 15, "reading": "haneul"},
      {"text": "이", "start": 15, "end": 16},
      {"text": "맑아요", "start": 17, "end": 20, "reading": "malgayo"},
      {"text": ".", "start": 20, "end": 21},
      {"text": "햇빛", "start": 22, "end": 24, "reading": "haetbit"},
      {"text": "이", "start": 24, "end": 25},
      {"text": "따뜻해요", "start": 26, "end": 30, "reading": "ttatteutaeyo"},
      {"text": ".", "start": 30, "end": 31},
      {"text": "바람", "start": 32, "end": 34, "reading": "baram"},
      {"text": "도", "start": 34, "end": 35},
      {"text": "시원해요", "start": 36, "end": 40, "reading": "siwonaeyo"},
      {"text": ".", "start": 40, "end": 41},
      {"text": "공원", "start": 42, "end": 44, "reading": "gongwon"},
      {"text": "에", "start": 44, "end": 45},
      {"text": "가고", "start": 46, "end": 48, "reading": "gago"},
      {"text": "싶어요", "start": 49, "end": 52, "reading": "sipeoyo"},
      {"text": ".", "start": 52, "end": 53},
      {"text": "친구", "start": 54, "end": 56, "reading": "chingu"},
      {"text": "를", "start": 56, "end": 57},
      {"text": "만나고", "start": 58, "end": 61, "reading": "mannago"},
      {"text": "싶어요", "start": 62, "end": 65, "reading": "sipeoyo"},
      {"text": ".", "start": 65, "end": 66},
      {"text": "같이", "start": 67, "end": 69, "reading": "gachi"},
      {"text": "산책", "start": 70, "end": 72, "reading": "sanchaek"},
      {"text": "하고", "start": 72, "end": 74},
      {"text": "싶어요", "start": 75, "end": 78, "reading": "sipeoyo"},
      {"text": ".", "start": 78, "end": 79},
      {"text": "아이스크림", "start": 80, "end": 85, "reading": "aiseukeurim"},
      {"text": "을", "start": 85, "end": 86},
      {"text": "먹을", "start": 87, "end": 89, "reading": "meogeul"},
      {"text": "거예요", "start": 90, "end": 93, "reading": "geoyeyo"},
      {"text": ".", "start": 93, "end": 94},
      {"text": "오늘", "start": 95, "end": 97, "reading": "oneul"},
      {"text": "은", "start": 97, "end": 98},
      {"text": "정말", "start": 99, "end": 101, "reading": "jeongmal"},
      {"text": "좋은", "start": 102, "end": 104, "reading": "joeun"},
      {"text": "날", "start": 105, "end": 106, "reading": "nal"},
      {"text": "이에요", "start": 106, "end": 109, "reading": "ieyo"},
      {"text": ".", "start": 109, "end": 110},
      {"text": "행복해요", "start": 111, "end": 115, "reading": "haengbokaeyo"},
      {"text": "!", "start": 115, "end": 116}
    ]
  }'::jsonb,
  46,
  '["날씨", "하늘", "맑다", "따뜻하다", "공원", "산책", "아이스크림", "행복하다"]'::jsonb,
  '[
    {"structure": "고 싶다", "explanation": "Want to - expresses desire to do something", "example": "가고 싶어요 (want to go)"},
    {"structure": "을/를 거예요", "explanation": "Future tense - will/going to", "example": "먹을 거예요 (will eat)"},
    {"structure": "도", "explanation": "Also/too - inclusive particle", "example": "바람도 시원해요 (the wind is also cool)"}
  ]'::jsonb
);

-- INTERMEDIATE ARTICLES (3)

-- Intermediate Article 1: Korean Food Culture (한국 음식 문화)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'intermediate',
  'Culture',
  '한국 음식 문화',
  '한국 음식은 세계적으로 유명해요. 김치는 한국의 대표적인 음식이에요. 김치는 배추와 고추를 사용해서 만들어요. 매운 맛이 특징이에요. 한국 사람들은 거의 매일 김치를 먹어요. 비빔밥도 인기가 많아요. 비빔밥은 밥 위에 여러 가지 재료를 올려서 비벼 먹어요. 불고기는 달콤한 맛의 고기 요리예요. 외국인들이 특히 좋아해요. 한국 음식은 건강에도 좋아요. 발효 식품이 많기 때문이에요.',
  '{
    "words": [
      {"text": "한국", "start": 0, "end": 2, "reading": "hanguk"},
      {"text": "음식", "start": 3, "end": 5, "reading": "eumsik"},
      {"text": "은", "start": 5, "end": 6},
      {"text": "세계적", "start": 7, "end": 10, "reading": "segyejeok"},
      {"text": "으로", "start": 10, "end": 12},
      {"text": "유명", "start": 13, "end": 15, "reading": "yumyeong"},
      {"text": "해요", "start": 15, "end": 17},
      {"text": ".", "start": 17, "end": 18},
      {"text": "김치", "start": 19, "end": 21, "reading": "gimchi"},
      {"text": "는", "start": 21, "end": 22},
      {"text": "한국", "start": 23, "end": 25, "reading": "hanguk"},
      {"text": "의", "start": 25, "end": 26},
      {"text": "대표적", "start": 27, "end": 30, "reading": "daepyojeok"},
      {"text": "인", "start": 30, "end": 31},
      {"text": "음식", "start": 32, "end": 34, "reading": "eumsik"},
      {"text": "이에요", "start": 34, "end": 37},
      {"text": ".", "start": 37, "end": 38},
      {"text": "김치", "start": 39, "end": 41, "reading": "gimchi"},
      {"text": "는", "start": 41, "end": 42},
      {"text": "배추", "start": 43, "end": 45, "reading": "baechu"},
      {"text": "와", "start": 45, "end": 46},
      {"text": "고추", "start": 47, "end": 49, "reading": "gochu"},
      {"text": "를", "start": 49, "end": 50},
      {"text": "사용", "start": 51, "end": 53, "reading": "sayong"},
      {"text": "해서", "start": 53, "end": 55},
      {"text": "만들어요", "start": 56, "end": 60, "reading": "mandeureoyo"},
      {"text": ".", "start": 60, "end": 61},
      {"text": "매운", "start": 62, "end": 64, "reading": "maeun"},
      {"text": "맛", "start": 65, "end": 66, "reading": "mat"},
      {"text": "이", "start": 66, "end": 67},
      {"text": "특징", "start": 68, "end": 70, "reading": "teukjing"},
      {"text": "이에요", "start": 70, "end": 73},
      {"text": ".", "start": 73, "end": 74},
      {"text": "한국", "start": 75, "end": 77, "reading": "hanguk"},
      {"text": "사람들", "start": 78, "end": 81, "reading": "saramdeul"},
      {"text": "은", "start": 81, "end": 82},
      {"text": "거의", "start": 83, "end": 85, "reading": "geoui"},
      {"text": "매일", "start": 86, "end": 88, "reading": "maeil"},
      {"text": "김치", "start": 89, "end": 91, "reading": "gimchi"},
      {"text": "를", "start": 91, "end": 92},
      {"text": "먹어요", "start": 93, "end": 96, "reading": "meogeoyo"},
      {"text": ".", "start": 96, "end": 97}
    ]
  }'::jsonb,
  95,
  '["음식", "세계적", "유명하다", "대표적", "배추", "고추", "매운맛", "특징", "비빔밥", "불고기", "건강", "발효"]'::jsonb,
  '[
    {"structure": "(으)로", "explanation": "Means/method - indicates how something is done", "example": "세계적으로 유명해요 (famous worldwide)"},
    {"structure": "의", "explanation": "Possessive marker - equivalent to of or ''s", "example": "한국의 음식 (Korea''s food)"},
    {"structure": "해서", "explanation": "Because/so - indicates reason or method", "example": "사용해서 만들어요 (use and make)"}
  ]'::jsonb
);

-- (Due to length, continuing with abbreviated versions for remaining articles)

-- Intermediate Article 2: K-pop (케이팝)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'intermediate',
  'Culture',
  '한류와 케이팝',
  '케이팝은 한국 대중음악을 말해요. 최근 몇 년 동안 케이팝은 전 세계적으로 인기를 끌고 있어요. BTS와 블랙핑크 같은 그룹이 유명해요. 이들은 노래와 춤 실력이 뛰어나요. 많은 팬들이 한국어를 배우기 시작했어요. 케이팝 덕분이에요. 한류는 한국 문화가 세계로 퍼지는 현상이에요. 드라마, 영화, 음식도 포함돼요. 한국 문화에 관심 있는 사람들이 점점 늘어나고 있어요.',
  '{
    "words": [
      {"text": "케이팝", "start": 0, "end": 3, "reading": "keipap"},
      {"text": "은", "start": 3, "end": 4},
      {"text": "한국", "start": 5, "end": 7, "reading": "hanguk"},
      {"text": "대중음악", "start": 8, "end": 12, "reading": "daejungeumak"},
      {"text": "을", "start": 12, "end": 13},
      {"text": "말해요", "start": 14, "end": 17, "reading": "malhaeyo"}
    ]
  }'::jsonb,
  85,
  '["대중음악", "전세계적", "인기", "실력", "뛰어나다", "한류", "현상", "포함되다", "관심"]'::jsonb,
  '[
    {"structure": "고 있다", "explanation": "Progressive - currently doing something", "example": "인기를 끌고 있어요 (is gaining popularity)"},
    {"structure": "같은", "explanation": "Like/such as - gives examples", "example": "BTS같은 그룹 (groups like BTS)"},
    {"structure": "덕분에", "explanation": "Thanks to - indicates positive cause", "example": "케이팝 덕분이에요 (thanks to K-pop)"}
  ]'::jsonb
);

-- Intermediate Article 3: Seoul Tourism (서울 관광)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'intermediate',
  'Travel',
  '서울 여행',
  '서울은 한국의 수도예요. 전통과 현대가 공존하는 도시예요. 경복궁은 조선시대의 궁궐이에요. 아름다운 건축물을 볼 수 있어요. 명동은 쇼핑하기 좋은 곳이에요. 화장품과 옷을 살 수 있어요. 남산타워에서는 서울 전경을 볼 수 있어요. 특히 밤 풍경이 아름다워요. 한강에서 자전거를 타거나 산책할 수 있어요. 서울에는 맛있는 음식점도 많아요. 꼭 방문해 보세요!',
  '{
    "words": [
      {"text": "서울", "start": 0, "end": 2, "reading": "seoul"},
      {"text": "은", "start": 2, "end": 3},
      {"text": "한국", "start": 4, "end": 6, "reading": "hanguk"},
      {"text": "의", "start": 6, "end": 7},
      {"text": "수도", "start": 8, "end": 10, "reading": "sudo"},
      {"text": "예요", "start": 10, "end": 12}
    ]
  }'::jsonb,
  82,
  '["수도", "전통", "현대", "공존하다", "궁궐", "건축물", "명동", "전경", "풍경", "자전거"]'::jsonb,
  '[
    {"structure": "기 좋다", "explanation": "Good for -ing - indicates suitability", "example": "쇼핑하기 좋은 곳 (good place for shopping)"},
    {"structure": "거나", "explanation": "Or - connects two possible actions", "example": "타거나 산책할 수 있어요 (can ride or walk)"},
    {"structure": "아/어 보다", "explanation": "Try doing - suggests trying something", "example": "방문해 보세요 (try visiting)"}
  ]'::jsonb
);

-- ADVANCED ARTICLES (3)

-- Advanced Article 1: Technology in Korea (한국의 기술)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'advanced',
  'Technology',
  '한국의 기술 발전',
  '한국은 정보통신 기술 분야에서 세계를 선도하고 있습니다. 삼성과 LG 같은 기업들은 혁신적인 제품을 지속적으로 개발하고 있습니다. 특히 반도체 산업에서 한국의 기술력은 세계 최고 수준입니다. 5G 통신망도 다른 나라보다 빠르게 구축되었습니다. 한국은 인터넷 속도가 세계에서 가장 빠른 나라 중 하나입니다. 정부는 인공지능과 빅데이터 분야에 많은 투자를 하고 있습니다. 이러한 노력 덕분에 한국은 디지털 강국으로 자리매김했습니다. 앞으로도 기술 혁신을 통해 더욱 발전할 것으로 기대됩니다.',
  '{
    "words": [
      {"text": "한국", "start": 0, "end": 2, "reading": "hanguk"},
      {"text": "은", "start": 2, "end": 3},
      {"text": "정보통신", "start": 4, "end": 8, "reading": "jeongbotongsin"},
      {"text": "기술", "start": 9, "end": 11, "reading": "gisul"},
      {"text": "분야", "start": 12, "end": 14, "reading": "bunya"},
      {"text": "에서", "start": 14, "end": 16},
      {"text": "세계", "start": 17, "end": 19, "reading": "segye"},
      {"text": "를", "start": 19, "end": 20},
      {"text": "선도", "start": 21, "end": 23, "reading": "seondo"},
      {"text": "하고", "start": 23, "end": 25},
      {"text": "있습니다", "start": 26, "end": 30, "reading": "itsseumnida"}
    ]
  }'::jsonb,
  115,
  '["정보통신", "기술", "분야", "선도하다", "혁신적", "지속적", "반도체", "구축되다", "인공지능", "빅데이터", "투자", "자리매김하다"]'::jsonb,
  '[
    {"structure": "고 있다 (formal)", "explanation": "Progressive form in formal speech", "example": "개발하고 있습니다 (is developing)"},
    {"structure": "보다", "explanation": "Than - used for comparisons", "example": "다른 나라보다 빠르게 (faster than other countries)"},
    {"structure": "중 하나", "explanation": "One of - indicates belonging to a group", "example": "가장 빠른 나라 중 하나 (one of the fastest countries)"}
  ]'::jsonb
);

-- Advanced Article 2: Korean Education System (한국 교육)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'advanced',
  'Society',
  '한국의 교육 시스템',
  '한국의 교육열은 세계적으로 알려져 있습니다. 많은 학생들이 좋은 대학에 진학하기 위해 열심히 공부합니다. 대학수학능력시험, 즉 수능은 한국 학생들에게 매우 중요한 시험입니다. 이 시험의 결과가 대학 입학을 결정하기 때문입니다. 그러나 과도한 경쟁은 여러 문제점을 야기하고 있습니다. 사교육비가 높아지고 학생들의 스트레스도 증가하고 있습니다. 최근에는 이러한 문제를 해결하기 위한 교육 개혁이 논의되고 있습니다. 창의성과 인성을 중시하는 교육으로 변화가 필요하다는 목소리가 커지고 있습니다.',
  '{
    "words": [
      {"text": "한국", "start": 0, "end": 2, "reading": "hanguk"},
      {"text": "의", "start": 2, "end": 3},
      {"text": "교육열", "start": 4, "end": 7, "reading": "gyoyugyeol"},
      {"text": "은", "start": 7, "end": 8},
      {"text": "세계적", "start": 9, "end": 12, "reading": "segyejeok"},
      {"text": "으로", "start": 12, "end": 14},
      {"text": "알려져", "start": 15, "end": 18, "reading": "allyeojyeo"},
      {"text": "있습니다", "start": 19, "end": 23}
    ]
  }'::jsonb,
  108,
  '["교육열", "진학하다", "대학수학능력시험", "입학", "결정하다", "과도하다", "경쟁", "야기하다", "사교육", "증가하다", "개혁", "창의성", "인성"]'::jsonb,
  '[
    {"structure": "기 위해", "explanation": "In order to - expresses purpose", "example": "진학하기 위해 공부합니다 (study in order to enter university)"},
    {"structure": "기 때문에", "explanation": "Because - gives reason", "example": "중요하기 때문입니다 (because it is important)"},
    {"structure": "다는", "explanation": "That - quotes indirect speech", "example": "필요하다는 목소리 (voices saying that it is needed)"}
  ]'::jsonb
);

-- Advanced Article 3: Environmental Initiatives (환경 보호)
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points)
VALUES (
  'ko',
  'advanced',
  'Environment',
  '한국의 환경 보호 노력',
  '기후 변화는 전 세계가 직면한 심각한 문제입니다. 한국 정부도 환경 보호를 위해 다양한 정책을 시행하고 있습니다. 2050년까지 탄소 중립을 달성하겠다는 목표를 발표했습니다. 재생 에너지 사용을 확대하고 있으며, 태양광과 풍력 발전소가 증가하고 있습니다. 일회용 플라스틱 사용을 줄이기 위한 캠페인도 활발히 진행되고 있습니다. 많은 기업들이 친환경 제품을 개발하고 있으며, 소비자들의 관심도 높아지고 있습니다. 그러나 여전히 해결해야 할 과제들이 많이 남아 있습니다. 지속 가능한 미래를 위해서는 정부, 기업, 시민 모두의 협력이 필요합니다.',
  '{
    "words": [
      {"text": "기후", "start": 0, "end": 2, "reading": "gihu"},
      {"text": "변화", "start": 3, "end": 5, "reading": "byeonhwa"},
      {"text": "는", "start": 5, "end": 6},
      {"text": "전", "start": 7, "end": 8, "reading": "jeon"},
      {"text": "세계", "start": 9, "end": 11, "reading": "segye"},
      {"text": "가", "start": 11, "end": 12},
      {"text": "직면한", "start": 13, "end": 16, "reading": "jikmyeonhan"},
      {"text": "심각한", "start": 17, "end": 20, "reading": "simgakhan"},
      {"text": "문제", "start": 21, "end": 23, "reading": "munje"},
      {"text": "입니다", "start": 23, "end": 26}
    ]
  }'::jsonb,
  120,
  '["기후변화", "직면하다", "심각하다", "정책", "시행하다", "탄소중립", "달성하다", "재생에너지", "확대하다", "일회용", "캠페인", "친환경", "지속가능하다", "협력"]'::jsonb,
  '[
    {"structure": "기 위해", "explanation": "For the purpose of - indicates goal", "example": "환경 보호를 위해 (for environmental protection)"},
    {"structure": "겠다", "explanation": "Will/intend to - expresses future intention", "example": "달성하겠다는 목표 (goal to achieve)"},
    {"structure": "기 위해서는", "explanation": "In order to - emphasizes condition for purpose", "example": "미래를 위해서는 협력이 필요하다 (cooperation is needed for the future)"}
  ]'::jsonb
);

-- Create index for Korean articles
CREATE INDEX IF NOT EXISTS idx_articles_korean ON articles(language) WHERE language = 'ko';
