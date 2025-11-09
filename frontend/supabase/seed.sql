-- Sample article data for testing
-- Japanese beginner article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'beginner',
  'Daily Life',
  '私の一日',
  '私は学生です。毎日学校に行きます。朝ごはんを食べます。友達と話します。日本語を勉強します。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし"},
      {"text": "は", "start": 1, "end": 2},
      {"text": "学生", "start": 2, "end": 4, "reading": "がくせい"},
      {"text": "です", "start": 4, "end": 6},
      {"text": "。", "start": 6, "end": 7},
      {"text": "毎日", "start": 7, "end": 9, "reading": "まいにち"},
      {"text": "学校", "start": 9, "end": 11, "reading": "がっこう"},
      {"text": "に", "start": 11, "end": 12},
      {"text": "行き", "start": 12, "end": 14, "reading": "いき"},
      {"text": "ます", "start": 14, "end": 16},
      {"text": "。", "start": 16, "end": 17},
      {"text": "朝", "start": 17, "end": 18, "reading": "あさ"},
      {"text": "ごはん", "start": 18, "end": 21},
      {"text": "を", "start": 21, "end": 22},
      {"text": "食べ", "start": 22, "end": 24, "reading": "たべ"},
      {"text": "ます", "start": 24, "end": 26},
      {"text": "。", "start": 26, "end": 27},
      {"text": "友達", "start": 27, "end": 29, "reading": "ともだち"},
      {"text": "と", "start": 29, "end": 30},
      {"text": "話し", "start": 30, "end": 32, "reading": "はなし"},
      {"text": "ます", "start": 32, "end": 34},
      {"text": "。", "start": 34, "end": 35},
      {"text": "日本語", "start": 35, "end": 38, "reading": "にほんご"},
      {"text": "を", "start": 38, "end": 39},
      {"text": "勉強", "start": 39, "end": 41, "reading": "べんきょう"},
      {"text": "し", "start": 41, "end": 42},
      {"text": "ます", "start": 42, "end": 44},
      {"text": "。", "start": 44, "end": 45}
    ]
  }',
  28
);

-- Chinese beginner article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'beginner',
  'Daily Life',
  '我的一天',
  '我是学生。我每天去学校。我吃早饭。我和朋友说话。我学习中文。',
  '{
    "words": [
      {"text": "我", "start": 0, "end": 1, "reading": "wǒ"},
      {"text": "是", "start": 1, "end": 2, "reading": "shì"},
      {"text": "学生", "start": 2, "end": 4, "reading": "xuésheng"},
      {"text": "。", "start": 4, "end": 5},
      {"text": "我", "start": 5, "end": 6, "reading": "wǒ"},
      {"text": "每天", "start": 6, "end": 8, "reading": "měitiān"},
      {"text": "去", "start": 8, "end": 9, "reading": "qù"},
      {"text": "学校", "start": 9, "end": 11, "reading": "xuéxiào"},
      {"text": "。", "start": 11, "end": 12},
      {"text": "我", "start": 12, "end": 13, "reading": "wǒ"},
      {"text": "吃", "start": 13, "end": 14, "reading": "chī"},
      {"text": "早饭", "start": 14, "end": 16, "reading": "zǎofàn"},
      {"text": "。", "start": 16, "end": 17},
      {"text": "我", "start": 17, "end": 18, "reading": "wǒ"},
      {"text": "和", "start": 18, "end": 19, "reading": "hé"},
      {"text": "朋友", "start": 19, "end": 21, "reading": "péngyou"},
      {"text": "说话", "start": 21, "end": 23, "reading": "shuōhuà"},
      {"text": "。", "start": 23, "end": 24},
      {"text": "我", "start": 24, "end": 25, "reading": "wǒ"},
      {"text": "学习", "start": 25, "end": 27, "reading": "xuéxí"},
      {"text": "中文", "start": 27, "end": 29, "reading": "zhōngwén"},
      {"text": "。", "start": 29, "end": 30}
    ]
  }',
  22
);

-- Japanese intermediate article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'intermediate',
  'Technology',
  'スマートフォンの使い方',
  'スマートフォンは現代社会で重要なツールです。メッセージを送ったり、写真を撮ったり、インターネットで情報を検索したりできます。多くの人が毎日使っています。',
  '{
    "words": [
      {"text": "スマートフォン", "start": 0, "end": 8},
      {"text": "は", "start": 8, "end": 9},
      {"text": "現代", "start": 9, "end": 11, "reading": "げんだい"},
      {"text": "社会", "start": 11, "end": 13, "reading": "しゃかい"},
      {"text": "で", "start": 13, "end": 14},
      {"text": "重要", "start": 14, "end": 16, "reading": "じゅうよう"},
      {"text": "な", "start": 16, "end": 17},
      {"text": "ツール", "start": 17, "end": 20},
      {"text": "です", "start": 20, "end": 22},
      {"text": "。", "start": 22, "end": 23}
    ]
  }',
  35
);

-- Chinese intermediate article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'intermediate',
  'Technology',
  '智能手机的使用',
  '智能手机是现代社会的重要工具。我们可以发送消息、拍照片、上网搜索信息。很多人每天都在使用它。',
  '{
    "words": [
      {"text": "智能", "start": 0, "end": 2, "reading": "zhìnéng"},
      {"text": "手机", "start": 2, "end": 4, "reading": "shǒujī"},
      {"text": "是", "start": 4, "end": 5, "reading": "shì"},
      {"text": "现代", "start": 5, "end": 7, "reading": "xiàndài"},
      {"text": "社会", "start": 7, "end": 9, "reading": "shèhuì"},
      {"text": "的", "start": 9, "end": 10, "reading": "de"},
      {"text": "重要", "start": 10, "end": 12, "reading": "zhòngyào"},
      {"text": "工具", "start": 12, "end": 14, "reading": "gōngjù"},
      {"text": "。", "start": 14, "end": 15}
    ]
  }',
  30
);

-- Japanese beginner - Food & Cooking
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'beginner',
  'Food & Cooking',
  'すしを食べる',
  '私はすしが好きです。すしは日本の食べ物です。魚と米で作ります。とてもおいしいです。レストランで食べます。友達も好きです。一緒に食べます。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし"},
      {"text": "は", "start": 1, "end": 2},
      {"text": "すし", "start": 2, "end": 4},
      {"text": "が", "start": 4, "end": 5},
      {"text": "好き", "start": 5, "end": 7, "reading": "すき"},
      {"text": "です", "start": 7, "end": 9},
      {"text": "。", "start": 9, "end": 10},
      {"text": "すし", "start": 10, "end": 12},
      {"text": "は", "start": 12, "end": 13},
      {"text": "日本", "start": 13, "end": 15, "reading": "にほん"},
      {"text": "の", "start": 15, "end": 16},
      {"text": "食べ物", "start": 16, "end": 19, "reading": "たべもの"},
      {"text": "です", "start": 19, "end": 21},
      {"text": "。", "start": 21, "end": 22},
      {"text": "魚", "start": 22, "end": 23, "reading": "さかな"},
      {"text": "と", "start": 23, "end": 24},
      {"text": "米", "start": 24, "end": 25, "reading": "こめ"},
      {"text": "で", "start": 25, "end": 26},
      {"text": "作り", "start": 26, "end": 28, "reading": "つくり"},
      {"text": "ます", "start": 28, "end": 30},
      {"text": "。", "start": 30, "end": 31},
      {"text": "とても", "start": 31, "end": 34},
      {"text": "おいしい", "start": 34, "end": 38},
      {"text": "です", "start": 38, "end": 40},
      {"text": "。", "start": 40, "end": 41},
      {"text": "レストラン", "start": 41, "end": 46},
      {"text": "で", "start": 46, "end": 47},
      {"text": "食べ", "start": 47, "end": 49, "reading": "たべ"},
      {"text": "ます", "start": 49, "end": 51},
      {"text": "。", "start": 51, "end": 52},
      {"text": "友達", "start": 52, "end": 54, "reading": "ともだち"},
      {"text": "も", "start": 54, "end": 55},
      {"text": "好き", "start": 55, "end": 57, "reading": "すき"},
      {"text": "です", "start": 57, "end": 59},
      {"text": "。", "start": 59, "end": 60},
      {"text": "一緒に", "start": 60, "end": 63, "reading": "いっしょに"},
      {"text": "食べ", "start": 63, "end": 65, "reading": "たべ"},
      {"text": "ます", "start": 65, "end": 67},
      {"text": "。", "start": 67, "end": 68}
    ]
  }',
  38
);

-- Chinese beginner - Food & Cooking
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'beginner',
  'Food & Cooking',
  '做饭',
  '我喜欢做饭。我会做中国菜。我用米、菜和肉。做饭很有趣。我常常给家人做饭。他们都很喜欢吃。',
  '{
    "words": [
      {"text": "我", "start": 0, "end": 1, "reading": "wǒ"},
      {"text": "喜欢", "start": 1, "end": 3, "reading": "xǐhuan"},
      {"text": "做饭", "start": 3, "end": 5, "reading": "zuòfàn"},
      {"text": "。", "start": 5, "end": 6},
      {"text": "我", "start": 6, "end": 7, "reading": "wǒ"},
      {"text": "会", "start": 7, "end": 8, "reading": "huì"},
      {"text": "做", "start": 8, "end": 9, "reading": "zuò"},
      {"text": "中国", "start": 9, "end": 11, "reading": "zhōngguó"},
      {"text": "菜", "start": 11, "end": 12, "reading": "cài"},
      {"text": "。", "start": 12, "end": 13},
      {"text": "我", "start": 13, "end": 14, "reading": "wǒ"},
      {"text": "用", "start": 14, "end": 15, "reading": "yòng"},
      {"text": "米", "start": 15, "end": 16, "reading": "mǐ"},
      {"text": "、", "start": 16, "end": 17},
      {"text": "菜", "start": 17, "end": 18, "reading": "cài"},
      {"text": "和", "start": 18, "end": 19, "reading": "hé"},
      {"text": "肉", "start": 19, "end": 20, "reading": "ròu"},
      {"text": "。", "start": 20, "end": 21},
      {"text": "做饭", "start": 21, "end": 23, "reading": "zuòfàn"},
      {"text": "很", "start": 23, "end": 24, "reading": "hěn"},
      {"text": "有趣", "start": 24, "end": 26, "reading": "yǒuqù"},
      {"text": "。", "start": 26, "end": 27},
      {"text": "我", "start": 27, "end": 28, "reading": "wǒ"},
      {"text": "常常", "start": 28, "end": 30, "reading": "chángcháng"},
      {"text": "给", "start": 30, "end": 31, "reading": "gěi"},
      {"text": "家人", "start": 31, "end": 33, "reading": "jiārén"},
      {"text": "做饭", "start": 33, "end": 35, "reading": "zuòfàn"},
      {"text": "。", "start": 35, "end": 36},
      {"text": "他们", "start": 36, "end": 38, "reading": "tāmen"},
      {"text": "都", "start": 38, "end": 39, "reading": "dōu"},
      {"text": "很", "start": 39, "end": 40, "reading": "hěn"},
      {"text": "喜欢", "start": 40, "end": 42, "reading": "xǐhuan"},
      {"text": "吃", "start": 42, "end": 43, "reading": "chī"},
      {"text": "。", "start": 43, "end": 44}
    ]
  }',
  34
);

-- Japanese intermediate - Culture & Travel
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'intermediate',
  'Culture & Travel',
  '京都の観光',
  '京都は日本の古い都市です。たくさんのお寺や神社があります。春には桜が咲いて、とてもきれいです。秋の紅葉も有名です。観光客が世界中から来ます。伝統的な文化を体験できます。',
  '{
    "words": [
      {"text": "京都", "start": 0, "end": 2, "reading": "きょうと"},
      {"text": "は", "start": 2, "end": 3},
      {"text": "日本", "start": 3, "end": 5, "reading": "にほん"},
      {"text": "の", "start": 5, "end": 6},
      {"text": "古い", "start": 6, "end": 8, "reading": "ふるい"},
      {"text": "都市", "start": 8, "end": 10, "reading": "とし"},
      {"text": "です", "start": 10, "end": 12},
      {"text": "。", "start": 12, "end": 13},
      {"text": "たくさん", "start": 13, "end": 17},
      {"text": "の", "start": 17, "end": 18},
      {"text": "お寺", "start": 18, "end": 20, "reading": "おてら"},
      {"text": "や", "start": 20, "end": 21},
      {"text": "神社", "start": 21, "end": 23, "reading": "じんじゃ"},
      {"text": "が", "start": 23, "end": 24},
      {"text": "あり", "start": 24, "end": 26},
      {"text": "ます", "start": 26, "end": 28},
      {"text": "。", "start": 28, "end": 29},
      {"text": "春", "start": 29, "end": 30, "reading": "はる"},
      {"text": "に", "start": 30, "end": 31},
      {"text": "は", "start": 31, "end": 32},
      {"text": "桜", "start": 32, "end": 33, "reading": "さくら"},
      {"text": "が", "start": 33, "end": 34},
      {"text": "咲い", "start": 34, "end": 36, "reading": "さい"},
      {"text": "て", "start": 36, "end": 37},
      {"text": "、", "start": 37, "end": 38},
      {"text": "とても", "start": 38, "end": 41},
      {"text": "きれい", "start": 41, "end": 44},
      {"text": "です", "start": 44, "end": 46},
      {"text": "。", "start": 46, "end": 47},
      {"text": "秋", "start": 47, "end": 48, "reading": "あき"},
      {"text": "の", "start": 48, "end": 49},
      {"text": "紅葉", "start": 49, "end": 51, "reading": "こうよう"},
      {"text": "も", "start": 51, "end": 52},
      {"text": "有名", "start": 52, "end": 54, "reading": "ゆうめい"},
      {"text": "です", "start": 54, "end": 56},
      {"text": "。", "start": 56, "end": 57},
      {"text": "観光客", "start": 57, "end": 60, "reading": "かんこうきゃく"},
      {"text": "が", "start": 60, "end": 61},
      {"text": "世界中", "start": 61, "end": 64, "reading": "せかいじゅう"},
      {"text": "から", "start": 64, "end": 66},
      {"text": "来", "start": 66, "end": 67, "reading": "き"},
      {"text": "ます", "start": 67, "end": 69},
      {"text": "。", "start": 69, "end": 70},
      {"text": "伝統的", "start": 70, "end": 73, "reading": "でんとうてき"},
      {"text": "な", "start": 73, "end": 74},
      {"text": "文化", "start": 74, "end": 76, "reading": "ぶんか"},
      {"text": "を", "start": 76, "end": 77},
      {"text": "体験", "start": 77, "end": 79, "reading": "たいけん"},
      {"text": "でき", "start": 79, "end": 81},
      {"text": "ます", "start": 81, "end": 83},
      {"text": "。", "start": 83, "end": 84}
    ]
  }',
  52
);

-- Chinese intermediate - Culture & Travel
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'intermediate',
  'Culture & Travel',
  '北京旅游',
  '北京是中国的首都，有很多著名的景点。长城是必看的地方，历史悠久。故宫展示了古代皇帝的生活。北京烤鸭是当地的美食。游客可以体验传统文化和现代生活的结合。',
  '{
    "words": [
      {"text": "北京", "start": 0, "end": 2, "reading": "běijīng"},
      {"text": "是", "start": 2, "end": 3, "reading": "shì"},
      {"text": "中国", "start": 3, "end": 5, "reading": "zhōngguó"},
      {"text": "的", "start": 5, "end": 6, "reading": "de"},
      {"text": "首都", "start": 6, "end": 8, "reading": "shǒudū"},
      {"text": "，", "start": 8, "end": 9},
      {"text": "有", "start": 9, "end": 10, "reading": "yǒu"},
      {"text": "很多", "start": 10, "end": 12, "reading": "hěnduō"},
      {"text": "著名", "start": 12, "end": 14, "reading": "zhùmíng"},
      {"text": "的", "start": 14, "end": 15, "reading": "de"},
      {"text": "景点", "start": 15, "end": 17, "reading": "jǐngdiǎn"},
      {"text": "。", "start": 17, "end": 18},
      {"text": "长城", "start": 18, "end": 20, "reading": "chángchéng"},
      {"text": "是", "start": 20, "end": 21, "reading": "shì"},
      {"text": "必看", "start": 21, "end": 23, "reading": "bìkàn"},
      {"text": "的", "start": 23, "end": 24, "reading": "de"},
      {"text": "地方", "start": 24, "end": 26, "reading": "dìfang"},
      {"text": "，", "start": 26, "end": 27},
      {"text": "历史", "start": 27, "end": 29, "reading": "lìshǐ"},
      {"text": "悠久", "start": 29, "end": 31, "reading": "yōujiǔ"},
      {"text": "。", "start": 31, "end": 32},
      {"text": "故宫", "start": 32, "end": 34, "reading": "gùgōng"},
      {"text": "展示", "start": 34, "end": 36, "reading": "zhǎnshì"},
      {"text": "了", "start": 36, "end": 37, "reading": "le"},
      {"text": "古代", "start": 37, "end": 39, "reading": "gǔdài"},
      {"text": "皇帝", "start": 39, "end": 41, "reading": "huángdì"},
      {"text": "的", "start": 41, "end": 42, "reading": "de"},
      {"text": "生活", "start": 42, "end": 44, "reading": "shēnghuó"},
      {"text": "。", "start": 44, "end": 45},
      {"text": "北京", "start": 45, "end": 47, "reading": "běijīng"},
      {"text": "烤鸭", "start": 47, "end": 49, "reading": "kǎoyā"},
      {"text": "是", "start": 49, "end": 50, "reading": "shì"},
      {"text": "当地", "start": 50, "end": 52, "reading": "dāngdì"},
      {"text": "的", "start": 52, "end": 53, "reading": "de"},
      {"text": "美食", "start": 53, "end": 55, "reading": "měishí"},
      {"text": "。", "start": 55, "end": 56},
      {"text": "游客", "start": 56, "end": 58, "reading": "yóukè"},
      {"text": "可以", "start": 58, "end": 60, "reading": "kěyǐ"},
      {"text": "体验", "start": 60, "end": 62, "reading": "tǐyàn"},
      {"text": "传统", "start": 62, "end": 64, "reading": "chuántǒng"},
      {"text": "文化", "start": 64, "end": 66, "reading": "wénhuà"},
      {"text": "和", "start": 66, "end": 67, "reading": "hé"},
      {"text": "现代", "start": 67, "end": 69, "reading": "xiàndài"},
      {"text": "生活", "start": 69, "end": 71, "reading": "shēnghuó"},
      {"text": "的", "start": 71, "end": 72, "reading": "de"},
      {"text": "结合", "start": 72, "end": 74, "reading": "jiéhé"},
      {"text": "。", "start": 74, "end": 75}
    ]
  }',
  48
);

-- Japanese advanced - Business & Work
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'advanced',
  'Business & Work',
  '日本の働き方改革',
  '近年、日本では働き方改革が進められています。長時間労働を減らし、ワークライフバランスを改善することが目標です。リモートワークの導入も増加しており、柔軟な働き方が可能になりました。しかし、伝統的な企業文化との調和が課題となっています。生産性を維持しながら、従業員の満足度を高める取り組みが求められています。',
  '{
    "words": [
      {"text": "近年", "start": 0, "end": 2, "reading": "きんねん"},
      {"text": "、", "start": 2, "end": 3},
      {"text": "日本", "start": 3, "end": 5, "reading": "にほん"},
      {"text": "で", "start": 5, "end": 6},
      {"text": "は", "start": 6, "end": 7},
      {"text": "働き方", "start": 7, "end": 10, "reading": "はたらきかた"},
      {"text": "改革", "start": 10, "end": 12, "reading": "かいかく"},
      {"text": "が", "start": 12, "end": 13},
      {"text": "進め", "start": 13, "end": 15, "reading": "すすめ"},
      {"text": "られ", "start": 15, "end": 17},
      {"text": "て", "start": 17, "end": 18},
      {"text": "い", "start": 18, "end": 19},
      {"text": "ます", "start": 19, "end": 21},
      {"text": "。", "start": 21, "end": 22},
      {"text": "長時間", "start": 22, "end": 25, "reading": "ちょうじかん"},
      {"text": "労働", "start": 25, "end": 27, "reading": "ろうどう"},
      {"text": "を", "start": 27, "end": 28},
      {"text": "減らし", "start": 28, "end": 31, "reading": "へらし"},
      {"text": "、", "start": 31, "end": 32},
      {"text": "ワークライフバランス", "start": 32, "end": 42},
      {"text": "を", "start": 42, "end": 43},
      {"text": "改善", "start": 43, "end": 45, "reading": "かいぜん"},
      {"text": "する", "start": 45, "end": 47},
      {"text": "こと", "start": 47, "end": 49},
      {"text": "が", "start": 49, "end": 50},
      {"text": "目標", "start": 50, "end": 52, "reading": "もくひょう"},
      {"text": "です", "start": 52, "end": 54},
      {"text": "。", "start": 54, "end": 55}
    ]
  }',
  87
);

-- Chinese advanced - Science & Nature
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'advanced',
  'Science & Nature',
  '气候变化的影响',
  '全球气候变化已经成为当今世界面临的重大挑战。温室气体排放导致地球温度上升，极端天气事件频繁发生。科学家们呼吁各国采取紧急措施，减少碳排放。可再生能源的发展对于应对气候危机至关重要。个人和企业都需要承担环境保护的责任，为子孙后代保护地球。',
  '{
    "words": [
      {"text": "全球", "start": 0, "end": 2, "reading": "quánqiú"},
      {"text": "气候", "start": 2, "end": 4, "reading": "qìhòu"},
      {"text": "变化", "start": 4, "end": 6, "reading": "biànhuà"},
      {"text": "已经", "start": 6, "end": 8, "reading": "yǐjīng"},
      {"text": "成为", "start": 8, "end": 10, "reading": "chéngwéi"},
      {"text": "当今", "start": 10, "end": 12, "reading": "dāngjīn"},
      {"text": "世界", "start": 12, "end": 14, "reading": "shìjiè"},
      {"text": "面临", "start": 14, "end": 16, "reading": "miànlín"},
      {"text": "的", "start": 16, "end": 17, "reading": "de"},
      {"text": "重大", "start": 17, "end": 19, "reading": "zhòngdà"},
      {"text": "挑战", "start": 19, "end": 21, "reading": "tiǎozhàn"},
      {"text": "。", "start": 21, "end": 22},
      {"text": "温室", "start": 22, "end": 24, "reading": "wēnshì"},
      {"text": "气体", "start": 24, "end": 26, "reading": "qìtǐ"},
      {"text": "排放", "start": 26, "end": 28, "reading": "páifàng"},
      {"text": "导致", "start": 28, "end": 30, "reading": "dǎozhì"},
      {"text": "地球", "start": 30, "end": 32, "reading": "dìqiú"},
      {"text": "温度", "start": 32, "end": 34, "reading": "wēndù"},
      {"text": "上升", "start": 34, "end": 36, "reading": "shàngshēng"},
      {"text": "，", "start": 36, "end": 37},
      {"text": "极端", "start": 37, "end": 39, "reading": "jíduān"},
      {"text": "天气", "start": 39, "end": 41, "reading": "tiānqì"},
      {"text": "事件", "start": 41, "end": 43, "reading": "shìjiàn"},
      {"text": "频繁", "start": 43, "end": 45, "reading": "pínfán"},
      {"text": "发生", "start": 45, "end": 47, "reading": "fāshēng"},
      {"text": "。", "start": 47, "end": 48}
    ]
  }',
  92
);

-- Japanese beginner - Entertainment & Hobbies
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'beginner',
  'Entertainment & Hobbies',
  '音楽を聞く',
  '私は音楽が大好きです。毎日音楽を聞きます。ポップスやロックが好きです。ギターを練習しています。友達とバンドを作りたいです。週末にコンサートに行きます。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし"},
      {"text": "は", "start": 1, "end": 2},
      {"text": "音楽", "start": 2, "end": 4, "reading": "おんがく"},
      {"text": "が", "start": 4, "end": 5},
      {"text": "大好き", "start": 5, "end": 8, "reading": "だいすき"},
      {"text": "です", "start": 8, "end": 10},
      {"text": "。", "start": 10, "end": 11},
      {"text": "毎日", "start": 11, "end": 13, "reading": "まいにち"},
      {"text": "音楽", "start": 13, "end": 15, "reading": "おんがく"},
      {"text": "を", "start": 15, "end": 16},
      {"text": "聞き", "start": 16, "end": 18, "reading": "きき"},
      {"text": "ます", "start": 18, "end": 20},
      {"text": "。", "start": 20, "end": 21},
      {"text": "ポップス", "start": 21, "end": 25},
      {"text": "や", "start": 25, "end": 26},
      {"text": "ロック", "start": 26, "end": 29},
      {"text": "が", "start": 29, "end": 30},
      {"text": "好き", "start": 30, "end": 32, "reading": "すき"},
      {"text": "です", "start": 32, "end": 34},
      {"text": "。", "start": 34, "end": 35},
      {"text": "ギター", "start": 35, "end": 38},
      {"text": "を", "start": 38, "end": 39},
      {"text": "練習", "start": 39, "end": 41, "reading": "れんしゅう"},
      {"text": "し", "start": 41, "end": 42},
      {"text": "て", "start": 42, "end": 43},
      {"text": "い", "start": 43, "end": 44},
      {"text": "ます", "start": 44, "end": 46},
      {"text": "。", "start": 46, "end": 47},
      {"text": "友達", "start": 47, "end": 49, "reading": "ともだち"},
      {"text": "と", "start": 49, "end": 50},
      {"text": "バンド", "start": 50, "end": 53},
      {"text": "を", "start": 53, "end": 54},
      {"text": "作り", "start": 54, "end": 56, "reading": "つくり"},
      {"text": "たい", "start": 56, "end": 58},
      {"text": "です", "start": 58, "end": 60},
      {"text": "。", "start": 60, "end": 61},
      {"text": "週末", "start": 61, "end": 63, "reading": "しゅうまつ"},
      {"text": "に", "start": 63, "end": 64},
      {"text": "コンサート", "start": 64, "end": 69},
      {"text": "に", "start": 69, "end": 70},
      {"text": "行き", "start": 70, "end": 72, "reading": "いき"},
      {"text": "ます", "start": 72, "end": 74},
      {"text": "。", "start": 74, "end": 75}
    ]
  }',
  43
);

-- Chinese beginner - Sports & Fitness
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'beginner',
  'Sports & Fitness',
  '运动很重要',
  '运动对身体健康很重要。我每周去健身房三次。我喜欢跑步和游泳。运动让我感觉很好。我的朋友也喜欢运动。我们一起打篮球。',
  '{
    "words": [
      {"text": "运动", "start": 0, "end": 2, "reading": "yùndòng"},
      {"text": "对", "start": 2, "end": 3, "reading": "duì"},
      {"text": "身体", "start": 3, "end": 5, "reading": "shēntǐ"},
      {"text": "健康", "start": 5, "end": 7, "reading": "jiànkāng"},
      {"text": "很", "start": 7, "end": 8, "reading": "hěn"},
      {"text": "重要", "start": 8, "end": 10, "reading": "zhòngyào"},
      {"text": "。", "start": 10, "end": 11},
      {"text": "我", "start": 11, "end": 12, "reading": "wǒ"},
      {"text": "每周", "start": 12, "end": 14, "reading": "měizhōu"},
      {"text": "去", "start": 14, "end": 15, "reading": "qù"},
      {"text": "健身房", "start": 15, "end": 18, "reading": "jiànshēnfáng"},
      {"text": "三", "start": 18, "end": 19, "reading": "sān"},
      {"text": "次", "start": 19, "end": 20, "reading": "cì"},
      {"text": "。", "start": 20, "end": 21},
      {"text": "我", "start": 21, "end": 22, "reading": "wǒ"},
      {"text": "喜欢", "start": 22, "end": 24, "reading": "xǐhuan"},
      {"text": "跑步", "start": 24, "end": 26, "reading": "pǎobù"},
      {"text": "和", "start": 26, "end": 27, "reading": "hé"},
      {"text": "游泳", "start": 27, "end": 29, "reading": "yóuyǒng"},
      {"text": "。", "start": 29, "end": 30},
      {"text": "运动", "start": 30, "end": 32, "reading": "yùndòng"},
      {"text": "让", "start": 32, "end": 33, "reading": "ràng"},
      {"text": "我", "start": 33, "end": 34, "reading": "wǒ"},
      {"text": "感觉", "start": 34, "end": 36, "reading": "gǎnjué"},
      {"text": "很", "start": 36, "end": 37, "reading": "hěn"},
      {"text": "好", "start": 37, "end": 38, "reading": "hǎo"},
      {"text": "。", "start": 38, "end": 39},
      {"text": "我", "start": 39, "end": 40, "reading": "wǒ"},
      {"text": "的", "start": 40, "end": 41, "reading": "de"},
      {"text": "朋友", "start": 41, "end": 43, "reading": "péngyou"},
      {"text": "也", "start": 43, "end": 44, "reading": "yě"},
      {"text": "喜欢", "start": 44, "end": 46, "reading": "xǐhuan"},
      {"text": "运动", "start": 46, "end": 48, "reading": "yùndòng"},
      {"text": "。", "start": 48, "end": 49},
      {"text": "我们", "start": 49, "end": 51, "reading": "wǒmen"},
      {"text": "一起", "start": 51, "end": 53, "reading": "yìqǐ"},
      {"text": "打", "start": 53, "end": 54, "reading": "dǎ"},
      {"text": "篮球", "start": 54, "end": 56, "reading": "lánqiú"},
      {"text": "。", "start": 56, "end": 57}
    ]
  }',
  38
);

-- Japanese intermediate - Entertainment & Hobbies
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'intermediate',
  'Entertainment & Hobbies',
  'アニメと日本文化',
  '日本のアニメは世界中で人気があります。様々なジャンルがあり、子供から大人まで楽しめます。ストーリーが深く、キャラクターが魅力的です。最近は配信サービスで簡単に見られます。アニメを通じて日本語や日本文化を学ぶ人も増えています。',
  '{
    "words": [
      {"text": "日本", "start": 0, "end": 2, "reading": "にほん"},
      {"text": "の", "start": 2, "end": 3},
      {"text": "アニメ", "start": 3, "end": 6},
      {"text": "は", "start": 6, "end": 7},
      {"text": "世界中", "start": 7, "end": 10, "reading": "せかいじゅう"},
      {"text": "で", "start": 10, "end": 11},
      {"text": "人気", "start": 11, "end": 13, "reading": "にんき"},
      {"text": "が", "start": 13, "end": 14},
      {"text": "あり", "start": 14, "end": 16},
      {"text": "ます", "start": 16, "end": 18},
      {"text": "。", "start": 18, "end": 19},
      {"text": "様々", "start": 19, "end": 21, "reading": "さまざま"},
      {"text": "な", "start": 21, "end": 22},
      {"text": "ジャンル", "start": 22, "end": 26},
      {"text": "が", "start": 26, "end": 27},
      {"text": "あり", "start": 27, "end": 29},
      {"text": "、", "start": 29, "end": 30},
      {"text": "子供", "start": 30, "end": 32, "reading": "こども"},
      {"text": "から", "start": 32, "end": 34},
      {"text": "大人", "start": 34, "end": 36, "reading": "おとな"},
      {"text": "まで", "start": 36, "end": 38},
      {"text": "楽しめ", "start": 38, "end": 41, "reading": "たのしめ"},
      {"text": "ます", "start": 41, "end": 43},
      {"text": "。", "start": 43, "end": 44},
      {"text": "ストーリー", "start": 44, "end": 49},
      {"text": "が", "start": 49, "end": 50},
      {"text": "深く", "start": 50, "end": 52, "reading": "ふかく"},
      {"text": "、", "start": 52, "end": 53},
      {"text": "キャラクター", "start": 53, "end": 59},
      {"text": "が", "start": 59, "end": 60},
      {"text": "魅力的", "start": 60, "end": 63, "reading": "みりょくてき"},
      {"text": "です", "start": 63, "end": 65},
      {"text": "。", "start": 65, "end": 66}
    ]
  }',
  68
);

-- Chinese intermediate - Current Events
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'intermediate',
  'Current Events',
  '电子商务的发展',
  '近年来，电子商务在中国发展迅速。越来越多的人选择网上购物，方便快捷。移动支付让交易更加简单。许多传统商店也开设了网店。这改变了人们的消费习惯。但网络安全问题需要重视。',
  '{
    "words": [
      {"text": "近年来", "start": 0, "end": 3, "reading": "jìnniánlái"},
      {"text": "，", "start": 3, "end": 4},
      {"text": "电子", "start": 4, "end": 6, "reading": "diànzǐ"},
      {"text": "商务", "start": 6, "end": 8, "reading": "shāngwù"},
      {"text": "在", "start": 8, "end": 9, "reading": "zài"},
      {"text": "中国", "start": 9, "end": 11, "reading": "zhōngguó"},
      {"text": "发展", "start": 11, "end": 13, "reading": "fāzhǎn"},
      {"text": "迅速", "start": 13, "end": 15, "reading": "xùnsù"},
      {"text": "。", "start": 15, "end": 16},
      {"text": "越来越", "start": 16, "end": 19, "reading": "yuèláiyuè"},
      {"text": "多", "start": 19, "end": 20, "reading": "duō"},
      {"text": "的", "start": 20, "end": 21, "reading": "de"},
      {"text": "人", "start": 21, "end": 22, "reading": "rén"},
      {"text": "选择", "start": 22, "end": 24, "reading": "xuǎnzé"},
      {"text": "网上", "start": 24, "end": 26, "reading": "wǎngshàng"},
      {"text": "购物", "start": 26, "end": 28, "reading": "gòuwù"},
      {"text": "，", "start": 28, "end": 29},
      {"text": "方便", "start": 29, "end": 31, "reading": "fāngbiàn"},
      {"text": "快捷", "start": 31, "end": 33, "reading": "kuàijié"},
      {"text": "。", "start": 33, "end": 34},
      {"text": "移动", "start": 34, "end": 36, "reading": "yídòng"},
      {"text": "支付", "start": 36, "end": 38, "reading": "zhīfù"},
      {"text": "让", "start": 38, "end": 39, "reading": "ràng"},
      {"text": "交易", "start": 39, "end": 41, "reading": "jiāoyì"},
      {"text": "更加", "start": 41, "end": 43, "reading": "gèngjiā"},
      {"text": "简单", "start": 43, "end": 45, "reading": "jiǎndān"},
      {"text": "。", "start": 45, "end": 46}
    ]
  }',
  62
);

-- Japanese advanced - Arts & Literature
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'ja',
  'advanced',
  'Arts & Literature',
  '俳句の魅力',
  '俳句は日本の伝統的な詩の形式です。わずか十七音で自然や季節、人生の一瞬を表現します。松尾芭蕉や与謝蕪村など、多くの名俳人が優れた作品を残しました。シンプルさの中に深い意味が込められており、読む人によって解釈が異なります。現代でも多くの人が俳句を楽しみ、創作しています。',
  '{
    "words": [
      {"text": "俳句", "start": 0, "end": 2, "reading": "はいく"},
      {"text": "は", "start": 2, "end": 3},
      {"text": "日本", "start": 3, "end": 5, "reading": "にほん"},
      {"text": "の", "start": 5, "end": 6},
      {"text": "伝統的", "start": 6, "end": 9, "reading": "でんとうてき"},
      {"text": "な", "start": 9, "end": 10},
      {"text": "詩", "start": 10, "end": 11, "reading": "し"},
      {"text": "の", "start": 11, "end": 12},
      {"text": "形式", "start": 12, "end": 14, "reading": "けいしき"},
      {"text": "です", "start": 14, "end": 16},
      {"text": "。", "start": 16, "end": 17},
      {"text": "わずか", "start": 17, "end": 20},
      {"text": "十七", "start": 20, "end": 22, "reading": "じゅうしち"},
      {"text": "音", "start": 22, "end": 23, "reading": "おん"},
      {"text": "で", "start": 23, "end": 24},
      {"text": "自然", "start": 24, "end": 26, "reading": "しぜん"},
      {"text": "や", "start": 26, "end": 27},
      {"text": "季節", "start": 27, "end": 29, "reading": "きせつ"},
      {"text": "、", "start": 29, "end": 30},
      {"text": "人生", "start": 30, "end": 32, "reading": "じんせい"},
      {"text": "の", "start": 32, "end": 33},
      {"text": "一瞬", "start": 33, "end": 35, "reading": "いっしゅん"},
      {"text": "を", "start": 35, "end": 36},
      {"text": "表現", "start": 36, "end": 38, "reading": "ひょうげん"},
      {"text": "し", "start": 38, "end": 39},
      {"text": "ます", "start": 39, "end": 41},
      {"text": "。", "start": 41, "end": 42}
    ]
  }',
  96
);

-- Chinese advanced - Business & Work
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count) VALUES
(
  'zh',
  'advanced',
  'Business & Work',
  '创业精神与创新',
  '在快速发展的经济环境中，创业精神和创新能力至关重要。成功的企业家需要具备敏锐的市场洞察力和冒险精神。他们不仅要识别商机，还要能够整合资源，建立高效的团队。失败是创业过程中不可避免的，但从中吸取教训才是成长的关键。持续学习和适应变化的能力决定了企业的长远发展。',
  '{
    "words": [
      {"text": "在", "start": 0, "end": 1, "reading": "zài"},
      {"text": "快速", "start": 1, "end": 3, "reading": "kuàisù"},
      {"text": "发展", "start": 3, "end": 5, "reading": "fāzhǎn"},
      {"text": "的", "start": 5, "end": 6, "reading": "de"},
      {"text": "经济", "start": 6, "end": 8, "reading": "jīngjì"},
      {"text": "环境", "start": 8, "end": 10, "reading": "huánjìng"},
      {"text": "中", "start": 10, "end": 11, "reading": "zhōng"},
      {"text": "，", "start": 11, "end": 12},
      {"text": "创业", "start": 12, "end": 14, "reading": "chuàngyè"},
      {"text": "精神", "start": 14, "end": 16, "reading": "jīngshén"},
      {"text": "和", "start": 16, "end": 17, "reading": "hé"},
      {"text": "创新", "start": 17, "end": 19, "reading": "chuàngxīn"},
      {"text": "能力", "start": 19, "end": 21, "reading": "nénglì"},
      {"text": "至关重要", "start": 21, "end": 25, "reading": "zhìguānzhòngyào"},
      {"text": "。", "start": 25, "end": 26},
      {"text": "成功", "start": 26, "end": 28, "reading": "chénggōng"},
      {"text": "的", "start": 28, "end": 29, "reading": "de"},
      {"text": "企业家", "start": 29, "end": 32, "reading": "qǐyèjiā"},
      {"text": "需要", "start": 32, "end": 34, "reading": "xūyào"},
      {"text": "具备", "start": 34, "end": 36, "reading": "jùbèi"},
      {"text": "敏锐", "start": 36, "end": 38, "reading": "mǐnruì"},
      {"text": "的", "start": 38, "end": 39, "reading": "de"},
      {"text": "市场", "start": 39, "end": 41, "reading": "shìchǎng"},
      {"text": "洞察力", "start": 41, "end": 44, "reading": "dòngchálì"},
      {"text": "和", "start": 44, "end": 45, "reading": "hé"},
      {"text": "冒险", "start": 45, "end": 47, "reading": "màoxiǎn"},
      {"text": "精神", "start": 47, "end": 49, "reading": "jīngshén"},
      {"text": "。", "start": 49, "end": 50}
    ]
  }',
  105
);
