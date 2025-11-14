#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to analyze Chinese articles and find missing dictionary entries.
Extracts missing single characters, two-character compounds, and multi-character phrases.
"""

import re
from collections import defaultdict
import jieba
from pypinyin import pinyin, Style

# All Chinese articles from seed.sql
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

# Dictionary from chinese.ts
existing_dict = {
    '我', '是', '学生', '每天', '去', '学校', '吃', '早饭', '和', '朋友', '说话', '学习', '中文',
    '喜欢', '做饭', '会', '做', '中国', '菜', '用', '米', '肉', '很', '有趣', '常常', '给', '家人',
    '他们', '都', '运动', '对', '身体', '健康', '重要', '每周', '健身房', '三', '次', '跑步', '游泳',
    '让', '感觉', '好', '的', '也', '我们', '一起', '打', '篮球', '智能', '手机', '现代', '社会',
    '工具', '可以', '发送', '消息', '拍', '照片', '上网', '搜索', '信息', '多', '人', '使用', '它',
    '北京', '首都', '著名', '景点', '长城', '必看', '地方', '历史', '悠久', '故宫', '展示', '了',
    '古代', '皇帝', '生活', '烤鸭', '当地', '美食', '游客', '体验', '传统', '文化', '结合',
    '近年来', '电子', '商务', '在', '发展', '迅速', '越来越', '选择', '网上', '购物', '方便',
    '快捷', '移动', '支付', '交易', '更加', '简单', '许多', '商店', '开设', '网店', '这',
    '改变', '消费', '习惯', '但', '网络', '安全', '问题', '需要', '重视', '全球', '气候', '变化',
    '成为', '当今', '世界', '面临', '重大', '挑战', '温室', '气体', '排放', '导致', '地球',
    '温度', '上升', '极端', '事件', '频繁', '发生', '环境', '经济', '创业', '创新', '精神',
    '能力', '企业家', '具备', '敏锐', '洞察力', '冒险', '很多', '能', '不', '有', '时候',
    '什么', '怎么', '哪里', '谁', '为什么', '因为', '所以', '如果', '那么', '虽然', '但是',
    '还是', '或者', '已经', '刚才', '马上', '现在', '以前', '以后', '时间', '年', '月', '日',
    '天', '小时', '分钟', '秒', '今天', '明天', '昨天', '上午', '下午', '晚上', '早上', '中午',
    '周末', '星期', '上', '下', '前', '后', '左', '右', '里', '外', '中', '旁边', '对面', '附近',
    '远', '近', '大', '小', '高', '低', '长', '短', '新', '旧', '快', '慢', '冷', '热', '暖', '凉',
    '干净', '脏', '忙', '累', '高兴', '难过', '生气', '担心', '害怕', '紧张', '放心', '满意',
    '看', '听', '说', '读', '写', '想', '知道', '认识', '明白', '懂', '记得', '忘记', '帮助',
    '问', '回答', '告诉', '教', '借', '还', '买', '卖', '送', '收', '拿', '放', '找', '搬', '开',
    '关', '进', '出', '来', '回', '到', '离', '过', '走', '坐', '站', '躺', '睡觉', '起床', '穿',
    '脱', '洗', '喝', '玩', '笑', '哭', '唱歌', '跳舞', '画画', '工作', '休息', '开始', '结束',
    '继续', '停止', '准备', '完成', '决定', '打算', '希望', '相信', '觉得', '发现', '注意',
    '小心', '努力', '成功', '失败', '家', '房子', '房间', '门', '窗户', '桌子', '椅子', '床',
    '衣服', '鞋', '书', '笔', '纸', '电脑', '电视', '电话', '汽车', '自行车', '飞机', '火车',
    '公交车', '地铁', '医院', '饭店', '商场', '超市', '银行', '邮局', '公园', '公司', '图书馆',
    '电影院', '机场', '火车站', '爸爸', '妈妈', '哥哥', '姐姐', '弟弟', '妹妹', '老师', '医生',
    '护士', '警察', '服务员', '司机', '经理', '老板', '水', '茶', '咖啡', '牛奶', '果汁', '啤酒',
    '面包', '面条', '饺子', '包子', '鸡蛋', '鱼', '鸡', '牛肉', '猪肉', '羊肉', '蔬菜', '水果',
    '苹果', '香蕉', '橙子', '西瓜', '葡萄', '颜色', '红', '黄', '蓝', '绿', '白', '黑', '灰',
    '粉', '紫', '棕', '数字', '一', '二', '四', '五', '六', '七', '八', '九', '十', '百', '千',
    '万', '钱', '块', '元', '贵', '便宜', '价格', '国家', '城市', '上海', '日本', '美国', '英国',
    '法国', '德国', '语言', '英语', '汉语', '日语', '法语', '天气', '晴天', '阴天', '下雨',
    '下雪', '刮风', '春', '夏', '秋', '冬', '春天', '夏天', '秋天', '冬天', '导航', '社交媒体',
    '应用程序', '至关重要'
}

def is_chinese_char(char):
    """Check if a character is Chinese"""
    return '\u4e00' <= char <= '\u9fff'

def extract_all_chinese_text():
    """Extract all Chinese characters from articles"""
    all_text = ''.join([article['content'] for article in articles])
    # Remove punctuation
    all_text = re.sub(r'[，。、；：！？《》「」【】（）\s]', '', all_text)
    return all_text

def get_single_characters(text):
    """Get all unique single Chinese characters"""
    chars = set()
    for char in text:
        if is_chinese_char(char):
            chars.add(char)
    return chars

def get_compounds_and_phrases(text):
    """Use jieba to segment text and get compounds/phrases"""
    # Segment the text
    words = jieba.lcut(text)

    two_char = set()
    multi_char = set()

    for word in words:
        # Only process Chinese words
        if not all(is_chinese_char(c) for c in word):
            continue

        if len(word) == 2:
            two_char.add(word)
        elif len(word) >= 3:
            multi_char.add(word)

    return two_char, multi_char

def get_pinyin_with_tone(word):
    """Get pinyin with tone marks"""
    result = pinyin(word, style=Style.TONE)
    return ' '.join([p[0] for p in result])

def main():
    output_file = "chinese_analysis_results.txt"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("Analyzing Chinese articles...\n")
        f.write(f"Total articles: {len(articles)}\n")
        f.write(f"Existing dictionary entries: {len(existing_dict)}\n")
        f.write("\n")

        # Get all Chinese text
        all_text = extract_all_chinese_text()
        f.write(f"Total Chinese characters in articles: {len(all_text)}\n")

        # Get single characters
        single_chars = get_single_characters(all_text)
        f.write(f"Unique single characters: {len(single_chars)}\n")

        # Get compounds and phrases
        two_char, multi_char = get_compounds_and_phrases(all_text)
        f.write(f"Two-character compounds: {len(two_char)}\n")
        f.write(f"Multi-character phrases: {len(multi_char)}\n")
        f.write("\n")

        # Find missing entries
        missing_single = single_chars - existing_dict
        missing_two_char = two_char - existing_dict
        missing_multi_char = multi_char - existing_dict

        f.write("=" * 80 + "\n")
        f.write("MISSING DICTIONARY ENTRIES\n")
        f.write("=" * 80 + "\n")
        f.write("\n")

        # Sort for consistent output
        missing_single = sorted(missing_single)
        missing_two_char = sorted(missing_two_char)
        missing_multi_char = sorted(missing_multi_char)

        f.write(f"1. MISSING SINGLE CHARACTERS ({len(missing_single)} total)\n")
        f.write("-" * 80 + "\n")
        for i, char in enumerate(missing_single, 1):
            py = get_pinyin_with_tone(char)
            f.write(f"{i:3d}. {char:2s}  {py:15s}  [Definition needed]\n")

        f.write("\n")
        f.write(f"2. MISSING TWO-CHARACTER COMPOUNDS ({len(missing_two_char)} total)\n")
        f.write("-" * 80 + "\n")
        for i, word in enumerate(missing_two_char, 1):
            py = get_pinyin_with_tone(word)
            f.write(f"{i:3d}. {word:6s}  {py:25s}  [Definition needed]\n")

        f.write("\n")
        f.write(f"3. MISSING MULTI-CHARACTER PHRASES ({len(missing_multi_char)} total)\n")
        f.write("-" * 80 + "\n")
        for i, phrase in enumerate(missing_multi_char, 1):
            py = get_pinyin_with_tone(phrase)
            f.write(f"{i:3d}. {phrase:12s}  {py:40s}  [Definition needed]\n")

        f.write("\n")
        f.write("=" * 80 + "\n")
        f.write(f"SUMMARY: {len(missing_single)} single chars + {len(missing_two_char)} compounds + {len(missing_multi_char)} phrases = {len(missing_single) + len(missing_two_char) + len(missing_multi_char)} total missing entries\n")
        f.write("=" * 80 + "\n")

    print(f"Analysis complete! Results written to {output_file}")
    print(f"Total missing entries: {len(missing_single) + len(missing_two_char) + len(missing_multi_char)}")

if __name__ == '__main__':
    main()
