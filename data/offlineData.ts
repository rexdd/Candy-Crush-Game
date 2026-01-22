
import { GameMode, Difficulty } from '../types';

export const OFFLINE_VOCABULARY = {
  [GameMode.ENGLISH_CHINESE]: [
    { left: "Apple", right: "苹果" }, { left: "Banana", right: "香蕉" },
    { left: "Cat", right: "小猫" }, { left: "Dog", right: "小狗" },
    { left: "Elephant", right: "大象" }, { left: "Flower", right: "花朵" },
    { left: "Green", right: "绿色" }, { left: "Happy", right: "开心" },
    { left: "Ice Cream", right: "冰淇淋" }, { left: "Jump", right: "跳跃" },
    { left: "Kangaroo", right: "袋鼠" }, { left: "Lion", right: "狮子" },
    { left: "Moon", right: "月亮" }, { left: "Noodle", right: "面条" },
    { left: "Orange", right: "橙子" }, { left: "Panda", right: "熊猫" },
    { left: "Queen", right: "皇后" }, { left: "Rabbit", right: "兔子" },
    { left: "Sun", right: "太阳" }, { left: "Tiger", right: "老虎" },
    { left: "Umbrella", right: "雨伞" }, { left: "Violin", right: "小提琴" },
    { left: "Water", right: "水" }, { left: "Xylophone", right: "木琴" },
    { left: "Yellow", right: "黄色" }, { left: "Zebra", right: "斑马" },
    { left: "Ball", right: "皮球" }, { left: "Milk", right: "牛奶" },
    { left: "Bread", right: "面包" }, { left: "Duck", right: "鸭子" }
  ],
  [GameMode.PINYIN]: [
    { left: "你好", right: "nǐ hǎo" }, { left: "谢谢", right: "xiè xiè" },
    { left: "老师", right: "lǎo shī" }, { left: "同学", right: "tóng xué" },
    { left: "爸爸", right: "bà ba" }, { left: "妈妈", right: "mā ma" },
    { left: "中国", right: "zhōng guó" }, { left: "美丽", right: "měi lì" },
    { left: "早上", right: "zǎo shang" }, { left: "下雨", right: "xià yǔ" },
    { left: "大树", right: "dà shù" }, { left: "西瓜", right: "xī guā" },
    { left: "星星", right: "xīng xīng" }, { left: "森林", right: "sēn lín" },
    { left: "彩虹", right: "cǎi hóng" }
  ],
  [GameMode.MATH]: [
    { left: "1+1", right: "2" }, { left: "2+3", right: "5" },
    { left: "5+5", right: "10" }, { left: "10-4", right: "6" },
    { left: "8+2", right: "10" }, { left: "9-3", right: "6" },
    { left: "4+4", right: "8" }, { left: "7-2", right: "5" },
    { left: "6+3", right: "9" }, { left: "10+5", right: "15" },
    { left: "12-4", right: "8" }, { left: "15+5", right: "20" },
    { left: "20-10", right: "10" }, { left: "7+7", right: "14" },
    { left: "18-9", right: "9" }
  ]
};

export const OFFLINE_ENCOURAGEMENTS = {
  match: ["你太棒了！", "真厉害呀！", "魔力十足！", "天才宝贝！", "好聪明哦！"],
  fail: ["再试一次吧", "加油鸭！", "差一点点呢", "别灰心哦", "再找找看"]
};

export const getOfflineLevel = (mode: GameMode, difficulty: Difficulty): any[] => {
  const countMap = { [Difficulty.EASY]: 9, [Difficulty.MEDIUM]: 12, [Difficulty.HARD]: 15 };
  const count = countMap[difficulty];
  const source = OFFLINE_VOCABULARY[mode] || OFFLINE_VOCABULARY[GameMode.ENGLISH_CHINESE];
  
  return [...source]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((item, idx) => ({ ...item, id: `offline-${mode}-${idx}-${Date.now()}` }));
};
