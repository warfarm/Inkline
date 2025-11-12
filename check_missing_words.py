#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to check which words from articles are actually missing from chinese.ts
"""

import re
import jieba
from pypinyin import pinyin, Style

# All Chinese articles from the analyze script
articles = [
    {
        'title': '我的一天',
        'difficulty': 'beginner',
        'content': '我是学生。我每天去学校。我吃早饭。我和朋友说话。我学习中文。'
    },
    {
        'title': '做饭',
        'difficulty': 'beginner',
        'content': '我喜欢做饭。我会做中国菜。我用米、菜和肉。做饭很有趣。我常常给家人做饭。他们都很喜欢吃。'
    },
    {
        'title': '运动很重要',
        'difficulty': 'beginner',
        'content': '运动对身体健康很重要。我每周去健身房三次。我喜欢跑步和游泳。运动让我感觉很好。我的朋友也喜欢运动。我们一起打篮球。'
    },
    {
        'title': '智能手机的使用',
        'difficulty': 'intermediate',
        'content': '智能手机是现代社会的重要工具。我们可以发送消息、拍照片、上网搜索信息。很多人每天都在使用它。现在有各种各样的应用程序，让生活更加方便。我们可以用手机购物、办理银行业务。健康和运动应用也很受欢迎。GPS导航功能让出行更轻松。手机相机的质量越来越好，可以拍出专业水平的照片。社交媒体让我们与朋友和家人保持联系。移动支付使交易变得简单快捷。'
    },
    {
        'title': '北京旅游',
        'difficulty': 'intermediate',
        'content': '北京是中国的首都，有很多著名的景点。长城是必看的地方，历史悠久。故宫展示了古代皇帝的生活。北京烤鸭是当地的美食。游客可以体验传统文化和现代生活的结合。天坛公园是祈祷丰收的地方，建筑非常壮观。颐和园的湖光山色让人流连忘返。798艺术区展示了现代艺术作品。胡同里可以感受老北京的生活气息。地铁系统很发达，出行很方便。'
    },
    {
        'title': '电子商务的发展',
        'difficulty': 'intermediate',
        'content': '近年来，电子商务在中国发展迅速。越来越多的人选择网上购物，方便快捷。移动支付让交易更加简单。许多传统商店也开设了网店。这改变了人们的消费习惯。但网络安全问题需要重视。各大电商平台竞争激烈，促销活动频繁。物流配送系统不断完善，送货速度越来越快。直播带货成为新的销售方式，很受年轻人欢迎。农村地区也开始使用电商平台，帮助农民销售产品。电子商务为创业者提供了新的机会。'
    },
    {
        'title': '气候变化的影响',
        'difficulty': 'advanced',
        'content': '全球气候变化已经成为当今世界面临的重大挑战。温室气体排放导致地球温度上升，极端天气事件频繁发生。科学家们呼吁各国采取紧急措施，减少碳排放。可再生能源的发展对于应对气候危机至关重要。个人和企业都需要承担环境保护的责任，为子孙后代保护地球。近年来，全球平均气温持续上升，冰川融化速度加快，海平面不断上涨。这些变化威胁着沿海城市的安全，数百万人面临被迫迁移的风险。干旱、洪水、飓风等灾害的强度和频率都在增加，给农业生产和粮食安全带来严重影响。生物多样性也受到威胁，许多物种正面临灭绝的危险。为了应对这一全球性挑战，各国政府签署了《巴黎协定》，承诺限制温室气体排放。太阳能、风能等清洁能源技术正在快速发展，成本也在逐步降低。电动汽车的普及有助于减少交通领域的碳排放。碳捕获与储存技术也在不断改进，为工业减排提供了新的途径。然而，转型需要巨额投资和政策支持。发展中国家在经济发展和环境保护之间面临艰难选择。国际合作和技术转让对于全球共同应对气候变化至关重要。教育和公众意识的提高也是关键因素。每个人都可以通过改变生活方式，如减少能源消耗、选择绿色出行、减少食物浪费等，为保护地球做出贡献。'
    },
    {
        'title': '创业精神与创新',
        'difficulty': 'advanced',
        'content': '在快速发展的经济环境中，创业精神和创新能力至关重要。成功的企业家需要具备敏锐的市场洞察力和冒险精神。他们不仅要识别商机，还要能够整合资源，建立高效的团队。失败是创业过程中不可避免的，但从中吸取教训才是成长的关键。持续学习和适应变化的能力决定了企业的长远发展。创业者必须对行业趋势保持敏感，及时调整战略方向。产品创新和服务创新是保持竞争优势的核心要素。许多成功的创业公司都是从解决实际问题开始的。用户需求研究和市场调研是产品开发的基础。精益创业方法强调快速迭代和验证假设，减少资源浪费。建立强大的企业文化有助于吸引和留住人才。领导力不仅体现在决策能力上，更体现在激励团队、培养人才方面。融资是创业过程中的重要环节，需要清晰的商业计划和财务预测。天使投资、风险投资等不同阶段的融资策略各有特点。网络效应和规模经济是互联网创业的重要优势。数字化转型为传统行业创造了新的机会。人工智能、大数据等技术正在改变商业模式。创业生态系统的完善对于创业成功率的提升至关重要。政府政策支持、孵化器、加速器等为创业者提供了重要帮助。社会责任和可持续发展越来越成为企业关注的焦点。消费者也更倾向于支持有社会价值的企业。创新不仅是技术创新，还包括商业模式创新、管理创新等多个维度。跨界合作和开放式创新正在成为新趋势。'
    }
]

def is_chinese_char(char):
    """Check if a character is Chinese"""
    return '\u4e00' <= char <= '\u9fff'

def extract_all_chinese_text():
    """Extract all Chinese characters from articles"""
    all_text = ''.join([article['content'] for article in articles])
    # Remove punctuation
    all_text = re.sub(r'[，。、；：！？《》「」【】（）\s]', '', all_text)
    return all_text

def read_existing_dict_from_file():
    """Read the actual dictionary entries from chinese.ts"""
    dict_file = 'frontend/src/lib/dictionaries/chinese.ts'
    existing_words = set()

    try:
        with open(dict_file, 'r', encoding='utf-8') as f:
            content = f.read()
            # Match dictionary entries like '我': { pinyin: 'wǒ', definition: 'I; me' },
            pattern = r"'([^']+)':\s*\{"
            matches = re.findall(pattern, content)
            existing_words = set(matches)
    except Exception as e:
        print(f"Error reading dictionary file: {e}")

    return existing_words

def get_compounds_and_phrases(text):
    """Use jieba to segment text and get all words"""
    # Segment the text
    words = jieba.lcut(text)

    all_words = set()

    for word in words:
        # Only process Chinese words
        if not all(is_chinese_char(c) for c in word):
            continue
        if len(word) >= 1:  # Include single characters too
            all_words.add(word)

    return all_words

def get_pinyin_with_tone(word):
    """Get pinyin with tone marks"""
    result = pinyin(word, style=Style.TONE)
    return ''.join([p[0] for p in result])

def get_english_definition(word):
    """Generate a placeholder definition"""
    return "[Definition needed]"

def main():
    print("Analyzing Chinese articles against actual dictionary...")

    # Get all Chinese text
    all_text = extract_all_chinese_text()

    # Get all words from articles
    all_words = get_compounds_and_phrases(all_text)
    print(f"Total unique words in articles: {len(all_words)}")

    # Read existing dictionary
    existing_dict = read_existing_dict_from_file()
    print(f"Existing dictionary entries: {len(existing_dict)}")

    # Find missing words
    missing_words = all_words - existing_dict
    print(f"Missing words: {len(missing_words)}")

    # Separate by length
    missing_single = sorted([w for w in missing_words if len(w) == 1])
    missing_two = sorted([w for w in missing_words if len(w) == 2])
    missing_multi = sorted([w for w in missing_words if len(w) >= 3])

    # Write TypeScript dictionary entries
    output_file = "missing_dictionary_entries.ts"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("// Missing dictionary entries for chinese.ts\n")
        f.write(f"// Total: {len(missing_words)} entries\n\n")

        f.write("// ========== SINGLE CHARACTERS ==========\n")
        for word in missing_single:
            py = get_pinyin_with_tone(word)
            f.write(f"  '{word}': {{ pinyin: '{py}', definition: '[Definition needed]' }},\n")

        f.write("\n// ========== TWO-CHARACTER COMPOUNDS ==========\n")
        for word in missing_two:
            py = get_pinyin_with_tone(word)
            f.write(f"  '{word}': {{ pinyin: '{py}', definition: '[Definition needed]' }},\n")

        f.write("\n// ========== MULTI-CHARACTER PHRASES ==========\n")
        for word in missing_multi:
            py = get_pinyin_with_tone(word)
            f.write(f"  '{word}': {{ pinyin: '{py}', definition: '[Definition needed]' }},\n")

    print(f"\nMissing entries written to {output_file}")
    print(f"Single chars: {len(missing_single)}")
    print(f"Two-char compounds: {len(missing_two)}")
    print(f"Multi-char phrases: {len(missing_multi)}")

    # Also create a simple text list for reference
    list_file = "missing_words_list.txt"
    with open(list_file, 'w', encoding='utf-8') as f:
        f.write("MISSING WORDS FROM ARTICLES\n")
        f.write("="*80 + "\n\n")
        f.write("Single characters:\n")
        f.write(", ".join(missing_single) + "\n\n")
        f.write("Two-character compounds:\n")
        f.write(", ".join(missing_two) + "\n\n")
        f.write("Multi-character phrases:\n")
        f.write(", ".join(missing_multi) + "\n")

    print(f"Word list written to {list_file}")

if __name__ == '__main__':
    main()
