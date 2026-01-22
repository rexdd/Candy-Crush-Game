
import { GameMode, Difficulty } from '../types';

export const OFFLINE_VOCABULARY = {
  [GameMode.ENGLISH_CHINESE]: {
    [Difficulty.EASY]: [
      { left: "Apple", right: "苹果" }, { left: "Ant", right: "蚂蚁" }, { left: "Axe", right: "斧头" },
      { left: "Banana", right: "香蕉" }, { left: "Ball", right: "皮球" }, { left: "Bear", right: "狗熊" },
      { left: "Cat", right: "小猫" }, { left: "Cake", right: "蛋糕" }, { left: "Car", right: "汽车" },
      { left: "Dog", right: "小狗" }, { left: "Duck", right: "鸭子" }, { left: "Doll", right: "娃娃" },
      { left: "Egg", right: "鸡蛋" }, { left: "Eye", right: "眼睛" }, { left: "Ear", right: "耳朵" },
      { left: "Fish", right: "小鱼" }, { left: "Fan", right: "风扇" }, { left: "Frog", right: "青蛙" },
      { left: "Goat", right: "山羊" }, { left: "Girl", right: "女孩" }, { left: "Gift", right: "礼物" },
      { left: "Hat", right: "帽子" }, { left: "Hen", right: "母鸡" }, { left: "Hand", right: "小手" },
      { left: "Ice", right: "冰块" }, { left: "Ink", right: "墨水" }, { left: "Idea", right: "主意" },
      { left: "Jam", right: "果酱" }, { left: "Jet", right: "飞机" }, { left: "Jar", right: "罐子" },
      { left: "Kite", right: "风筝" }, { left: "Key", right: "钥匙" }, { left: "King", right: "国王" },
      { left: "Lion", right: "狮子" }, { left: "Leg", right: "大腿" }, { left: "Lamp", right: "台灯" },
      { left: "Milk", right: "牛奶" }, { left: "Moon", right: "月亮" }, { left: "Monkey", right: "猴子" },
      { left: "Nose", right: "鼻子" }, { left: "Net", right: "渔网" }, { left: "Nut", right: "坚果" },
      { left: "Ox", right: "公牛" }, { left: "Oil", right: "油" }, { left: "Open", right: "打开" },
      { left: "Pig", right: "小猪" }, { left: "Pen", right: "钢笔" }, { left: "Pear", right: "鸭梨" },
      { left: "Red", right: "红色" }, { left: "Blue", right: "蓝色" }, { left: "One", right: "一" },
      { left: "Two", right: "二" }, { left: "Sun", right: "太阳" }, { left: "Boy", right: "男孩" },
      // ... 简易单词扩展至150个逻辑占位 ...
    ],
    [Difficulty.MEDIUM]: [
      { left: "Elephant", right: "大象" }, { left: "English", right: "英语" }, { left: "Example", right: "例子" },
      { left: "Flower", right: "鲜花" }, { left: "Family", right: "家人" }, { left: "Father", right: "父亲" },
      { left: "Garden", right: "花园" }, { left: "Grapes", right: "葡萄" }, { left: "Ground", right: "地面" },
      { left: "Happy", right: "开心" }, { left: "House", right: "房子" }, { left: "Horse", right: "骏马" },
      { left: "Island", right: "岛屿" }, { left: "Inside", right: "里面" }, { left: "Insect", right: "昆虫" },
      { left: "Juice", right: "果汁" }, { left: "Jacket", right: "夹克" }, { left: "Jungle", right: "丛林" },
      { left: "Kitchen", right: "厨房" }, { left: "Kettle", right: "水壶" }, { left: "Keep", right: "保持" },
      { left: "Lemon", right: "柠檬" }, { left: "Little", right: "小的" }, { left: "Letter", right: "信件" },
      { left: "Mother", right: "母亲" }, { left: "Market", right: "市场" }, { left: "Mirror", right: "镜子" },
      { left: "Number", right: "数字" }, { left: "Nature", right: "自然" }, { left: "Notice", right: "注意" },
      { left: "Orange", right: "橙子" }, { left: "Office", right: "办公室" }, { left: "Object", right: "物体" },
      { left: "Panda", right: "熊猫" }, { left: "Purple", right: "紫色" }, { left: "Picture", right: "图片" },
      { left: "Rabbit", right: "兔子" }, { left: "Rocket", right: "火箭" }, { left: "River", right: "河流" },
      { left: "School", right: "学校" }, { left: "Silver", right: "银色" }, { left: "Summer", right: "夏天" },
      { left: "Tiger", right: "老虎" }, { left: "Table", right: "桌子" }, { left: "Travel", right: "旅行" },
      { left: "Yellow", right: "黄色" }, { left: "Window", right: "窗户" }, { left: "Winter", right: "冬天" }
    ],
    [Difficulty.HARD]: [
      { left: "Astronaut", right: "宇航员" }, { left: "Adventure", right: "冒险" }, { left: "Beautiful", right: "漂亮" },
      { left: "Butterfly", right: "蝴蝶" }, { left: "Birthday", right: "生日" }, { left: "Breakfast", right: "早餐" },
      { left: "Computer", right: "电脑" }, { left: "Calendar", right: "日历" }, { left: "Chocolate", right: "巧克力" },
      { left: "Dinosaur", right: "恐龙" }, { left: "Different", right: "不同的" }, { left: "Direction", right: "方向" },
      { left: "Experience", right: "经验" }, { left: "Everything", right: "每件事" }, { left: "Education", right: "教育" },
      { left: "Friendship", right: "友谊" }, { left: "Favorite", right: "最喜欢的" }, { left: "Furniture", right: "家具" },
      { left: "Gathering", right: "聚会" }, { left: "Geography", right: "地理" }, { left: "Generous", right: "慷慨" },
      { left: "Happiness", right: "幸福" }, { left: "Hospital", right: "医院" }, { left: "Holiday", right: "假期" },
      { left: "Important", right: "重要的" }, { left: "Inventory", right: "清单" }, { left: "Imagination", right: "想象力" },
      { left: "Knowledge", right: "知识" }, { left: "Kangaroo", right: "袋鼠" }, { left: "Keyboard", right: "键盘" },
      { left: "Landscape", right: "风景" }, { left: "Language", right: "语言" }, { left: "Library", right: "图书馆" },
      { left: "Mountain", right: "高山" }, { left: "Medicine", right: "药物" }, { left: "Movement", right: "运动" },
      { left: "Neighbor", right: "邻居" }, { left: "National", right: "国家的" }, { left: "Nutrition", right: "营养" },
      { left: "Opposite", right: "相反的" }, { left: "Operation", right: "操作" }, { left: "Ornament", right: "装饰" },
      { left: "Passenger", right: "乘客" }, { left: "Platform", right: "站台" }, { left: "Possession", right: "拥有" },
      { left: "Question", right: "问题" }, { left: "Quantity", right: "数量" }, { left: "Quality", right: "质量" },
      { left: "Reflection", right: "反射" }, { left: "Remember", right: "记得" }, { left: "Restaurant", right: "餐厅" },
      { left: "Strategy", right: "策略" }, { left: "Sunshine", right: "阳光" }, { left: "Success", right: "成功" },
      { left: "Telephone", right: "电话" }, { left: "Transport", right: "运输" }, { left: "Tomorrow", right: "明天" },
      { left: "Umbrella", right: "雨伞" }, { left: "Universe", right: "宇宙" }, { left: "Understand", right: "理解" },
      { left: "Vacation", right: "假期" }, { left: "Vegetable", right: "蔬菜" }, { left: "Victory", right: "胜利" },
      { left: "Watermelon", right: "西瓜" }, { left: "Weather", right: "天气" }, { left: "Wonderful", right: "精彩" },
      { left: "Xylophone", right: "木琴" }, { left: "Yesterday", right: "昨天" }, { left: "Zebra", right: "斑马" }
    ]
  },
  [GameMode.PINYIN]: {
    [Difficulty.EASY]: [
      { left: "大", right: "dà" }, { left: "小", right: "xiǎo" }, { left: "山", right: "shān" },
      { left: "水", right: "shuǐ" }, { left: "日", right: "rì" }, { left: "月", right: "yuè" },
      { left: "火", right: "huǒ" }, { left: "木", right: "mù" }, { left: "人", right: "rén" },
      { left: "口", right: "kǒu" }, { left: "手", right: "shǒu" }, { left: "足", right: "zú" },
      { left: "天", right: "tiān" }, { left: "地", right: "dì" }, { left: "云", right: "yún" },
      { left: "雨", right: "yǔ" }, { left: "风", right: "fēng" }, { left: "电", right: "diàn" },
      { left: "早", right: "zǎo" }, { left: "午", right: "wǔ" }, { left: "晚", right: "wǎn" },
      { left: "一", right: "yī" }, { left: "二", right: "èr" }, { left: "三", right: "sān" },
      { left: "四", right: "sì" }, { left: "五", right: "wǔ" }, { left: "六", right: "liù" },
      { left: "七", right: "qī" }, { left: "八", right: "bā" }, { left: "九", right: "jiǔ" },
      { left: "十", right: "shí" }, { left: "上", right: "shàng" }, { left: "下", right: "xià" },
      { left: "左", right: "zuǒ" }, { left: "右", right: "yòu" }, { left: "中", right: "zhōng" }
    ],
    [Difficulty.MEDIUM]: [
      { left: "苹果", right: "píng guǒ" }, { left: "香蕉", right: "xiāng jiāo" }, { left: "西瓜", right: "xī guā" },
      { left: "葡萄", right: "pú tao" }, { left: "草莓", right: "cǎo méi" }, { left: "柠檬", right: "níng méng" },
      { left: "老师", right: "lǎo shī" }, { left: "同学", right: "tóng xué" }, { left: "学校", right: "xué xiào" },
      { left: "教室", right: "jiào shì" }, { left: "操场", right: "cāo chǎng" }, { left: "学习", right: "xué xí" },
      { left: "爸爸", right: "bà ba" }, { left: "妈妈", right: "mā ma" }, { left: "哥哥", right: "gē ge" },
      { left: "姐姐", right: "jiě jie" }, { left: "弟弟", right: "dì di" }, { left: "妹妹", right: "mèi mei" },
      { left: "中国", right: "zhōng guó" }, { left: "北京", right: "běi jīng" }, { left: "快乐", right: "kuài lè" },
      { left: "谢谢", right: "xiè xie" }, { left: "你好", right: "nǐ hǎo" }, { left: "再见", right: "zài jiàn" }
    ],
    [Difficulty.HARD]: [
      { left: "欣欣向荣", right: "xīn xīn xiàng róng" }, { left: "美丽家园", right: "měi lì jiā yuán" }, { left: "万里长城", right: "wàn lǐ cháng chéng" },
      { left: "英雄好汉", right: "yīng xióng hǎo hàn" }, { left: "聪明伶俐", right: "cōng míng líng lì" }, { left: "活泼可爱", right: "huó pō kě ài" },
      { left: "山清水秀", right: "shān qīng shuǐ xiù" }, { left: "阳光灿烂", right: "yáng guāng càn làn" }, { left: "春暖花开", right: "chūn nuǎn huā kāi" },
      { left: "秋高气爽", right: "qiū gāo qì shuǎng" }, { left: "五颜六色", right: "wǔ yán liù sè" }, { left: "欢天喜地", right: "huān tiān xǐ dì" },
      { left: "自强不息", right: "zì qiáng bù xī" }, { left: "学无止境", right: "xué wú zhǐ jìng" }, { left: "一鸣惊人", right: "yī míng jīng rén" }
    ]
  },
  [GameMode.MATH]: {
    [Difficulty.EASY]: [
      { left: "1+1", right: "2" }, { left: "2+2", right: "4" }, { left: "3+3", right: "6" },
      { left: "4+4", right: "8" }, { left: "5+5", right: "10" }, { left: "1+2", right: "3" },
      { left: "2+3", right: "5" }, { left: "3+4", right: "7" }, { left: "4+5", right: "9" },
      { left: "2-1", right: "1" }, { left: "4-2", right: "2" }, { left: "6-3", right: "3" },
      { left: "8-4", right: "4" }, { left: "10-5", right: "5" }, { left: "5-2", right: "3" },
      { left: "7-3", right: "4" }, { left: "9-4", right: "5" }, { left: "6+2", right: "8" },
      { left: "8+1", right: "9" }, { left: "7+2", right: "9" }, { left: "5+4", right: "9" },
      { left: "3-2", right: "1" }, { left: "5-4", right: "1" }, { left: "10-1", right: "9" }
    ],
    [Difficulty.MEDIUM]: [
      { left: "12+5", right: "17" }, { left: "15+4", right: "19" }, { left: "11+8", right: "19" },
      { left: "13+6", right: "19" }, { left: "14+3", right: "17" }, { left: "18-6", right: "12" },
      { left: "19-7", right: "12" }, { left: "15-5", right: "10" }, { left: "17-4", right: "13" },
      { left: "20-8", right: "12" }, { left: "10+10", right: "20" }, { left: "12+8", right: "20" },
      { left: "16-9", right: "7" }, { left: "13-8", right: "5" }, { left: "15-7", right: "8" },
      { left: "11+7", right: "18" }, { left: "19-11", right: "8" }, { left: "14+6", right: "20" }
    ],
    [Difficulty.HARD]: [
      { left: "25+15", right: "40" }, { left: "36+14", right: "50" }, { left: "42+28", right: "70" },
      { left: "55-15", right: "40" }, { left: "68-24", right: "44" }, { left: "99-33", right: "66" },
      { left: "22+22", right: "44" }, { left: "33+33", right: "66" }, { left: "44+44", right: "88" },
      { left: "75-25", right: "50" }, { left: "88-44", right: "44" }, { left: "100-50", right: "50" },
      { left: "12+12+12", right: "36" }, { left: "10+20+30", right: "60" }, { left: "50-10-10", right: "30" },
      { left: "5x5", right: "25" }, { left: "2x8", right: "16" }, { left: "3x4", right: "12" }
    ]
  }
};

export const OFFLINE_ENCOURAGEMENTS = {
  match: ["你太棒了！", "真厉害呀！", "魔力十足！", "天才宝贝！", "好聪明哦！", "你是最棒的", "绝妙的组合", "魔法满分"],
  fail: ["再试一次吧", "加油鸭！", "差一点点呢", "别灰心哦", "再找找看", "魔法正在路上", "不要放弃哈"]
};

export const getOfflineLevel = (mode: GameMode, difficulty: Difficulty): any[] => {
  const countMap = { [Difficulty.EASY]: 9, [Difficulty.MEDIUM]: 12, [Difficulty.HARD]: 15 };
  const count = countMap[difficulty];
  
  // 获取对应模式和难度的列表，如果不存在则退回默认值
  const sourceList = OFFLINE_VOCABULARY[mode]?.[difficulty] || OFFLINE_VOCABULARY[GameMode.ENGLISH_CHINESE][Difficulty.EASY];
  
  // 随机排序并抽取
  return [...sourceList]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((item, idx) => ({ 
      ...item, 
      id: `offline-${mode}-${difficulty}-${idx}-${Date.now()}` 
    }));
};
