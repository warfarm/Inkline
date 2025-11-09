-- Sample article data for testing

-- Delete existing articles before inserting new ones
DELETE FROM articles;

-- Japanese beginner article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'beginner',
  'Daily Life',
  '私の一日',
  '私は学生です。毎日学校に行きます。朝ごはんを食べます。友達と話します。日本語を勉強します。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし", "kanji": ["私"]},
      {"text": "は", "start": 1, "end": 2, "kanji": []},
      {"text": "学生", "start": 2, "end": 4, "reading": "がくせい", "kanji": ["学", "生"]},
      {"text": "です", "start": 4, "end": 6, "kanji": []},
      {"text": "。", "start": 6, "end": 7, "kanji": []},
      {"text": "毎日", "start": 7, "end": 9, "reading": "まいにち", "kanji": ["毎", "日"]},
      {"text": "学校", "start": 9, "end": 11, "reading": "がっこう", "kanji": ["学", "校"]},
      {"text": "に", "start": 11, "end": 12, "kanji": []},
      {"text": "行き", "start": 12, "end": 14, "reading": "いき", "kanji": ["行"]},
      {"text": "ます", "start": 14, "end": 16, "kanji": []},
      {"text": "。", "start": 16, "end": 17, "kanji": []},
      {"text": "朝", "start": 17, "end": 18, "reading": "あさ", "kanji": ["朝"]},
      {"text": "ごはん", "start": 18, "end": 21, "kanji": []},
      {"text": "を", "start": 21, "end": 22, "kanji": []},
      {"text": "食べ", "start": 22, "end": 24, "reading": "たべ", "kanji": ["食"]},
      {"text": "ます", "start": 24, "end": 26, "kanji": []},
      {"text": "。", "start": 26, "end": 27, "kanji": []},
      {"text": "友達", "start": 27, "end": 29, "reading": "ともだち", "kanji": ["友", "達"]},
      {"text": "と", "start": 29, "end": 30, "kanji": []},
      {"text": "話し", "start": 30, "end": 32, "reading": "はなし", "kanji": ["話"]},
      {"text": "ます", "start": 32, "end": 34, "kanji": []},
      {"text": "。", "start": 34, "end": 35, "kanji": []},
      {"text": "日本語", "start": 35, "end": 38, "reading": "にほんご", "kanji": ["日", "本", "語"]},
      {"text": "を", "start": 38, "end": 39, "kanji": []},
      {"text": "勉強", "start": 39, "end": 41, "reading": "べんきょう", "kanji": ["勉", "強"]},
      {"text": "し", "start": 41, "end": 42, "kanji": []},
      {"text": "ます", "start": 42, "end": 44, "kanji": []},
      {"text": "。", "start": 44, "end": 45, "kanji": []}
    ]
  }',
  28,
  '[
    {"word": "学生", "reading": "がくせい", "definition": "student", "example": "私は学生です。"},
    {"word": "毎日", "reading": "まいにち", "definition": "every day", "example": "毎日学校に行きます。"},
    {"word": "学校", "reading": "がっこう", "definition": "school", "example": "毎日学校に行きます。"},
    {"word": "朝ごはん", "reading": "あさごはん", "definition": "breakfast", "example": "朝ごはんを食べます。"},
    {"word": "友達", "reading": "ともだち", "definition": "friend", "example": "友達と話します。"},
    {"word": "日本語", "reading": "にほんご", "definition": "Japanese language", "example": "日本語を勉強します。"}
  ]',
  '[
    {"structure": "は...です", "explanation": "Topic marker + copula for stating facts", "example": "私は学生です。"},
    {"structure": "に行きます", "explanation": "Movement toward a location", "example": "学校に行きます。"},
    {"structure": "を + verb", "explanation": "Object marker indicating direct object", "example": "ごはんを食べます。"}
  ]'
);

-- Chinese beginner article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'beginner',
  'Daily Life',
  '我的一天',
  '我是学生。我每天去学校。我吃早饭。我和朋友说话。我学习中文。',
  '{
    "words": [
      {"text": "我", "start": 0, "end": 1, "reading": "wǒ", "kanji": []},
      {"text": "是", "start": 1, "end": 2, "reading": "shì", "kanji": []},
      {"text": "学生", "start": 2, "end": 4, "reading": "xuésheng", "kanji": []},
      {"text": "。", "start": 4, "end": 5, "kanji": []},
      {"text": "我", "start": 5, "end": 6, "reading": "wǒ", "kanji": []},
      {"text": "每天", "start": 6, "end": 8, "reading": "měitiān", "kanji": []},
      {"text": "去", "start": 8, "end": 9, "reading": "qù", "kanji": []},
      {"text": "学校", "start": 9, "end": 11, "reading": "xuéxiào", "kanji": []},
      {"text": "。", "start": 11, "end": 12, "kanji": []},
      {"text": "我", "start": 12, "end": 13, "reading": "wǒ", "kanji": []},
      {"text": "吃", "start": 13, "end": 14, "reading": "chī", "kanji": []},
      {"text": "早饭", "start": 14, "end": 16, "reading": "zǎofàn", "kanji": []},
      {"text": "。", "start": 16, "end": 17, "kanji": []},
      {"text": "我", "start": 17, "end": 18, "reading": "wǒ", "kanji": []},
      {"text": "和", "start": 18, "end": 19, "reading": "hé", "kanji": []},
      {"text": "朋友", "start": 19, "end": 21, "reading": "péngyou", "kanji": []},
      {"text": "说话", "start": 21, "end": 23, "reading": "shuōhuà", "kanji": []},
      {"text": "。", "start": 23, "end": 24, "kanji": []},
      {"text": "我", "start": 24, "end": 25, "reading": "wǒ", "kanji": []},
      {"text": "学习", "start": 25, "end": 27, "reading": "xuéxí", "kanji": []},
      {"text": "中文", "start": 27, "end": 29, "reading": "zhōngwén", "kanji": []},
      {"text": "。", "start": 29, "end": 30, "kanji": []}
    ]
  }',
  22,
  '[
    {"word": "学生", "reading": "xuésheng", "definition": "student", "example": "我是学生。"},
    {"word": "每天", "reading": "měitiān", "definition": "every day", "example": "我每天去学校。"},
    {"word": "学校", "reading": "xuéxiào", "definition": "school", "example": "我每天去学校。"},
    {"word": "早饭", "reading": "zǎofàn", "definition": "breakfast", "example": "我吃早饭。"},
    {"word": "朋友", "reading": "péngyou", "definition": "friend", "example": "我和朋友说话。"},
    {"word": "中文", "reading": "zhōngwén", "definition": "Chinese language", "example": "我学习中文。"}
  ]',
  '[
    {"structure": "是 + noun", "explanation": "Copula verb for identity", "example": "我是学生。"},
    {"structure": "去 + place", "explanation": "Go to a place", "example": "我每天去学校。"},
    {"structure": "和 + person", "explanation": "Together with someone", "example": "我和朋友说话。"}
  ]'
);

-- Japanese intermediate article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'intermediate',
  'Technology',
  'スマートフォンの使い方',
  'スマートフォンは現代社会で重要なツールです。メッセージを送ったり、写真を撮ったり、インターネットで情報を検索したりできます。多くの人が毎日使っています。最近では、様々なアプリケーションが開発されており、生活がより便利になりました。買い物や銀行の手続きもスマートフォンでできます。また、健康管理やフィットネスのアプリも人気があります。GPS機能を使って、道案内や地図の確認も簡単です。カメラの性能も向上し、プロ並みの写真が撮れます。SNSで友人や家族とつながることもできます。',
  '{
    "words": [
      {"text": "スマートフォン", "start": 0, "end": 8, "kanji": []},
      {"text": "は", "start": 8, "end": 9, "kanji": []},
      {"text": "現代", "start": 9, "end": 11, "reading": "げんだい", "kanji": ["現", "代"]},
      {"text": "社会", "start": 11, "end": 13, "reading": "しゃかい", "kanji": ["社", "会"]},
      {"text": "で", "start": 13, "end": 14, "kanji": []},
      {"text": "重要", "start": 14, "end": 16, "reading": "じゅうよう", "kanji": ["重", "要"]},
      {"text": "な", "start": 16, "end": 17, "kanji": []},
      {"text": "ツール", "start": 17, "end": 20, "kanji": []},
      {"text": "です", "start": 20, "end": 22, "kanji": []},
      {"text": "。", "start": 22, "end": 23, "kanji": []}
    ]
  }',
  104,
  '[
    {"word": "スマートフォン", "reading": "すまーとふぉん", "definition": "smartphone", "example": "スマートフォンは現代社会で重要なツールです。"},
    {"word": "現代社会", "reading": "げんだいしゃかい", "definition": "modern society", "example": "現代社会で重要なツールです。"},
    {"word": "アプリケーション", "reading": "あぷりけーしょん", "definition": "application", "example": "様々なアプリケーションが開発されており。"},
    {"word": "検索", "reading": "けんさく", "definition": "search", "example": "インターネットで情報を検索したりできます。"},
    {"word": "手続き", "reading": "てつづき", "definition": "procedure", "example": "銀行の手続きもスマートフォンでできます。"},
    {"word": "健康管理", "reading": "けんこうかんり", "definition": "health management", "example": "健康管理やフィットネスのアプリも人気があります。"},
    {"word": "性能", "reading": "せいのう", "definition": "performance", "example": "カメラの性能も向上し。"}
  ]',
  '[
    {"structure": "〜たり〜たり", "explanation": "Lists multiple actions in an example manner", "example": "メッセージを送ったり、写真を撮ったりできます。"},
    {"structure": "〜ています", "explanation": "Progressive/continuous action or state", "example": "多くの人が毎日使っています。"},
    {"structure": "〜ことができます", "explanation": "Expresses ability or possibility", "example": "SNSで友人や家族とつながることもできます。"}
  ]'
);

-- Chinese intermediate article
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'intermediate',
  'Technology',
  '智能手机的使用',
  '智能手机是现代社会的重要工具。我们可以发送消息、拍照片、上网搜索信息。很多人每天都在使用它。现在有各种各样的应用程序，让生活更加方便。我们可以用手机购物、办理银行业务。健康和运动应用也很受欢迎。GPS导航功能让出行更轻松。手机相机的质量越来越好，可以拍出专业水平的照片。社交媒体让我们与朋友和家人保持联系。移动支付使交易变得简单快捷。',
  '{
    "words": [
      {"text": "智能", "start": 0, "end": 2, "reading": "zhìnéng", "kanji": []},
      {"text": "手机", "start": 2, "end": 4, "reading": "shǒujī", "kanji": []},
      {"text": "是", "start": 4, "end": 5, "reading": "shì", "kanji": []},
      {"text": "现代", "start": 5, "end": 7, "reading": "xiàndài", "kanji": []},
      {"text": "社会", "start": 7, "end": 9, "reading": "shèhuì", "kanji": []},
      {"text": "的", "start": 9, "end": 10, "reading": "de", "kanji": []},
      {"text": "重要", "start": 10, "end": 12, "reading": "zhòngyào", "kanji": []},
      {"text": "工具", "start": 12, "end": 14, "reading": "gōngjù", "kanji": []},
      {"text": "。", "start": 14, "end": 15, "kanji": []}
    ]
  }',
  94,
  '[
    {"word": "智能手机", "reading": "zhìnéng shǒujī", "definition": "smartphone", "example": "智能手机是现代社会的重要工具。"},
    {"word": "应用程序", "reading": "yìngyòng chéngxù", "definition": "application program", "example": "现在有各种各样的应用程序。"},
    {"word": "搜索", "reading": "sōusuǒ", "definition": "to search", "example": "我们可以上网搜索信息。"},
    {"word": "导航", "reading": "dǎoháng", "definition": "navigation", "example": "GPS导航功能让出行更轻松。"},
    {"word": "社交媒体", "reading": "shèjiāo méitǐ", "definition": "social media", "example": "社交媒体让我们与朋友和家人保持联系。"},
    {"word": "移动支付", "reading": "yídòng zhīfù", "definition": "mobile payment", "example": "移动支付使交易变得简单快捷。"}
  ]',
  '[
    {"structure": "可以 + verb", "explanation": "Expresses ability or permission", "example": "我们可以发送消息、拍照片。"},
    {"structure": "让 + object + verb", "explanation": "Causative structure meaning to make/let someone do something", "example": "让生活更加方便。"},
    {"structure": "越来越 + adjective", "explanation": "Expresses increasing degree", "example": "手机相机的质量越来越好。"}
  ]'
);

-- Japanese beginner - Food & Cooking
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'beginner',
  'Food & Cooking',
  'すしを食べる',
  '私はすしが好きです。すしは日本の食べ物です。魚と米で作ります。とてもおいしいです。レストランで食べます。友達も好きです。一緒に食べます。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし", "kanji": ["私"]},
      {"text": "は", "start": 1, "end": 2, "kanji": []},
      {"text": "すし", "start": 2, "end": 4, "kanji": []},
      {"text": "が", "start": 4, "end": 5, "kanji": []},
      {"text": "好き", "start": 5, "end": 7, "reading": "すき", "kanji": ["好"]},
      {"text": "です", "start": 7, "end": 9, "kanji": []},
      {"text": "。", "start": 9, "end": 10, "kanji": []},
      {"text": "すし", "start": 10, "end": 12, "kanji": []},
      {"text": "は", "start": 12, "end": 13, "kanji": []},
      {"text": "日本", "start": 13, "end": 15, "reading": "にほん", "kanji": ["日", "本"]},
      {"text": "の", "start": 15, "end": 16, "kanji": []},
      {"text": "食べ物", "start": 16, "end": 19, "reading": "たべもの", "kanji": ["食", "物"]},
      {"text": "です", "start": 19, "end": 21, "kanji": []},
      {"text": "。", "start": 21, "end": 22, "kanji": []},
      {"text": "魚", "start": 22, "end": 23, "reading": "さかな", "kanji": ["魚"]},
      {"text": "と", "start": 23, "end": 24, "kanji": []},
      {"text": "米", "start": 24, "end": 25, "reading": "こめ", "kanji": ["米"]},
      {"text": "で", "start": 25, "end": 26, "kanji": []},
      {"text": "作り", "start": 26, "end": 28, "reading": "つくり", "kanji": ["作"]},
      {"text": "ます", "start": 28, "end": 30, "kanji": []},
      {"text": "。", "start": 30, "end": 31, "kanji": []},
      {"text": "とても", "start": 31, "end": 34, "kanji": []},
      {"text": "おいしい", "start": 34, "end": 38, "kanji": []},
      {"text": "です", "start": 38, "end": 40, "kanji": []},
      {"text": "。", "start": 40, "end": 41, "kanji": []},
      {"text": "レストラン", "start": 41, "end": 46, "kanji": []},
      {"text": "で", "start": 46, "end": 47, "kanji": []},
      {"text": "食べ", "start": 47, "end": 49, "reading": "たべ", "kanji": ["食"]},
      {"text": "ます", "start": 49, "end": 51, "kanji": []},
      {"text": "。", "start": 51, "end": 52, "kanji": []},
      {"text": "友達", "start": 52, "end": 54, "reading": "ともだち", "kanji": ["友", "達"]},
      {"text": "も", "start": 54, "end": 55, "kanji": []},
      {"text": "好き", "start": 55, "end": 57, "reading": "すき", "kanji": ["好"]},
      {"text": "です", "start": 57, "end": 59, "kanji": []},
      {"text": "。", "start": 59, "end": 60, "kanji": []},
      {"text": "一緒に", "start": 60, "end": 63, "reading": "いっしょに", "kanji": ["一", "緒"]},
      {"text": "食べ", "start": 63, "end": 65, "reading": "たべ", "kanji": ["食"]},
      {"text": "ます", "start": 65, "end": 67, "kanji": []},
      {"text": "。", "start": 67, "end": 68, "kanji": []}
    ]
  }',
  38,
  '[
    {"word": "すし", "reading": "すし", "definition": "sushi", "example": "すしは日本の食べ物です。"},
    {"word": "食べ物", "reading": "たべもの", "definition": "food", "example": "すしは日本の食べ物です。"},
    {"word": "魚", "reading": "さかな", "definition": "fish", "example": "魚と米で作ります。"},
    {"word": "米", "reading": "こめ", "definition": "rice", "example": "魚と米で作ります。"},
    {"word": "作る", "reading": "つくる", "definition": "to make", "example": "魚と米で作ります。"},
    {"word": "友達", "reading": "ともだち", "definition": "friend", "example": "友達も好きです。"},
    {"word": "一緒に", "reading": "いっしょに", "definition": "together", "example": "一緒に食べます。"}
  ]',
  '[
    {"structure": "が好きです", "explanation": "Expresses liking something", "example": "私はすしが好きです。"},
    {"structure": "で + verb", "explanation": "Particle indicating means or location of action", "example": "魚と米で作ります。"},
    {"structure": "も", "explanation": "Particle meaning also/too", "example": "友達も好きです。"}
  ]'
);

-- Chinese beginner - Food & Cooking
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'beginner',
  'Food & Cooking',
  '做饭',
  '我喜欢做饭。我会做中国菜。我用米、菜和肉。做饭很有趣。我常常给家人做饭。他们都很喜欢吃。',
  '{
    "words": [
      {"text": "我", "start": 0, "end": 1, "reading": "wǒ", "kanji": []},
      {"text": "喜欢", "start": 1, "end": 3, "reading": "xǐhuan", "kanji": []},
      {"text": "做饭", "start": 3, "end": 5, "reading": "zuòfàn", "kanji": []},
      {"text": "。", "start": 5, "end": 6, "kanji": []},
      {"text": "我", "start": 6, "end": 7, "reading": "wǒ", "kanji": []},
      {"text": "会", "start": 7, "end": 8, "reading": "huì", "kanji": []},
      {"text": "做", "start": 8, "end": 9, "reading": "zuò", "kanji": []},
      {"text": "中国", "start": 9, "end": 11, "reading": "zhōngguó", "kanji": []},
      {"text": "菜", "start": 11, "end": 12, "reading": "cài", "kanji": []},
      {"text": "。", "start": 12, "end": 13, "kanji": []},
      {"text": "我", "start": 13, "end": 14, "reading": "wǒ", "kanji": []},
      {"text": "用", "start": 14, "end": 15, "reading": "yòng", "kanji": []},
      {"text": "米", "start": 15, "end": 16, "reading": "mǐ", "kanji": []},
      {"text": "、", "start": 16, "end": 17, "kanji": []},
      {"text": "菜", "start": 17, "end": 18, "reading": "cài", "kanji": []},
      {"text": "和", "start": 18, "end": 19, "reading": "hé", "kanji": []},
      {"text": "肉", "start": 19, "end": 20, "reading": "ròu", "kanji": []},
      {"text": "。", "start": 20, "end": 21, "kanji": []},
      {"text": "做饭", "start": 21, "end": 23, "reading": "zuòfàn", "kanji": []},
      {"text": "很", "start": 23, "end": 24, "reading": "hěn", "kanji": []},
      {"text": "有趣", "start": 24, "end": 26, "reading": "yǒuqù", "kanji": []},
      {"text": "。", "start": 26, "end": 27, "kanji": []},
      {"text": "我", "start": 27, "end": 28, "reading": "wǒ", "kanji": []},
      {"text": "常常", "start": 28, "end": 30, "reading": "chángcháng", "kanji": []},
      {"text": "给", "start": 30, "end": 31, "reading": "gěi", "kanji": []},
      {"text": "家人", "start": 31, "end": 33, "reading": "jiārén", "kanji": []},
      {"text": "做饭", "start": 33, "end": 35, "reading": "zuòfàn", "kanji": []},
      {"text": "。", "start": 35, "end": 36, "kanji": []},
      {"text": "他们", "start": 36, "end": 38, "reading": "tāmen", "kanji": []},
      {"text": "都", "start": 38, "end": 39, "reading": "dōu", "kanji": []},
      {"text": "很", "start": 39, "end": 40, "reading": "hěn", "kanji": []},
      {"text": "喜欢", "start": 40, "end": 42, "reading": "xǐhuan", "kanji": []},
      {"text": "吃", "start": 42, "end": 43, "reading": "chī", "kanji": []},
      {"text": "。", "start": 43, "end": 44, "kanji": []}
    ]
  }',
  34,
  '[
    {"word": "做饭", "reading": "zuòfàn", "definition": "to cook", "example": "我喜欢做饭。"},
    {"word": "中国菜", "reading": "zhōngguó cài", "definition": "Chinese food", "example": "我会做中国菜。"},
    {"word": "米", "reading": "mǐ", "definition": "rice", "example": "我用米、菜和肉。"},
    {"word": "肉", "reading": "ròu", "definition": "meat", "example": "我用米、菜和肉。"},
    {"word": "有趣", "reading": "yǒuqù", "definition": "interesting", "example": "做饭很有趣。"},
    {"word": "家人", "reading": "jiārén", "definition": "family members", "example": "我常常给家人做饭。"}
  ]',
  '[
    {"structure": "喜欢 + verb", "explanation": "Expresses liking to do something", "example": "我喜欢做饭。"},
    {"structure": "会 + verb", "explanation": "Expresses ability or knowing how to do something", "example": "我会做中国菜。"},
    {"structure": "给 + person + verb", "explanation": "Do something for someone", "example": "我常常给家人做饭。"}
  ]'
);

-- Japanese intermediate - Culture & Travel
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'intermediate',
  'Culture & Travel',
  '京都の観光',
  '京都は日本の古い都市です。たくさんのお寺や神社があります。春には桜が咲いて、とてもきれいです。秋の紅葉も有名です。観光客が世界中から来ます。伝統的な文化を体験できます。金閣寺や清水寺は特に人気のある観光地です。祇園では舞妓さんを見ることができます。嵐山の竹林は静かで美しい場所です。京料理も素晴らしく、懐石料理やおばんざいが楽しめます。着物をレンタルして街を歩く観光客も多いです。京都駅周辺には現代的なショッピングセンターもあります。',
  '{
    "words": [
      {"text": "京都", "start": 0, "end": 2, "reading": "きょうと", "kanji": ["京", "都"]},
      {"text": "は", "start": 2, "end": 3, "kanji": []},
      {"text": "日本", "start": 3, "end": 5, "reading": "にほん", "kanji": ["日", "本"]},
      {"text": "の", "start": 5, "end": 6, "kanji": []},
      {"text": "古い", "start": 6, "end": 8, "reading": "ふるい", "kanji": ["古"]},
      {"text": "都市", "start": 8, "end": 10, "reading": "とし", "kanji": ["都", "市"]},
      {"text": "です", "start": 10, "end": 12, "kanji": []},
      {"text": "。", "start": 12, "end": 13, "kanji": []},
      {"text": "たくさん", "start": 13, "end": 17, "kanji": []},
      {"text": "の", "start": 17, "end": 18, "kanji": []},
      {"text": "お寺", "start": 18, "end": 20, "reading": "おてら", "kanji": ["寺"]},
      {"text": "や", "start": 20, "end": 21, "kanji": []},
      {"text": "神社", "start": 21, "end": 23, "reading": "じんじゃ", "kanji": ["神", "社"]},
      {"text": "が", "start": 23, "end": 24, "kanji": []},
      {"text": "あり", "start": 24, "end": 26, "kanji": []},
      {"text": "ます", "start": 26, "end": 28, "kanji": []},
      {"text": "。", "start": 28, "end": 29, "kanji": []},
      {"text": "春", "start": 29, "end": 30, "reading": "はる", "kanji": ["春"]},
      {"text": "に", "start": 30, "end": 31, "kanji": []},
      {"text": "は", "start": 31, "end": 32, "kanji": []},
      {"text": "桜", "start": 32, "end": 33, "reading": "さくら", "kanji": ["桜"]},
      {"text": "が", "start": 33, "end": 34, "kanji": []},
      {"text": "咲い", "start": 34, "end": 36, "reading": "さい", "kanji": ["咲"]},
      {"text": "て", "start": 36, "end": 37, "kanji": []},
      {"text": "、", "start": 37, "end": 38, "kanji": []},
      {"text": "とても", "start": 38, "end": 41, "kanji": []},
      {"text": "きれい", "start": 41, "end": 44, "kanji": []},
      {"text": "です", "start": 44, "end": 46, "kanji": []},
      {"text": "。", "start": 46, "end": 47, "kanji": []},
      {"text": "秋", "start": 47, "end": 48, "reading": "あき", "kanji": ["秋"]},
      {"text": "の", "start": 48, "end": 49, "kanji": []},
      {"text": "紅葉", "start": 49, "end": 51, "reading": "こうよう", "kanji": ["紅", "葉"]},
      {"text": "も", "start": 51, "end": 52, "kanji": []},
      {"text": "有名", "start": 52, "end": 54, "reading": "ゆうめい", "kanji": ["有", "名"]},
      {"text": "です", "start": 54, "end": 56, "kanji": []},
      {"text": "。", "start": 56, "end": 57, "kanji": []},
      {"text": "観光客", "start": 57, "end": 60, "reading": "かんこうきゃく", "kanji": ["観", "光", "客"]},
      {"text": "が", "start": 60, "end": 61, "kanji": []},
      {"text": "世界中", "start": 61, "end": 64, "reading": "せかいじゅう", "kanji": ["世", "界", "中"]},
      {"text": "から", "start": 64, "end": 66, "kanji": []},
      {"text": "来", "start": 66, "end": 67, "reading": "き", "kanji": ["来"]},
      {"text": "ます", "start": 67, "end": 69, "kanji": []},
      {"text": "。", "start": 69, "end": 70, "kanji": []},
      {"text": "伝統的", "start": 70, "end": 73, "reading": "でんとうてき", "kanji": ["伝", "統", "的"]},
      {"text": "な", "start": 73, "end": 74, "kanji": []},
      {"text": "文化", "start": 74, "end": 76, "reading": "ぶんか", "kanji": ["文", "化"]},
      {"text": "を", "start": 76, "end": 77, "kanji": []},
      {"text": "体験", "start": 77, "end": 79, "reading": "たいけん", "kanji": ["体", "験"]},
      {"text": "でき", "start": 79, "end": 81, "kanji": []},
      {"text": "ます", "start": 81, "end": 83, "kanji": []},
      {"text": "。", "start": 83, "end": 84, "kanji": []}
    ]
  }',
  104,
  '[
    {"word": "観光", "reading": "かんこう", "definition": "sightseeing, tourism", "example": "京都は観光で有名です。"},
    {"word": "神社", "reading": "じんじゃ", "definition": "shrine", "example": "たくさんのお寺や神社があります。"},
    {"word": "桜", "reading": "さくら", "definition": "cherry blossom", "example": "春には桜が咲いて、とてもきれいです。"},
    {"word": "紅葉", "reading": "こうよう", "definition": "autumn leaves", "example": "秋の紅葉も有名です。"},
    {"word": "伝統的", "reading": "でんとうてき", "definition": "traditional", "example": "伝統的な文化を体験できます。"},
    {"word": "観光客", "reading": "かんこうきゃく", "definition": "tourist", "example": "観光客が世界中から来ます。"},
    {"word": "体験", "reading": "たいけん", "definition": "experience", "example": "伝統的な文化を体験できます。"}
  ]',
  '[
    {"structure": "〜や〜", "explanation": "Lists things as examples (and, or)", "example": "お寺や神社があります。"},
    {"structure": "〜て、〜", "explanation": "Connects clauses sequentially", "example": "桜が咲いて、とてもきれいです。"},
    {"structure": "〜ことができます", "explanation": "Expresses ability or possibility", "example": "舞妓さんを見ることができます。"}
  ]'
);

-- Chinese intermediate - Culture & Travel
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'intermediate',
  'Culture & Travel',
  '北京旅游',
  '北京是中国的首都，有很多著名的景点。长城是必看的地方，历史悠久。故宫展示了古代皇帝的生活。北京烤鸭是当地的美食。游客可以体验传统文化和现代生活的结合。天坛公园是祈祷丰收的地方，建筑非常壮观。颐和园的湖光山色让人流连忘返。798艺术区展示了现代艺术作品。胡同里可以感受老北京的生活气息。地铁系统很发达，出行很方便。',
  '{
    "words": [
      {"text": "北京", "start": 0, "end": 2, "reading": "běijīng", "kanji": []},
      {"text": "是", "start": 2, "end": 3, "reading": "shì", "kanji": []},
      {"text": "中国", "start": 3, "end": 5, "reading": "zhōngguó", "kanji": []},
      {"text": "的", "start": 5, "end": 6, "reading": "de", "kanji": []},
      {"text": "首都", "start": 6, "end": 8, "reading": "shǒudū", "kanji": []},
      {"text": "，", "start": 8, "end": 9, "kanji": []},
      {"text": "有", "start": 9, "end": 10, "reading": "yǒu", "kanji": []},
      {"text": "很多", "start": 10, "end": 12, "reading": "hěnduō", "kanji": []},
      {"text": "著名", "start": 12, "end": 14, "reading": "zhùmíng", "kanji": []},
      {"text": "的", "start": 14, "end": 15, "reading": "de", "kanji": []},
      {"text": "景点", "start": 15, "end": 17, "reading": "jǐngdiǎn", "kanji": []},
      {"text": "。", "start": 17, "end": 18, "kanji": []},
      {"text": "长城", "start": 18, "end": 20, "reading": "chángchéng", "kanji": []},
      {"text": "是", "start": 20, "end": 21, "reading": "shì", "kanji": []},
      {"text": "必看", "start": 21, "end": 23, "reading": "bìkàn", "kanji": []},
      {"text": "的", "start": 23, "end": 24, "reading": "de", "kanji": []},
      {"text": "地方", "start": 24, "end": 26, "reading": "dìfang", "kanji": []},
      {"text": "，", "start": 26, "end": 27, "kanji": []},
      {"text": "历史", "start": 27, "end": 29, "reading": "lìshǐ", "kanji": []},
      {"text": "悠久", "start": 29, "end": 31, "reading": "yōujiǔ", "kanji": []},
      {"text": "。", "start": 31, "end": 32, "kanji": []},
      {"text": "故宫", "start": 32, "end": 34, "reading": "gùgōng", "kanji": []},
      {"text": "展示", "start": 34, "end": 36, "reading": "zhǎnshì", "kanji": []},
      {"text": "了", "start": 36, "end": 37, "reading": "le", "kanji": []},
      {"text": "古代", "start": 37, "end": 39, "reading": "gǔdài", "kanji": []},
      {"text": "皇帝", "start": 39, "end": 41, "reading": "huángdì", "kanji": []},
      {"text": "的", "start": 41, "end": 42, "reading": "de", "kanji": []},
      {"text": "生活", "start": 42, "end": 44, "reading": "shēnghuó", "kanji": []},
      {"text": "。", "start": 44, "end": 45, "kanji": []},
      {"text": "北京", "start": 45, "end": 47, "reading": "běijīng", "kanji": []},
      {"text": "烤鸭", "start": 47, "end": 49, "reading": "kǎoyā", "kanji": []},
      {"text": "是", "start": 49, "end": 50, "reading": "shì", "kanji": []},
      {"text": "当地", "start": 50, "end": 52, "reading": "dāngdì", "kanji": []},
      {"text": "的", "start": 52, "end": 53, "reading": "de", "kanji": []},
      {"text": "美食", "start": 53, "end": 55, "reading": "měishí", "kanji": []},
      {"text": "。", "start": 55, "end": 56, "kanji": []},
      {"text": "游客", "start": 56, "end": 58, "reading": "yóukè", "kanji": []},
      {"text": "可以", "start": 58, "end": 60, "reading": "kěyǐ", "kanji": []},
      {"text": "体验", "start": 60, "end": 62, "reading": "tǐyàn", "kanji": []},
      {"text": "传统", "start": 62, "end": 64, "reading": "chuántǒng", "kanji": []},
      {"text": "文化", "start": 64, "end": 66, "reading": "wénhuà", "kanji": []},
      {"text": "和", "start": 66, "end": 67, "reading": "hé", "kanji": []},
      {"text": "现代", "start": 67, "end": 69, "reading": "xiàndài", "kanji": []},
      {"text": "生活", "start": 69, "end": 71, "reading": "shēnghuó", "kanji": []},
      {"text": "的", "start": 71, "end": 72, "reading": "de", "kanji": []},
      {"text": "结合", "start": 72, "end": 74, "reading": "jiéhé", "kanji": []},
      {"text": "。", "start": 74, "end": 75, "kanji": []}
    ]
  }',
  96,
  '[
    {"word": "景点", "reading": "jǐngdiǎn", "definition": "scenic spot, attraction", "example": "北京有很多著名的景点。"},
    {"word": "长城", "reading": "chángchéng", "definition": "the Great Wall", "example": "长城是必看的地方。"},
    {"word": "故宫", "reading": "gùgōng", "definition": "the Forbidden City", "example": "故宫展示了古代皇帝的生活。"},
    {"word": "美食", "reading": "měishí", "definition": "delicious food, cuisine", "example": "北京烤鸭是当地的美食。"},
    {"word": "游客", "reading": "yóukè", "definition": "tourist", "example": "游客可以体验传统文化。"},
    {"word": "体验", "reading": "tǐyàn", "definition": "to experience", "example": "游客可以体验传统文化。"},
    {"word": "传统", "reading": "chuántǒng", "definition": "tradition, traditional", "example": "游客可以体验传统文化。"}
  ]',
  '[
    {"structure": "是 + place/thing", "explanation": "Identifies or describes something", "example": "北京是中国的首都。"},
    {"structure": "可以 + verb", "explanation": "Expresses ability or permission", "example": "游客可以体验传统文化。"},
    {"structure": "的 + noun", "explanation": "Possessive or modifying particle", "example": "中国的首都。"}
  ]'
);

-- Japanese advanced - Business & Work
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'advanced',
  'Business & Work',
  '日本の働き方改革',
  '近年、日本では働き方改革が進められています。長時間労働を減らし、ワークライフバランスを改善することが目標です。リモートワークの導入も増加しており、柔軟な働き方が可能になりました。しかし、伝統的な企業文化との調和が課題となっています。生産性を維持しながら、従業員の満足度を高める取り組みが求められています。政府は労働時間の上限規制を設け、過労死を防ぐための施策を強化しています。企業側も従業員の健康管理に注力し、定期的な健康診断やメンタルヘルスケアを提供するようになりました。フレックスタイム制度や時短勤務の選択肢も広がっています。特に子育て中の社員にとって、こうした柔軟な働き方は重要です。在宅勤務の普及により、通勤時間が削減され、家族との時間が増えたという声も多く聞かれます。一方で、対面でのコミュニケーション不足や、仕事とプライベートの境界が曖昧になるといった新たな課題も浮上しています。デジタルツールの活用やオンライン会議の効率化が進められており、業務の生産性向上に貢献しています。しかし、中小企業ではリソース不足により、改革が遅れている場合もあります。働き方改革の成功には、経営層の理解と積極的な投資が不可欠です。今後は、多様な働き方を認め、個々の従業員のニーズに応じた制度設計が求められるでしょう。',
  '{
    "words": [
      {"text": "近年", "start": 0, "end": 2, "reading": "きんねん", "kanji": ["近", "年"]},
      {"text": "、", "start": 2, "end": 3, "kanji": []},
      {"text": "日本", "start": 3, "end": 5, "reading": "にほん", "kanji": ["日", "本"]},
      {"text": "で", "start": 5, "end": 6, "kanji": []},
      {"text": "は", "start": 6, "end": 7, "kanji": []},
      {"text": "働き方", "start": 7, "end": 10, "reading": "はたらきかた", "kanji": ["働", "方"]},
      {"text": "改革", "start": 10, "end": 12, "reading": "かいかく", "kanji": ["改", "革"]},
      {"text": "が", "start": 12, "end": 13, "kanji": []},
      {"text": "進め", "start": 13, "end": 15, "reading": "すすめ", "kanji": ["進"]},
      {"text": "られ", "start": 15, "end": 17, "kanji": []},
      {"text": "て", "start": 17, "end": 18, "kanji": []},
      {"text": "い", "start": 18, "end": 19, "kanji": []},
      {"text": "ます", "start": 19, "end": 21, "kanji": []},
      {"text": "。", "start": 21, "end": 22, "kanji": []},
      {"text": "長時間", "start": 22, "end": 25, "reading": "ちょうじかん", "kanji": ["長", "時", "間"]},
      {"text": "労働", "start": 25, "end": 27, "reading": "ろうどう", "kanji": ["労", "働"]},
      {"text": "を", "start": 27, "end": 28, "kanji": []},
      {"text": "減らし", "start": 28, "end": 31, "reading": "へらし", "kanji": ["減"]},
      {"text": "、", "start": 31, "end": 32, "kanji": []},
      {"text": "ワークライフバランス", "start": 32, "end": 42, "kanji": []},
      {"text": "を", "start": 42, "end": 43, "kanji": []},
      {"text": "改善", "start": 43, "end": 45, "reading": "かいぜん", "kanji": ["改", "善"]},
      {"text": "する", "start": 45, "end": 47, "kanji": []},
      {"text": "こと", "start": 47, "end": 49, "kanji": []},
      {"text": "が", "start": 49, "end": 50, "kanji": []},
      {"text": "目標", "start": 50, "end": 52, "reading": "もくひょう", "kanji": ["目", "標"]},
      {"text": "です", "start": 52, "end": 54, "kanji": []},
      {"text": "。", "start": 54, "end": 55, "kanji": []}
    ]
  }',
  348,
  '[
    {"word": "働き方改革", "reading": "はたらきかたかいかく", "definition": "work style reform", "example": "日本では働き方改革が進められています。"},
    {"word": "労働", "reading": "ろうどう", "definition": "labor, work", "example": "長時間労働を減らし。"},
    {"word": "改善", "reading": "かいぜん", "definition": "improvement", "example": "ワークライフバランスを改善すること。"},
    {"word": "柔軟", "reading": "じゅうなん", "definition": "flexible", "example": "柔軟な働き方が可能になりました。"},
    {"word": "課題", "reading": "かだい", "definition": "issue, challenge", "example": "伝統的な企業文化との調和が課題となっています。"},
    {"word": "生産性", "reading": "せいさんせい", "definition": "productivity", "example": "生産性を維持しながら。"},
    {"word": "従業員", "reading": "じゅうぎょういん", "definition": "employee", "example": "従業員の満足度を高める。"},
    {"word": "不可欠", "reading": "ふかけつ", "definition": "indispensable, essential", "example": "経営層の理解と積極的な投資が不可欠です。"}
  ]',
  '[
    {"structure": "〜られています", "explanation": "Passive progressive form indicating ongoing action", "example": "働き方改革が進められています。"},
    {"structure": "〜ながら", "explanation": "Expresses doing two things simultaneously", "example": "生産性を維持しながら、従業員の満足度を高める。"},
    {"structure": "〜により", "explanation": "Indicates means or cause", "example": "在宅勤務の普及により、通勤時間が削減され。"}
  ]'
);

-- Chinese advanced - Science & Nature
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'advanced',
  'Science & Nature',
  '气候变化的影响',
  '全球气候变化已经成为当今世界面临的重大挑战。温室气体排放导致地球温度上升，极端天气事件频繁发生。科学家们呼吁各国采取紧急措施，减少碳排放。可再生能源的发展对于应对气候危机至关重要。个人和企业都需要承担环境保护的责任，为子孙后代保护地球。近年来，全球平均气温持续上升，冰川融化速度加快，海平面不断上涨。这些变化威胁着沿海城市的安全，数百万人面临被迫迁移的风险。干旱、洪水、飓风等灾害的强度和频率都在增加，给农业生产和粮食安全带来严重影响。生物多样性也受到威胁，许多物种正面临灭绝的危险。为了应对这一全球性挑战，各国政府签署了《巴黎协定》，承诺限制温室气体排放。太阳能、风能等清洁能源技术正在快速发展，成本也在逐步降低。电动汽车的普及有助于减少交通领域的碳排放。碳捕获与储存技术也在不断改进，为工业减排提供了新的途径。然而，转型需要巨额投资和政策支持。发展中国家在经济发展和环境保护之间面临艰难选择。国际合作和技术转让对于全球共同应对气候变化至关重要。教育和公众意识的提高也是关键因素。每个人都可以通过改变生活方式，如减少能源消耗、选择绿色出行、减少食物浪费等，为保护地球做出贡献。',
  '{
    "words": [
      {"text": "全球", "start": 0, "end": 2, "reading": "quánqiú", "kanji": []},
      {"text": "气候", "start": 2, "end": 4, "reading": "qìhòu", "kanji": []},
      {"text": "变化", "start": 4, "end": 6, "reading": "biànhuà", "kanji": []},
      {"text": "已经", "start": 6, "end": 8, "reading": "yǐjīng", "kanji": []},
      {"text": "成为", "start": 8, "end": 10, "reading": "chéngwéi", "kanji": []},
      {"text": "当今", "start": 10, "end": 12, "reading": "dāngjīn", "kanji": []},
      {"text": "世界", "start": 12, "end": 14, "reading": "shìjiè", "kanji": []},
      {"text": "面临", "start": 14, "end": 16, "reading": "miànlín", "kanji": []},
      {"text": "的", "start": 16, "end": 17, "reading": "de", "kanji": []},
      {"text": "重大", "start": 17, "end": 19, "reading": "zhòngdà", "kanji": []},
      {"text": "挑战", "start": 19, "end": 21, "reading": "tiǎozhàn", "kanji": []},
      {"text": "。", "start": 21, "end": 22, "kanji": []},
      {"text": "温室", "start": 22, "end": 24, "reading": "wēnshì", "kanji": []},
      {"text": "气体", "start": 24, "end": 26, "reading": "qìtǐ", "kanji": []},
      {"text": "排放", "start": 26, "end": 28, "reading": "páifàng", "kanji": []},
      {"text": "导致", "start": 28, "end": 30, "reading": "dǎozhì", "kanji": []},
      {"text": "地球", "start": 30, "end": 32, "reading": "dìqiú", "kanji": []},
      {"text": "温度", "start": 32, "end": 34, "reading": "wēndù", "kanji": []},
      {"text": "上升", "start": 34, "end": 36, "reading": "shàngshēng", "kanji": []},
      {"text": "，", "start": 36, "end": 37, "kanji": []},
      {"text": "极端", "start": 37, "end": 39, "reading": "jíduān", "kanji": []},
      {"text": "天气", "start": 39, "end": 41, "reading": "tiānqì", "kanji": []},
      {"text": "事件", "start": 41, "end": 43, "reading": "shìjiàn", "kanji": []},
      {"text": "频繁", "start": 43, "end": 45, "reading": "pínfán", "kanji": []},
      {"text": "发生", "start": 45, "end": 47, "reading": "fāshēng", "kanji": []},
      {"text": "。", "start": 47, "end": 48, "kanji": []}
    ]
  }',
  368,
  '[
    {"word": "气候变化", "reading": "qìhòu biànhuà", "definition": "climate change", "example": "全球气候变化已经成为重大挑战。"},
    {"word": "温室气体", "reading": "wēnshì qìtǐ", "definition": "greenhouse gas", "example": "温室气体排放导致地球温度上升。"},
    {"word": "排放", "reading": "páifàng", "definition": "emission, discharge", "example": "温室气体排放导致地球温度上升。"},
    {"word": "可再生能源", "reading": "kězàishēng néngyuán", "definition": "renewable energy", "example": "可再生能源的发展对于应对气候危机至关重要。"},
    {"word": "至关重要", "reading": "zhìguānzhòngyào", "definition": "crucial, vital", "example": "可再生能源的发展对于应对气候危机至关重要。"},
    {"word": "生物多样性", "reading": "shēngwù duōyàngxìng", "definition": "biodiversity", "example": "生物多样性也受到威胁。"},
    {"word": "技术转让", "reading": "jìshù zhuǎnràng", "definition": "technology transfer", "example": "国际合作和技术转让对于全球共同应对气候变化至关重要。"}
  ]',
  '[
    {"structure": "已经 + verb", "explanation": "Indicates completed action", "example": "全球气候变化已经成为当今世界面临的重大挑战。"},
    {"structure": "导致 + result", "explanation": "Indicates cause and effect", "example": "温室气体排放导致地球温度上升。"},
    {"structure": "对于...至关重要", "explanation": "Expresses crucial importance for something", "example": "可再生能源的发展对于应对气候危机至关重要。"}
  ]'
);

-- Japanese beginner - Entertainment & Hobbies
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'beginner',
  'Entertainment & Hobbies',
  '音楽を聞く',
  '私は音楽が大好きです。毎日音楽を聞きます。ポップスやロックが好きです。ギターを練習しています。友達とバンドを作りたいです。週末にコンサートに行きます。',
  '{
    "words": [
      {"text": "私", "start": 0, "end": 1, "reading": "わたし", "kanji": ["私"]},
      {"text": "は", "start": 1, "end": 2, "kanji": []},
      {"text": "音楽", "start": 2, "end": 4, "reading": "おんがく", "kanji": ["音", "楽"]},
      {"text": "が", "start": 4, "end": 5, "kanji": []},
      {"text": "大好き", "start": 5, "end": 8, "reading": "だいすき", "kanji": ["大", "好"]},
      {"text": "です", "start": 8, "end": 10, "kanji": []},
      {"text": "。", "start": 10, "end": 11, "kanji": []},
      {"text": "毎日", "start": 11, "end": 13, "reading": "まいにち", "kanji": ["毎", "日"]},
      {"text": "音楽", "start": 13, "end": 15, "reading": "おんがく", "kanji": ["音", "楽"]},
      {"text": "を", "start": 15, "end": 16, "kanji": []},
      {"text": "聞き", "start": 16, "end": 18, "reading": "きき", "kanji": ["聞"]},
      {"text": "ます", "start": 18, "end": 20, "kanji": []},
      {"text": "。", "start": 20, "end": 21, "kanji": []},
      {"text": "ポップス", "start": 21, "end": 25, "kanji": []},
      {"text": "や", "start": 25, "end": 26, "kanji": []},
      {"text": "ロック", "start": 26, "end": 29, "kanji": []},
      {"text": "が", "start": 29, "end": 30, "kanji": []},
      {"text": "好き", "start": 30, "end": 32, "reading": "すき", "kanji": ["好"]},
      {"text": "です", "start": 32, "end": 34, "kanji": []},
      {"text": "。", "start": 34, "end": 35, "kanji": []},
      {"text": "ギター", "start": 35, "end": 38, "kanji": []},
      {"text": "を", "start": 38, "end": 39, "kanji": []},
      {"text": "練習", "start": 39, "end": 41, "reading": "れんしゅう", "kanji": ["練", "習"]},
      {"text": "し", "start": 41, "end": 42, "kanji": []},
      {"text": "て", "start": 42, "end": 43, "kanji": []},
      {"text": "い", "start": 43, "end": 44, "kanji": []},
      {"text": "ます", "start": 44, "end": 46, "kanji": []},
      {"text": "。", "start": 46, "end": 47, "kanji": []},
      {"text": "友達", "start": 47, "end": 49, "reading": "ともだち", "kanji": ["友", "達"]},
      {"text": "と", "start": 49, "end": 50, "kanji": []},
      {"text": "バンド", "start": 50, "end": 53, "kanji": []},
      {"text": "を", "start": 53, "end": 54, "kanji": []},
      {"text": "作り", "start": 54, "end": 56, "reading": "つくり", "kanji": ["作"]},
      {"text": "たい", "start": 56, "end": 58, "kanji": []},
      {"text": "です", "start": 58, "end": 60, "kanji": []},
      {"text": "。", "start": 60, "end": 61, "kanji": []},
      {"text": "週末", "start": 61, "end": 63, "reading": "しゅうまつ", "kanji": ["週", "末"]},
      {"text": "に", "start": 63, "end": 64, "kanji": []},
      {"text": "コンサート", "start": 64, "end": 69, "kanji": []},
      {"text": "に", "start": 69, "end": 70, "kanji": []},
      {"text": "行き", "start": 70, "end": 72, "reading": "いき", "kanji": ["行"]},
      {"text": "ます", "start": 72, "end": 74, "kanji": []},
      {"text": "。", "start": 74, "end": 75, "kanji": []}
    ]
  }',
  43,
  '[
    {"word": "音楽", "reading": "おんがく", "definition": "music", "example": "私は音楽が大好きです。"},
    {"word": "大好き", "reading": "だいすき", "definition": "love very much", "example": "私は音楽が大好きです。"},
    {"word": "聞く", "reading": "きく", "definition": "to listen", "example": "毎日音楽を聞きます。"},
    {"word": "練習", "reading": "れんしゅう", "definition": "practice", "example": "ギターを練習しています。"},
    {"word": "友達", "reading": "ともだち", "definition": "friend", "example": "友達とバンドを作りたいです。"},
    {"word": "週末", "reading": "しゅうまつ", "definition": "weekend", "example": "週末にコンサートに行きます。"}
  ]',
  '[
    {"structure": "が大好きです", "explanation": "Expresses loving something very much", "example": "私は音楽が大好きです。"},
    {"structure": "〜ています", "explanation": "Progressive/continuous action", "example": "ギターを練習しています。"},
    {"structure": "〜たいです", "explanation": "Expresses desire to do something", "example": "友達とバンドを作りたいです。"}
  ]'
);

-- Chinese beginner - Sports & Fitness
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'beginner',
  'Sports & Fitness',
  '运动很重要',
  '运动对身体健康很重要。我每周去健身房三次。我喜欢跑步和游泳。运动让我感觉很好。我的朋友也喜欢运动。我们一起打篮球。',
  '{
    "words": [
      {"text": "运动", "start": 0, "end": 2, "reading": "yùndòng", "kanji": []},
      {"text": "对", "start": 2, "end": 3, "reading": "duì", "kanji": []},
      {"text": "身体", "start": 3, "end": 5, "reading": "shēntǐ", "kanji": []},
      {"text": "健康", "start": 5, "end": 7, "reading": "jiànkāng", "kanji": []},
      {"text": "很", "start": 7, "end": 8, "reading": "hěn", "kanji": []},
      {"text": "重要", "start": 8, "end": 10, "reading": "zhòngyào", "kanji": []},
      {"text": "。", "start": 10, "end": 11, "kanji": []},
      {"text": "我", "start": 11, "end": 12, "reading": "wǒ", "kanji": []},
      {"text": "每周", "start": 12, "end": 14, "reading": "měizhōu", "kanji": []},
      {"text": "去", "start": 14, "end": 15, "reading": "qù", "kanji": []},
      {"text": "健身房", "start": 15, "end": 18, "reading": "jiànshēnfáng", "kanji": []},
      {"text": "三", "start": 18, "end": 19, "reading": "sān", "kanji": []},
      {"text": "次", "start": 19, "end": 20, "reading": "cì", "kanji": []},
      {"text": "。", "start": 20, "end": 21, "kanji": []},
      {"text": "我", "start": 21, "end": 22, "reading": "wǒ", "kanji": []},
      {"text": "喜欢", "start": 22, "end": 24, "reading": "xǐhuan", "kanji": []},
      {"text": "跑步", "start": 24, "end": 26, "reading": "pǎobù", "kanji": []},
      {"text": "和", "start": 26, "end": 27, "reading": "hé", "kanji": []},
      {"text": "游泳", "start": 27, "end": 29, "reading": "yóuyǒng", "kanji": []},
      {"text": "。", "start": 29, "end": 30, "kanji": []},
      {"text": "运动", "start": 30, "end": 32, "reading": "yùndòng", "kanji": []},
      {"text": "让", "start": 32, "end": 33, "reading": "ràng", "kanji": []},
      {"text": "我", "start": 33, "end": 34, "reading": "wǒ", "kanji": []},
      {"text": "感觉", "start": 34, "end": 36, "reading": "gǎnjué", "kanji": []},
      {"text": "很", "start": 36, "end": 37, "reading": "hěn", "kanji": []},
      {"text": "好", "start": 37, "end": 38, "reading": "hǎo", "kanji": []},
      {"text": "。", "start": 38, "end": 39, "kanji": []},
      {"text": "我", "start": 39, "end": 40, "reading": "wǒ", "kanji": []},
      {"text": "的", "start": 40, "end": 41, "reading": "de", "kanji": []},
      {"text": "朋友", "start": 41, "end": 43, "reading": "péngyou", "kanji": []},
      {"text": "也", "start": 43, "end": 44, "reading": "yě", "kanji": []},
      {"text": "喜欢", "start": 44, "end": 46, "reading": "xǐhuan", "kanji": []},
      {"text": "运动", "start": 46, "end": 48, "reading": "yùndòng", "kanji": []},
      {"text": "。", "start": 48, "end": 49, "kanji": []},
      {"text": "我们", "start": 49, "end": 51, "reading": "wǒmen", "kanji": []},
      {"text": "一起", "start": 51, "end": 53, "reading": "yìqǐ", "kanji": []},
      {"text": "打", "start": 53, "end": 54, "reading": "dǎ", "kanji": []},
      {"text": "篮球", "start": 54, "end": 56, "reading": "lánqiú", "kanji": []},
      {"text": "。", "start": 56, "end": 57, "kanji": []}
    ]
  }',
  38,
  '[
    {"word": "运动", "reading": "yùndòng", "definition": "exercise, sports", "example": "运动对身体健康很重要。"},
    {"word": "健康", "reading": "jiànkāng", "definition": "health", "example": "运动对身体健康很重要。"},
    {"word": "健身房", "reading": "jiànshēnfáng", "definition": "gym", "example": "我每周去健身房三次。"},
    {"word": "跑步", "reading": "pǎobù", "definition": "running", "example": "我喜欢跑步和游泳。"},
    {"word": "游泳", "reading": "yóuyǒng", "definition": "swimming", "example": "我喜欢跑步和游泳。"},
    {"word": "篮球", "reading": "lánqiú", "definition": "basketball", "example": "我们一起打篮球。"}
  ]',
  '[
    {"structure": "对...很重要", "explanation": "Expresses importance for something", "example": "运动对身体健康很重要。"},
    {"structure": "让 + person + verb", "explanation": "Causative structure - make/let someone do something", "example": "运动让我感觉很好。"},
    {"structure": "一起 + verb", "explanation": "To do something together", "example": "我们一起打篮球。"}
  ]'
);

-- Japanese intermediate - Entertainment & Hobbies
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'intermediate',
  'Entertainment & Hobbies',
  'アニメと日本文化',
  '日本のアニメは世界中で人気があります。様々なジャンルがあり、子供から大人まで楽しめます。ストーリーが深く、キャラクターが魅力的です。最近は配信サービスで簡単に見られます。アニメを通じて日本語や日本文化を学ぶ人も増えています。有名な作品には、ジブリ映画やナルト、ワンピースなどがあります。声優の演技も重要な要素で、ファンクラブもたくさんあります。コスプレイベントやアニメフェスティバルも人気です。漫画原作のアニメも多く、続編を楽しみにしている人がたくさんいます。日本のアニメ産業は経済的にも重要な役割を果たしています。',
  '{
    "words": [
      {"text": "日本", "start": 0, "end": 2, "reading": "にほん", "kanji": ["日", "本"]},
      {"text": "の", "start": 2, "end": 3, "kanji": []},
      {"text": "アニメ", "start": 3, "end": 6, "kanji": []},
      {"text": "は", "start": 6, "end": 7, "kanji": []},
      {"text": "世界中", "start": 7, "end": 10, "reading": "せかいじゅう", "kanji": ["世", "界", "中"]},
      {"text": "で", "start": 10, "end": 11, "kanji": []},
      {"text": "人気", "start": 11, "end": 13, "reading": "にんき", "kanji": ["人", "気"]},
      {"text": "が", "start": 13, "end": 14, "kanji": []},
      {"text": "あり", "start": 14, "end": 16, "kanji": []},
      {"text": "ます", "start": 16, "end": 18, "kanji": []},
      {"text": "。", "start": 18, "end": 19, "kanji": []},
      {"text": "様々", "start": 19, "end": 21, "reading": "さまざま", "kanji": ["様", "々"]},
      {"text": "な", "start": 21, "end": 22, "kanji": []},
      {"text": "ジャンル", "start": 22, "end": 26, "kanji": []},
      {"text": "が", "start": 26, "end": 27, "kanji": []},
      {"text": "あり", "start": 27, "end": 29, "kanji": []},
      {"text": "、", "start": 29, "end": 30, "kanji": []},
      {"text": "子供", "start": 30, "end": 32, "reading": "こども", "kanji": ["子", "供"]},
      {"text": "から", "start": 32, "end": 34, "kanji": []},
      {"text": "大人", "start": 34, "end": 36, "reading": "おとな", "kanji": ["大", "人"]},
      {"text": "まで", "start": 36, "end": 38, "kanji": []},
      {"text": "楽しめ", "start": 38, "end": 41, "reading": "たのしめ", "kanji": ["楽"]},
      {"text": "ます", "start": 41, "end": 43, "kanji": []},
      {"text": "。", "start": 43, "end": 44, "kanji": []},
      {"text": "ストーリー", "start": 44, "end": 49, "kanji": []},
      {"text": "が", "start": 49, "end": 50, "kanji": []},
      {"text": "深く", "start": 50, "end": 52, "reading": "ふかく", "kanji": ["深"]},
      {"text": "、", "start": 52, "end": 53, "kanji": []},
      {"text": "キャラクター", "start": 53, "end": 59, "kanji": []},
      {"text": "が", "start": 59, "end": 60, "kanji": []},
      {"text": "魅力的", "start": 60, "end": 63, "reading": "みりょくてき", "kanji": ["魅", "力", "的"]},
      {"text": "です", "start": 63, "end": 65, "kanji": []},
      {"text": "。", "start": 65, "end": 66, "kanji": []}
    ]
  }',
  136,
  '[
    {"word": "アニメ", "reading": "あにめ", "definition": "anime, animation", "example": "日本のアニメは世界中で人気があります。"},
    {"word": "人気", "reading": "にんき", "definition": "popular, popularity", "example": "日本のアニメは世界中で人気があります。"},
    {"word": "様々", "reading": "さまざま", "definition": "various", "example": "様々なジャンルがあり。"},
    {"word": "魅力的", "reading": "みりょくてき", "definition": "attractive, charming", "example": "キャラクターが魅力的です。"},
    {"word": "配信", "reading": "はいしん", "definition": "distribution, streaming", "example": "最近は配信サービスで簡単に見られます。"},
    {"word": "声優", "reading": "せいゆう", "definition": "voice actor", "example": "声優の演技も重要な要素で。"},
    {"word": "産業", "reading": "さんぎょう", "definition": "industry", "example": "日本のアニメ産業は経済的にも重要な役割を果たしています。"}
  ]',
  '[
    {"structure": "〜から〜まで", "explanation": "From...to, indicating a range", "example": "子供から大人まで楽しめます。"},
    {"structure": "〜を通じて", "explanation": "Through, by means of", "example": "アニメを通じて日本語や日本文化を学ぶ。"},
    {"structure": "〜を楽しみにしている", "explanation": "Looking forward to something", "example": "続編を楽しみにしている人がたくさんいます。"}
  ]'
);

-- Chinese intermediate - Current Events
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'intermediate',
  'Current Events',
  '电子商务的发展',
  '近年来，电子商务在中国发展迅速。越来越多的人选择网上购物，方便快捷。移动支付让交易更加简单。许多传统商店也开设了网店。这改变了人们的消费习惯。但网络安全问题需要重视。各大电商平台竞争激烈，促销活动频繁。物流配送系统不断完善，送货速度越来越快。直播带货成为新的销售方式，很受年轻人欢迎。农村地区也开始使用电商平台，帮助农民销售产品。电子商务为创业者提供了新的机会。',
  '{
    "words": [
      {"text": "近年来", "start": 0, "end": 3, "reading": "jìnniánlái", "kanji": []},
      {"text": "，", "start": 3, "end": 4, "kanji": []},
      {"text": "电子", "start": 4, "end": 6, "reading": "diànzǐ", "kanji": []},
      {"text": "商务", "start": 6, "end": 8, "reading": "shāngwù", "kanji": []},
      {"text": "在", "start": 8, "end": 9, "reading": "zài", "kanji": []},
      {"text": "中国", "start": 9, "end": 11, "reading": "zhōngguó", "kanji": []},
      {"text": "发展", "start": 11, "end": 13, "reading": "fāzhǎn", "kanji": []},
      {"text": "迅速", "start": 13, "end": 15, "reading": "xùnsù", "kanji": []},
      {"text": "。", "start": 15, "end": 16, "kanji": []},
      {"text": "越来越", "start": 16, "end": 19, "reading": "yuèláiyuè", "kanji": []},
      {"text": "多", "start": 19, "end": 20, "reading": "duō", "kanji": []},
      {"text": "的", "start": 20, "end": 21, "reading": "de", "kanji": []},
      {"text": "人", "start": 21, "end": 22, "reading": "rén", "kanji": []},
      {"text": "选择", "start": 22, "end": 24, "reading": "xuǎnzé", "kanji": []},
      {"text": "网上", "start": 24, "end": 26, "reading": "wǎngshàng", "kanji": []},
      {"text": "购物", "start": 26, "end": 28, "reading": "gòuwù", "kanji": []},
      {"text": "，", "start": 28, "end": 29, "kanji": []},
      {"text": "方便", "start": 29, "end": 31, "reading": "fāngbiàn", "kanji": []},
      {"text": "快捷", "start": 31, "end": 33, "reading": "kuàijié", "kanji": []},
      {"text": "。", "start": 33, "end": 34, "kanji": []},
      {"text": "移动", "start": 34, "end": 36, "reading": "yídòng", "kanji": []},
      {"text": "支付", "start": 36, "end": 38, "reading": "zhīfù", "kanji": []},
      {"text": "让", "start": 38, "end": 39, "reading": "ràng", "kanji": []},
      {"text": "交易", "start": 39, "end": 41, "reading": "jiāoyì", "kanji": []},
      {"text": "更加", "start": 41, "end": 43, "reading": "gèngjiā", "kanji": []},
      {"text": "简单", "start": 43, "end": 45, "reading": "jiǎndān", "kanji": []},
      {"text": "。", "start": 45, "end": 46, "kanji": []}
    ]
  }',
  124,
  '[
    {"word": "电子商务", "reading": "diànzǐ shāngwù", "definition": "e-commerce", "example": "电子商务在中国发展迅速。"},
    {"word": "迅速", "reading": "xùnsù", "definition": "rapid, swift", "example": "电子商务在中国发展迅速。"},
    {"word": "网上购物", "reading": "wǎngshàng gòuwù", "definition": "online shopping", "example": "越来越多的人选择网上购物。"},
    {"word": "移动支付", "reading": "yídòng zhīfù", "definition": "mobile payment", "example": "移动支付让交易更加简单。"},
    {"word": "平台", "reading": "píngtái", "definition": "platform", "example": "各大电商平台竞争激烈。"},
    {"word": "物流", "reading": "wùliú", "definition": "logistics", "example": "物流配送系统不断完善。"},
    {"word": "直播带货", "reading": "zhíbō dàihuò", "definition": "live-streaming sales", "example": "直播带货成为新的销售方式。"}
  ]',
  '[
    {"structure": "近年来", "explanation": "In recent years", "example": "近年来，电子商务在中国发展迅速。"},
    {"structure": "越来越 + adjective", "explanation": "More and more, increasingly", "example": "越来越多的人选择网上购物。"},
    {"structure": "为...提供", "explanation": "To provide for/to", "example": "电子商务为创业者提供了新的机会。"}
  ]'
);

-- Japanese advanced - Arts & Literature
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'ja',
  'advanced',
  'Arts & Literature',
  '俳句の魅力',
  '俳句は日本の伝統的な詩の形式です。わずか十七音で自然や季節、人生の一瞬を表現します。松尾芭蕉や与謝蕪村など、多くの名俳人が優れた作品を残しました。シンプルさの中に深い意味が込められており、読む人によって解釈が異なります。現代でも多くの人が俳句を楽しみ、創作しています。俳句の起源は連歌の発句にあり、室町時代に独立した文芸形式として確立されました。五・七・五の音数律と季語の使用が基本的なルールです。季語は春夏秋冬の季節感を表す言葉で、歳時記にまとめられています。切れ字と呼ばれる「や」「かな」などの助詞が、リズムと余韻を生み出します。芭蕉の「古池や蛙飛び込む水の音」は、静寂と動きの対比が見事です。正岡子規は俳句の革新を推進し、写生の重要性を説きました。現代俳句では、伝統的な形式を守りながらも、都市生活や現代的なテーマを扱う作品が増えています。俳句は英語をはじめ、多くの言語に翻訳され、世界中で創作されるようになりました。国際俳句大会も開催され、文化交流の架け橋となっています。短い形式ゆえに、言葉の選択が極めて重要で、一語一語に作者の感性が凝縮されます。俳句を詠むことは、日常の中の美しさや儚さに気づく訓練にもなります。俳句教室や句会が全国各地で開かれ、世代を超えて親しまれています。デジタル時代においても、SNSで俳句を共有する文化が広がっています。',
  '{
    "words": [
      {"text": "俳句", "start": 0, "end": 2, "reading": "はいく", "kanji": ["俳", "句"]},
      {"text": "は", "start": 2, "end": 3, "kanji": []},
      {"text": "日本", "start": 3, "end": 5, "reading": "にほん", "kanji": ["日", "本"]},
      {"text": "の", "start": 5, "end": 6, "kanji": []},
      {"text": "伝統的", "start": 6, "end": 9, "reading": "でんとうてき", "kanji": ["伝", "統", "的"]},
      {"text": "な", "start": 9, "end": 10, "kanji": []},
      {"text": "詩", "start": 10, "end": 11, "reading": "し", "kanji": ["詩"]},
      {"text": "の", "start": 11, "end": 12, "kanji": []},
      {"text": "形式", "start": 12, "end": 14, "reading": "けいしき", "kanji": ["形", "式"]},
      {"text": "です", "start": 14, "end": 16, "kanji": []},
      {"text": "。", "start": 16, "end": 17, "kanji": []},
      {"text": "わずか", "start": 17, "end": 20, "kanji": []},
      {"text": "十七", "start": 20, "end": 22, "reading": "じゅうしち", "kanji": ["十", "七"]},
      {"text": "音", "start": 22, "end": 23, "reading": "おん", "kanji": ["音"]},
      {"text": "で", "start": 23, "end": 24, "kanji": []},
      {"text": "自然", "start": 24, "end": 26, "reading": "しぜん", "kanji": ["自", "然"]},
      {"text": "や", "start": 26, "end": 27, "kanji": []},
      {"text": "季節", "start": 27, "end": 29, "reading": "きせつ", "kanji": ["季", "節"]},
      {"text": "、", "start": 29, "end": 30, "kanji": []},
      {"text": "人生", "start": 30, "end": 32, "reading": "じんせい", "kanji": ["人", "生"]},
      {"text": "の", "start": 32, "end": 33, "kanji": []},
      {"text": "一瞬", "start": 33, "end": 35, "reading": "いっしゅん", "kanji": ["一", "瞬"]},
      {"text": "を", "start": 35, "end": 36, "kanji": []},
      {"text": "表現", "start": 36, "end": 38, "reading": "ひょうげん", "kanji": ["表", "現"]},
      {"text": "し", "start": 38, "end": 39, "kanji": []},
      {"text": "ます", "start": 39, "end": 41, "kanji": []},
      {"text": "。", "start": 41, "end": 42, "kanji": []}
    ]
  }',
  384,
  '[
    {"word": "俳句", "reading": "はいく", "definition": "haiku (Japanese poetry)", "example": "俳句は日本の伝統的な詩の形式です。"},
    {"word": "伝統的", "reading": "でんとうてき", "definition": "traditional", "example": "俳句は日本の伝統的な詩の形式です。"},
    {"word": "表現", "reading": "ひょうげん", "definition": "expression", "example": "わずか十七音で自然や季節、人生の一瞬を表現します。"},
    {"word": "季語", "reading": "きご", "definition": "seasonal word (in haiku)", "example": "季語の使用が基本的なルールです。"},
    {"word": "解釈", "reading": "かいしゃく", "definition": "interpretation", "example": "読む人によって解釈が異なります。"},
    {"word": "革新", "reading": "かくしん", "definition": "innovation, reform", "example": "正岡子規は俳句の革新を推進し。"},
    {"word": "凝縮", "reading": "ぎょうしゅく", "definition": "concentration, condensation", "example": "一語一語に作者の感性が凝縮されます。"},
    {"word": "儚さ", "reading": "はかなさ", "definition": "transience, ephemerality", "example": "日常の中の美しさや儚さに気づく。"}
  ]',
  '[
    {"structure": "〜の中に", "explanation": "Within, in the midst of", "example": "シンプルさの中に深い意味が込められており。"},
    {"structure": "〜によって", "explanation": "Depending on, by means of", "example": "読む人によって解釈が異なります。"},
    {"structure": "〜ゆえに", "explanation": "Because of, due to (formal)", "example": "短い形式ゆえに、言葉の選択が極めて重要で。"}
  ]'
);

-- Chinese advanced - Business & Work
INSERT INTO articles (language, difficulty_level, topic, title, content, segmented_content, word_count, target_words, grammar_points) VALUES
(
  'zh',
  'advanced',
  'Business & Work',
  '创业精神与创新',
  '在快速发展的经济环境中，创业精神和创新能力至关重要。成功的企业家需要具备敏锐的市场洞察力和冒险精神。他们不仅要识别商机，还要能够整合资源，建立高效的团队。失败是创业过程中不可避免的，但从中吸取教训才是成长的关键。持续学习和适应变化的能力决定了企业的长远发展。创业者必须对行业趋势保持敏感，及时调整战略方向。产品创新和服务创新是保持竞争优势的核心要素。许多成功的创业公司都是从解决实际问题开始的。用户需求研究和市场调研是产品开发的基础。精益创业方法强调快速迭代和验证假设，减少资源浪费。建立强大的企业文化有助于吸引和留住人才。领导力不仅体现在决策能力上，更体现在激励团队、培养人才方面。融资是创业过程中的重要环节，需要清晰的商业计划和财务预测。天使投资、风险投资等不同阶段的融资策略各有特点。网络效应和规模经济是互联网创业的重要优势。数字化转型为传统行业创造了新的机会。人工智能、大数据等技术正在改变商业模式。创业生态系统的完善对于创业成功率的提升至关重要。政府政策支持、孵化器、加速器等为创业者提供了重要帮助。社会责任和可持续发展越来越成为企业关注的焦点。消费者也更倾向于支持有社会价值的企业。创新不仅是技术创新，还包括商业模式创新、管理创新等多个维度。跨界合作和开放式创新正在成为新趋势。',
  '{
    "words": [
      {"text": "在", "start": 0, "end": 1, "reading": "zài", "kanji": []},
      {"text": "快速", "start": 1, "end": 3, "reading": "kuàisù", "kanji": []},
      {"text": "发展", "start": 3, "end": 5, "reading": "fāzhǎn", "kanji": []},
      {"text": "的", "start": 5, "end": 6, "reading": "de", "kanji": []},
      {"text": "经济", "start": 6, "end": 8, "reading": "jīngjì", "kanji": []},
      {"text": "环境", "start": 8, "end": 10, "reading": "huánjìng", "kanji": []},
      {"text": "中", "start": 10, "end": 11, "reading": "zhōng", "kanji": []},
      {"text": "，", "start": 11, "end": 12, "kanji": []},
      {"text": "创业", "start": 12, "end": 14, "reading": "chuàngyè", "kanji": []},
      {"text": "精神", "start": 14, "end": 16, "reading": "jīngshén", "kanji": []},
      {"text": "和", "start": 16, "end": 17, "reading": "hé", "kanji": []},
      {"text": "创新", "start": 17, "end": 19, "reading": "chuàngxīn", "kanji": []},
      {"text": "能力", "start": 19, "end": 21, "reading": "nénglì", "kanji": []},
      {"text": "至关重要", "start": 21, "end": 25, "reading": "zhìguānzhòngyào", "kanji": []},
      {"text": "。", "start": 25, "end": 26, "kanji": []},
      {"text": "成功", "start": 26, "end": 28, "reading": "chénggōng", "kanji": []},
      {"text": "的", "start": 28, "end": 29, "reading": "de", "kanji": []},
      {"text": "企业家", "start": 29, "end": 32, "reading": "qǐyèjiā", "kanji": []},
      {"text": "需要", "start": 32, "end": 34, "reading": "xūyào", "kanji": []},
      {"text": "具备", "start": 34, "end": 36, "reading": "jùbèi", "kanji": []},
      {"text": "敏锐", "start": 36, "end": 38, "reading": "mǐnruì", "kanji": []},
      {"text": "的", "start": 38, "end": 39, "reading": "de", "kanji": []},
      {"text": "市场", "start": 39, "end": 41, "reading": "shìchǎng", "kanji": []},
      {"text": "洞察力", "start": 41, "end": 44, "reading": "dòngchálì", "kanji": []},
      {"text": "和", "start": 44, "end": 45, "reading": "hé", "kanji": []},
      {"text": "冒险", "start": 45, "end": 47, "reading": "màoxiǎn", "kanji": []},
      {"text": "精神", "start": 47, "end": 49, "reading": "jīngshén", "kanji": []},
      {"text": "。", "start": 49, "end": 50, "kanji": []}
    ]
  }',
  420,
  '[
    {"word": "创业", "reading": "chuàngyè", "definition": "entrepreneurship, start a business", "example": "在快速发展的经济环境中，创业精神和创新能力至关重要。"},
    {"word": "创新", "reading": "chuàngxīn", "definition": "innovation", "example": "创业精神和创新能力至关重要。"},
    {"word": "至关重要", "reading": "zhìguānzhòngyào", "definition": "crucial, vital", "example": "创业精神和创新能力至关重要。"},
    {"word": "企业家", "reading": "qǐyèjiā", "definition": "entrepreneur", "example": "成功的企业家需要具备敏锐的市场洞察力。"},
    {"word": "洞察力", "reading": "dòngchálì", "definition": "insight, perceptiveness", "example": "成功的企业家需要具备敏锐的市场洞察力。"},
    {"word": "融资", "reading": "róngzī", "definition": "financing, fundraising", "example": "融资是创业过程中的重要环节。"},
    {"word": "精益创业", "reading": "jīngyì chuàngyè", "definition": "lean startup", "example": "精益创业方法强调快速迭代和验证假设。"},
    {"word": "可持续发展", "reading": "kěchíxù fāzhǎn", "definition": "sustainable development", "example": "社会责任和可持续发展越来越成为企业关注的焦点。"}
  ]',
  '[
    {"structure": "不仅...还...", "explanation": "Not only...but also", "example": "他们不仅要识别商机，还要能够整合资源。"},
    {"structure": "从中...", "explanation": "From it/that, from the middle of something", "example": "但从中吸取教训才是成长的关键。"},
    {"structure": "对于...至关重要", "explanation": "Crucial/vital for something", "example": "创业生态系统的完善对于创业成功率的提升至关重要。"}
  ]'
);
