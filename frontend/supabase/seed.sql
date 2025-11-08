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
