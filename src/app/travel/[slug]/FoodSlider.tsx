'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

const VISIBLE_CARDS = 3;
const CARD_GAP_PX = 19.2;
const SIDE_PEEK_PX = 56;
const CARD_WIDTH_PX = 370.5;
const MARGIN_PX = 260;
const SLIDE_FINE_TUNE_PX = 0;
const CARD_HEIGHT_REM = 28;

type FoodCardItem = {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
};

const JAPAN_FOOD_CARD_ITEMS: FoodCardItem[] = [
  {
    eyebrow: '高松',
    title: '初来乍到，一碗无敌重口的乌冬面',
    body: '即使是庶民，我也接受不了这开局王炸。这顿应该是所有饭中最难吃的一顿。炸物放置了许久，也不允许再热一下；乌冬面里的咖喱，味道实在重口，到后来味蕾只能感受到咸味。',
    imageSrc: '/assets/travel/japan/food-07-takamatsu-udon.jpeg',
    imageAlt: '初来乍到，一碗无敌重口的乌冬面',
  },
  {
    eyebrow: '高松',
    title: '没有高档和牛的「文吧烤肉」',
    body: '此次旅行中为数不多的轻奢享受，在高松本地评分也不错。晚餐内容是啤酒+烤肉，终于喝上了 super dry 品牌的生啤，此前见过多次的广告，清爽好喝。',
    imageSrc: '/assets/travel/japan/food-01-yakiniku-bunbar.jpeg',
    imageAlt: '没有高档和牛的文吧烤肉',
  },
  {
    eyebrow: '高松、直岛、京都',
    title: '没有照片的三次烧鸟',
    body: '此次在日本的旅行，品类中吃得最多的就是「烧鸟」。我最喜欢的，其实是被 lucky 和 apate 唾弃的「吾妻」这家店。或许里面带着些主观情感的因素，当我看着身为母子的二人齐心协力地经营着这家烧鸟店，印象便再也散不掉了。',
    imageSrc: '/assets/travel/japan/food-10-naoshima-ramen.jpeg',
    imageAlt: '没有照片的三次烧鸟',
  },
  {
    eyebrow: '屋岛',
    title: '山顶的汉堡肉套餐',
    body: '如果要说有什么东西是日本特有，而我又觉得难吃的，那就是汉堡肉了。餐厅的落地窗外可以鸟瞰高松的建筑群与港口，唯有米饭颗粒分明，有日本的一概标准。',
    imageSrc: '/assets/travel/japan/food-06-yashima-hamburg.jpeg',
    imageAlt: '山顶的汉堡肉套餐',
  },
  {
    eyebrow: '高松',
    title: '本地的骨付鸟',
    body: '我选的是嫩的，带有适当的嚼劲，肉很香，是冰啤酒无敌的下酒菜。整顿饭很像夜宵的形式，邻桌们都是组队而来，一边聊天，一边畅喝着啤酒。',
    imageSrc: '/assets/travel/japan/food-08-honetsukidori.jpeg',
    imageAlt: '本地的骨付鸟',
  },
  {
    eyebrow: '京都',
    title: '上午简单的开始',
    body: '早餐套餐有一杯咖啡和三片热乎的吐司，价格只需要 20 块钱。我总是一边吃，一边想着一会儿要去往的地方。这是我京都旅行的启程站。',
    imageSrc: '/assets/travel/japan/food-12-kyoto-toast-set.jpeg',
    imageAlt: '上午简单的开始',
  },
  {
    eyebrow: '京都',
    title: '清水寺附近的百佳店：印度香料鹿肉饭',
    body: '这是我此次旅行中唯一吃过的「百佳店」。店面不大，最多只能容下 20 个人。我坐在吧台的位置，看着工作人员现场制作，食物很有特色，只可惜不是我的菜。',
    imageSrc: '/assets/travel/japan/food-02-spiced-deer-rice.jpeg',
    imageAlt: '清水寺附近的百佳店：印度香料鹿肉饭',
  },
  {
    eyebrow: '京都',
    title: '鸭川旁的单人晚餐',
    body: '你要是问我到底什么是鸭川特有的感觉，我会说答案就藏在眼前的这顿饭里。喝着小酒，嘴里叼着热乎的天妇罗，看看窗外宁静的夜晚，底下的鸭川缓缓流过，真是好不惬意。',
    imageSrc: '/assets/travel/japan/food-09-kamogawa-dinner.jpeg',
    imageAlt: '鸭川旁的单人晚餐',
  },
  {
    eyebrow: '奈良',
    title: '没有成功搭讪的午饭',
    body: '额外的 1 分，是和一旁的女郎相遇，我们在沉默之间用食完毕，而我一直在心里纠结的搭讪，到结束也未说出口。事后想想，正是这些意料之外的偶遇，才会使得旅行格外精彩。',
    imageSrc: '/assets/travel/japan/food-03-nara-lunch.jpeg',
    imageAlt: '没有成功搭讪的午饭',
  },
  {
    eyebrow: '京都',
    title: '超级腻的大阪烧',
    body: '别看那圆圆的猪肉馅大饼用料丰富，我拍照时能吃下的 1/4 就是我最大的极限。即使有我最爱的 super dry 啤酒，但还是挽救不了局面。',
    imageSrc: '/assets/travel/japan/food-04-okonomiyaki.jpeg',
    imageAlt: '超级腻的大阪烧',
  },
  {
    eyebrow: '京都',
    title: '小新园长大人的芭菲',
    body: '芭菲，我听过许多次，却一次也没吃过。这是离开京都前最后的甜品。原来这就是芭菲，和吃冰激凌毫无区别。就是这价格，连带咖啡要斥下将近 140 的巨资。',
    imageSrc: '/assets/travel/japan/food-05-parfait.jpeg',
    imageAlt: '小新园长大人的芭菲',
  },
];

const NANJING_FOOD_CARD_ITEMS: FoodCardItem[] = [
  {
    eyebrow: '南京',
    title: '馨方园 南京菜',
    body: '来到南京的第一个中午，吃的是老牌南京菜：甜口的桂花圆子汤，咸口的南京双臭，鲜味的鱼头豆腐，还有带着酱香的烤鸭。我最喜欢双臭里的肥肠，辣味掩盖了食材的腥味。',
    imageSrc: '/assets/travel/nanjing/nj-food-xinfangyuan.jpeg',
    imageAlt: '馨方园 南京菜',
  },
  {
    eyebrow: '南京',
    title: '丑小鸭 鸭血粉丝',
    body: '两笼蟹黄包，但蟹黄咬上去不新鲜，像是冷冻食品；三笼鲜肉包，汤汁随着咬破的皮流了出来，肉中规中矩；一人一碗的鸭血粉丝汤，南京的招牌，普通和清淡。',
    imageSrc: '/assets/travel/nanjing/nj-food-chouxiaoya-duck-vermicelli.jpeg',
    imageAlt: '丑小鸭 鸭血粉丝',
  },
  {
    eyebrow: '南京',
    title: '捞鱼 鱼火锅',
    body: '这是我第一次吃捞鱼火锅。服务员会替我们涮好，时间控制在八秒钟，不多不少。鱼肉口感软糯中带着一点结实，很鲜。这是在南京吃得最满意的一次。',
    imageSrc: '/assets/travel/nanjing/nj-food-laoyu-fish-hotpot.jpeg',
    imageAlt: '捞鱼 鱼火锅',
  },
  {
    eyebrow: '南京',
    title: '5 只羊 烤串',
    body: '烧烤是便宜的，人均不到90；吃的东西和家里的差不多，就是这调味料太多了些，吃不出食物本来的味道。和阿呆共享了一瓶冰啤酒，烧烤配啤酒，无敌的组合。',
    imageSrc: '/assets/travel/nanjing/nj-food-five-goats-skewer.jpeg',
    imageAlt: '5 只羊 烤串',
  },
  {
    eyebrow: '小吃街',
    title: '肥肠面',
    body: '我的食物美学，是希望自己吃的东西有美好的外观。比如我点的这碗面：淡黄色的荷包蛋、深棕色的卤肥肠、一抹棕黄色的咸菜、几颗红色的萝卜作为点缀，以及从空隙里露出的白色细面。它有一种平衡的美感。',
    imageSrc: '/assets/travel/nanjing/nj-food-snack-street-feichang-noodle.jpeg',
    imageAlt: '肥肠面',
  },
  {
    eyebrow: '小吃街',
    title: '大肉面',
    body: '再看看掏粪吃的这碗“大肉面”：顶上是一块发黑的大肉，占了大半个碗；几粒榨菜胡乱地摆在一边，底下的荷包蛋向外摊着。难以想象会有人吃得下这碗面，而掏粪却吃得津津有味，嘴角带油。',
    imageSrc: '/assets/travel/nanjing/nj-food-snack-street-braised-pork-noodle.jpeg',
    imageAlt: '大肉面',
  },
  {
    eyebrow: '南京',
    title: '小厨娘 淮南菜',
    body: '餐厅很大，室内昏暗，餐桌上方打着聚光灯。等到我们的鲈鱼上了桌，我们每人夹了一口。味道像薯条，是那种不冷不热的薯条，里面甚至还有些冷。晚上在酒店回顾南京的食物时，lucky给了这家店差评。',
    imageSrc: '/assets/travel/nanjing/nj-food-xiaochuniang-huainan-cuisine.jpeg',
    imageAlt: '小厨娘 淮南菜',
  },
  {
    eyebrow: '南京',
    title: '小厨娘 淮南菜',
    body: '掏粪把服务员叫了过来，他撤走了旧的，十分钟后端来了新的。“这盘是我看着师傅炸的，你们吃吃看味道怎么样？” 味道还是像薯条，只是比之前热了一点。',
    imageSrc: '/assets/travel/nanjing/nj-food-xiaochuniang-detail.jpeg',
    imageAlt: '小厨娘 淮南菜细节',
  },
  {
    eyebrow: '南京',
    title: '早餐 馄饨',
    body: '馄炖配面条，让我想起在广东吃的云吞面。前者是咸味，后者是鲜味的。鲜味大于咸味。店里的油条是好的，刚炸出锅，很脆，和lucky一起吃了一大根。',
    imageSrc: '/assets/travel/nanjing/nj-food-breakfast-wonton.jpeg',
    imageAlt: '早餐 馄饨',
  },
  {
    eyebrow: '南京',
    title: '广迎居 南京菜',
    body: '离开南京前的最后一顿，吃的是南京菜，像是旅途中的首尾呼应。这家餐厅由一个家庭经营，做妻子的负责做前台，点菜算账；做丈夫的在厨房烧菜，空闲时坐在大厅的板凳上。',
    imageSrc: '/assets/travel/nanjing/nj-food-guangyingju-double-odor.jpeg',
    imageAlt: '广迎居 南京菜',
  },
  {
    eyebrow: '南京',
    title: '广迎居 南京菜',
    body: '这家餐厅有个人的味道，烤鸭酥脆，糖醋排骨酱味充足，狮子头味道清淡，双臭很香。只是少了lucky后，我们剩了很多。',
    imageSrc: '/assets/travel/nanjing/nj-food-guangyingju-detail.jpeg',
    imageAlt: '广迎居 南京菜细节',
  },
];

const SHANGHAI_FOOD_CARD_ITEMS: FoodCardItem[] = [
  {
    eyebrow: '上海',
    title: '穷鬼套餐的红烧牛肉面',
    body: '一碗 18.8 元的牛肉面：牛肉是预制的，面是现煮的，汤是酸甜口的。所谓“不难吃，也不算好吃”。但至少填饱了肚子，不至于半路在这陌生城市的街道上昏厥。',
    imageSrc: '/assets/travel/shanghai/food/noodle-c1.jpeg',
    imageAlt: '穷鬼套餐的红烧牛肉面',
  },
  {
    eyebrow: '上海',
    title: 'BASDBAN 原味可颂',
    body: '不愧是网红店，店里店外都坐满了人，门口飘来浓浓的面包香。大概因为刚出炉，可颂还带着烤箱余温：表皮酥脆，黄油香浓。可惜的是，我本想着此刻吃一半，晚上回去后另一半还可以当作零食，却被伦堡在中途掠夺了。',
    imageSrc: '/assets/travel/shanghai/food/croissant-c4.jpeg',
    imageAlt: 'BASDBAN 原味可颂',
  },
  {
    eyebrow: '上海',
    title: '四人围坐的日式烤肉',
    body: '晚上的店，是伦堡女网友推荐的。烤肉的品质很好，食材新鲜，酱料也符合口味。只是最后一盘的牛排，除了夸张的火焰表演外，吃上去如同烂泥，得到了大家一致的差评。',
    imageSrc: '/assets/travel/shanghai/food/yakiniku-c2.jpeg',
    imageAlt: '四人围坐的日式烤肉',
  },
  {
    eyebrow: '徐家汇',
    title: '厚切猪排饭',
    body: '在空着肚子参与完全程后，我点开手机一看，目的地便立马确定——吃猪排饭。猪排很脆，特别是边角的地方，软绵绵的口感，加上被吸附住的油渍，再配上酱油，最后伴着同样淋上酱油汤汁的米饭，别提有多美味了。',
    imageSrc: '/assets/travel/shanghai/food/pork-cutlet-c1.jpeg',
    imageAlt: '厚切猪排饭',
  },
  {
    eyebrow: '上海',
    title: '自助餐',
    body: '晚饭是和lucky、掏粪和老头四人组一起吃的自助餐。我还是有些不适应吃自助餐，但这一晚上也还是吃了很多。想象里这些杂七杂八的东西都放进了胃里，像是在体内做小火锅一样。离开前我还是拍了一张刚上锅时的照片，那是唯一美丽的时刻。',
    imageSrc: '/assets/travel/shanghai/food/buffet-c2.jpeg',
    imageAlt: '自助餐',
  },
  {
    eyebrow: '迪士尼小镇',
    title: '迪士尼小镇用餐',
    body: '午后我们踏进「越泰」这家泰国菜店，六人没怎么交谈，只是受着饥饿驱使大口吃着。晚上又在迪士尼小镇吃了必吃榜西餐。小镇上的餐饮价格和普通商场同价值得好评；但整体体验并未体会到惊艳之处，说到底这就是西餐吧：一切适可而止。',
    imageSrc: '/assets/travel/shanghai/food/disney-town-c3.jpeg',
    imageAlt: '迪士尼小镇用餐',
  },
  {
    eyebrow: '上海',
    title: '深夜水果夜宵',
    body: '回到民宿，看到微信步数2w8时还是忍不住笑了。洗头洗澡、整理照片后，点了一顿水果夜宵。若说晚上的烤肉给身体增加了重担，那么这个底层为酸奶、上面放满草莓、芒果、哈密瓜的水果杯，就是让身体变轻盈的道具。',
    imageSrc: '/assets/travel/shanghai/food/fruit-snack-n2.jpeg',
    imageAlt: '深夜水果夜宵',
  },
];

const BEIJING_FOOD_CARD_ITEMS: FoodCardItem[] = [
  {
    eyebrow: '北京大学',
    title: '北大食堂',
    body: '中饭：没有想到居然要被北大这个学校背刺了一番，实际花了24，可却要加收15%的管理费，果然只是暂时来北大参加暑期课程的，跟正统的北大人是不一样的。不过，除此之外，北大的食堂确实很良心，第一次就想尝试一下北京的卤味，番茄牛腩的肉分量也很多，简直是ZJU不能比的。',
    imageSrc: '/assets/travel/beijing/food-0701-lunch.png',
    imageAlt: '北大食堂',
  },
  {
    eyebrow: '北京',
    title: '紫光园',
    body: '晚饭：我的天，简直跟白送的一样。我们人均才吃了60，却送了价值人均20的东西，酸奶啊，因为超时而退款的鸭架汤啊，我都不好意思了。第一次吃北京正宗的烤鸭，留下了不错的印象，虽然鸭子的皮和肉和家里的差不太多，可这个卷起来的面皮，却是家里远不能比的。家里一般烤鸭只有皮蘸着酱料好吃，这里的卷上配菜，一口咬下去，连黄瓜都变得好吃了。吃了好几卷，差不多把这个当做了主食。',
    imageSrc: '/assets/travel/beijing/beijing-roast-duck-dinner.jpeg',
    imageAlt: '紫光园',
  },
  {
    eyebrow: '清华园',
    title: '清华园早餐',
    body: '早饭：这次换了一家早餐厅，虽然酒店附近的早餐店并不多，但是也希望每天能够吃点不一样的。今天去吃的是包子店，这家连锁的店在北京似乎很常见。包子的价格不贵，6元/3个，倒是这个豆浆的价格，有点离谱，一碗需要6块钱。在家里，我只见过一碗0.5-1块钱的很稀的豆浆，或者3块钱一杯，在超市用粉冲起来的豆浆。但是，吃完之后，甚至觉得，这6块钱还是值得的，说不定一碗浓浓的真材实料的豆浆就是要这个价格。旁边的肉包倒是一般，没有特别好吃，但也不难吃。',
    imageSrc: '/assets/travel/beijing/food-0702-breakfast.png',
    imageAlt: '清华园早餐',
  },
  {
    eyebrow: '中关村',
    title: '中关村快餐',
    body: '中饭：不知不觉逛到了中关村，打开大众点评，找了附近评价最多的，看到了百年卤煮，只是我觉得我那时快没有时间了，也不想这么快就吃掉这个招牌。最后便找到了这家快餐店，里面人流量很多，人们吃完就走，看评价似乎还算不错的样子，毕竟对得起这个价格。我点的这个套餐只要20元，已经是吃的足够好了。',
    imageSrc: '/assets/travel/beijing/food-0702-zhongguancun.png',
    imageAlt: '中关村快餐',
  },
  {
    eyebrow: '清华园',
    title: '玉树园餐厅',
    body: '晚饭：实验室的另外两个同学，因为晚上想去旁听课程，最后在6点打道回府，回到北大，准备在北大的食堂解决晚饭。而我，根本没有旁听的一点打算，根本就不是过来学习的嘛。就去了清华的食堂吃饭，这家对外开放的玉树园餐厅。感觉食堂的定位有点像浙大里面的麦斯威，座椅不是普通的学校大众食堂，吃的也相对精致一些。难得的，回到了在自己学校吃饭的样子，一边看番，鬼灭的最后一集，一边津津有味地享受美食。只是连吃两顿鸡排饭，可能有些不太健康了。但谁让自己就是这么爱吃鸡排呢。',
    imageSrc: '/assets/travel/beijing/food-0702-yushuyuan.png',
    imageAlt: '玉树园餐厅',
  },
  {
    eyebrow: '北京',
    title: '门框胡同百年卤煮',
    body: '晚饭：终于和呆傻见到了面，一起前去了招牌最响的“门框胡同百年卤煮”吃晚饭。它是连锁店，这家店内的食客并不多，不像我在YouTube里看到的新街口店那么爆满。但是端上来的食物，炸酱面和卤煮，确实是和视频里面所展示的一样。先说结论吧，一般，太一般了。炸酱面的口味正如呆傻所说，跟家里的豆瓣酱丝毫吃不出区别，上面的萝卜丝啊、黄瓜丝啊，都是素的，一点荤的都没有看到。但是面却巨多，端上来一大碗，光吃这一碗就足够给我干饱了，多半一碗还吃不完呢。',
    imageSrc: '/assets/travel/beijing/food-0703-luzhu.png',
    imageAlt: '门框胡同百年卤煮',
  },
  {
    eyebrow: '北京',
    title: '李先生牛肉面',
    body: '中饭：早上根本又没有起来，贪睡了一会儿，大概从1点半，一直躺到10点半，睡眠质量确实很好，可也让我失去了上午出去游玩的时光。中午去酒店的附近探索了一会儿，当然以大众点评上评价比较多的经典店家为主，我选了一家意面。等我骑车到达，才发现那店开在“北京师范大学”的里面，我根本进不去。好吧，被坑了。最后兜兜转转，去了一家卖面的地方，买了套餐券，神奇的是居然可以自己扫码核销。面中规中矩吧，唯一对得起它的价格的是，它有足够的真的牛肉粒。',
    imageSrc: '/assets/travel/beijing/food-0704-noodle.png',
    imageAlt: '李先生牛肉面',
  },
  {
    eyebrow: '北京',
    title: '南门涮肉',
    body: '晚饭：“南门涮肉”，这是一家似乎来北京，就一定要尝试的店。别的主店往往都要排队1个小时以上，还好我们提前预定了，排队只等了15分钟。和家里火锅不同的是，铜锅里面放的是清水，就是干干净净的水。我们三个人点了四盘肉，肉每盘的分量都很足够，数量平均起码在20片以上，是真的看得见的良心。尝试了麻酱，味道确实和家里的不同，它很浓厚，再洒上一些刚出锅的辣椒油，确实不错。',
    imageSrc: '/assets/travel/beijing/food-0704-shuanrou.png',
    imageAlt: '南门涮肉',
  },
  {
    eyebrow: '北京',
    title: 'The Woods 轻食',
    body: '晚饭是在商圈吃的，转了一圈，又不想吃一些稀疏平常的，所以便挑了这一家，此前从未尝试过的轻食店。当然，价格一点也不轻就是了。端上来的食物非常西式，净是一些烤蔬菜、烤水果、炒饭之类的东西，还有半只烤鸡。东西摆盘得不错，饮品是一杯牛油果奶昔。在一旁再配上我的kindle，简直有点小资和文艺了。',
    imageSrc: '/assets/travel/beijing/food-0705-thewoods.png',
    imageAlt: 'The Woods 轻食',
  },
  {
    eyebrow: '北京',
    title: '重八牛府',
    body: '晚饭是和老跨越吃的，我这个人就是这样，一旦能和自己无话不谈的朋友吃饭，有时吃的连饭的滋味，事后回忆起来都会忘掉！今晚就属于这种情况。这里只说饭，因为印象不深，所以也就不打算多写。第一吃麻酱，感到的是惊艳；第二次吃，就觉得是常规了。晚上肉啊、牛肉丸啊、其他蔬菜啊，只能用中规中矩来形容吧。没有惊艳的感觉。倒是价钱很良心，最后人均才80。',
    imageSrc: '/assets/travel/beijing/food-0706-hotpot.png',
    imageAlt: '重八牛府',
  },
  {
    eyebrow: '圆明园',
    title: '圆明园 冰淇淋',
    body: '景区里的网红小吃，短暂停留时的打卡味道，更像是圆明园这段仓促行程的一个路标。（注：在《饮食.tex》中未检索到该条可直接对应的原文段）',
    imageSrc: '/assets/travel/beijing/yuanmingyuan-horse-icecream.jpeg',
    imageAlt: '圆明园 冰淇淋',
  },
  {
    eyebrow: '什刹海',
    title: '悦界清吧',
    body: '前几天和呆傻的游荡有了成果，那就是我们约定好今天晚上，要来这家“悦界”喝酒听歌。走过那些唱着民谣可一杯酒要好几百的黑店，拐了个弯，一直往前走上个400m，才来到这家不在中心、价格合适、环境舒适以及歌手又不错的店。我们买了券，上面包含两杯酒，再单点了一杯，挑了最便宜的鸡尾酒。走之前我们都觉得很划算，听了将近3个小时的演唱会不说，还能够坐着喝酒，玩牌，最后也才不过花了不到55的价格。',
    imageSrc: '/assets/travel/beijing/shichahai-livehouse-night.jpeg',
    imageAlt: '悦界清吧',
  },
];

const DONGBEI_FOOD_CARD_ITEMS: FoodCardItem[] = [
  {
    eyebrow: '2月6日',
    title: '王厚元水饺',
    body: '刚出笼的水饺，它们的皮都很嫩，配合里面新鲜热乎的汤汁，确实是一绝。锅巴肉，又酥又脆又热乎，又是自己喜欢的甜味。可这甜味太重了些，吃了两个后就再也接受不了了。',
    imageSrc: '/assets/travel/dongbei/0206/c1.jpeg',
    imageAlt: '王厚元水饺',
  },
  {
    eyebrow: '2月7日',
    title: '东北盒饭',
    body: '中饭：走进了一家东北盒饭店，15元的自助，任你吃到饱。小店的经营形式颇像是学校的食堂，每个菜都用大的铁碗装，人们排队取餐，取出适宜的量放到自己的盘子里。',
    imageSrc: '/assets/travel/dongbei/0207/c1.jpeg',
    imageAlt: '东北盒饭',
  },
  {
    eyebrow: '2月8日',
    title: '地锅鸡',
    body: '鸡肉虽炖了很久，肉质还保持不烂，只是汤汁的味道却没有炖进肉里，吃起来就跟红烧鸡没有什么两样。',
    imageSrc: '/assets/travel/dongbei/0208/c3.jpeg',
    imageAlt: '地锅鸡',
  },
  {
    eyebrow: '2月9日',
    title: '韩式烧烤',
    body: '这是我们唯一一次在东北于炕上吃饭。最好吃的，就属烤肥肠了吧。外焦里嫩，多油多汁，咬下去又带着点劲道，实在是找不出别的肉能身兼这么多的优点。',
    imageSrc: '/assets/travel/dongbei/0209/c1.jpeg',
    imageAlt: '韩式烧烤',
  },
  {
    eyebrow: '2月11日',
    title: '拉面',
    body: '人均将近50的面，说是日式风味，可那汤底太过浓厚，一看便加了太多的调料，让人喝不下去；面也就正常的日式拉面，可食，但没有吃的乐趣。',
    imageSrc: '/assets/travel/dongbei/0211/c1.jpeg',
    imageAlt: '拉面',
  },
  {
    eyebrow: '2月11日',
    title: '乌拉火锅',
    body: '所谓乌拉火锅，只是在清水锅里加了些被晒干的海鲜罢了。端上来的肉，食材还算新鲜，整体口味不如老板娘服务态度来的出彩。',
    imageSrc: '/assets/travel/dongbei/0211/c2.jpeg',
    imageAlt: '乌拉火锅',
  },
  {
    eyebrow: '2月12日',
    title: '清汤牛肉面',
    body: '中饭是在高铁站解决的，一碗清汤牛肉面，配料只有些许的香菜。我的要求不高，只是缓解一下近期混乱不堪的饮食。',
    imageSrc: '/assets/travel/dongbei/0212/c1.jpeg',
    imageAlt: '清汤牛肉面',
  },
  {
    eyebrow: '2月12日',
    title: '俄式晚餐',
    body: '今天的晚饭还比不上一个面包。食物逃不开「廉价」的味道：黑椒牛柳的意大利面，前三口吃上去还挺香，可吃到后面，嘴里剩下的只有调料的味道。',
    imageSrc: '/assets/travel/dongbei/0212/c3.jpeg',
    imageAlt: '俄式晚餐',
  },
  {
    eyebrow: '2月13日',
    title: '红烧肉盖饭',
    body: '一碗简简单单的「红烧肉盖饭」，比东北盒饭还要令我满意的一顿中餐。我走进店，当我要用美团券时，被告知直接付上面的价格就好，第一次遇到如此直接的商家。',
    imageSrc: '/assets/travel/dongbei/0213/c1.jpeg',
    imageAlt: '红烧肉盖饭',
  },
  {
    eyebrow: '2月13日',
    title: '下午茶',
    body: '还没进门，就见到玻璃门后面的一只黑色猫咪，慵懒地躺在门垫上。店里放着音乐，但调低了音量，当作背景音；我的位置是一张舒适的沙发，只有店里的小猫们偶尔会来眷顾一下。',
    imageSrc: '/assets/travel/dongbei/0213/c2.jpeg',
    imageAlt: '下午茶',
  },
  {
    eyebrow: '2月14日',
    title: '双拼饭',
    body: '今晚吃的是「胡椒厨房」双拼饭。一碗将近四十的双拼饭，被端上来时，石锅里的油滋滋地响着，烤着那还半熟的鸡肉和牛肉。',
    imageSrc: '/assets/travel/dongbei/0214/c2.jpeg',
    imageAlt: '双拼饭',
  },
  {
    eyebrow: '2月14日',
    title: '夜宵烧烤',
    body: '一串烤肥肠、两穿鸡心、一串羊肉串和一串掌中宝。每一串都烤得恰到好处，表面滋出来的油汁，更是让它们显得闪闪发亮。肥肠又脆又香；掌中宝既软，却又带着点韧劲。',
    imageSrc: '/assets/travel/dongbei/0214/c3.jpeg',
    imageAlt: '夜宵烧烤',
  },
  {
    eyebrow: '2月15日',
    title: '狮子头砂锅',
    body: '当它端上来，我定睛一看，这个隐藏在汤里的狮子头，捞出来一看，比我一个拳头都TM的大。它事先被切成了四份，每一份都是家里一个正常大小的分量。',
    imageSrc: '/assets/travel/dongbei/0215/c1.jpeg',
    imageAlt: '狮子头砂锅',
  },
  {
    eyebrow: '2月15日',
    title: '珍粥道',
    body: '「黑米八宝粥」量很大，很粘稠；「水晶蒸饺」皮薄馅多，里面的虾仁味道新鲜；双皮奶味道也挺原汁原味的。',
    imageSrc: '/assets/travel/dongbei/0215/c3.jpeg',
    imageAlt: '珍粥道',
  },
  {
    eyebrow: '2月16日',
    title: '最后的简餐',
    body: '“老板，我要一盘兰州炒饭。” 和杭州吃过的炒饭不同，这里的炒饭口感要更硬一些。对于喜欢“吃软饭”的我来说，稍显难吃了一些。',
    imageSrc: '/assets/travel/dongbei/0216/c1.jpeg',
    imageAlt: '最后的简餐',
  },
];

export default function FoodSlider({ slug }: { slug?: string }) {
  const cards = useMemo(() => {
    if (slug === 'nanjing') return NANJING_FOOD_CARD_ITEMS;
    if (slug === 'shanghai') return SHANGHAI_FOOD_CARD_ITEMS;
    if (slug === 'beijing') return BEIJING_FOOD_CARD_ITEMS;
    if (slug === 'dongbei') return DONGBEI_FOOD_CARD_ITEMS;
    return JAPAN_FOOD_CARD_ITEMS;
  }, [slug]);
  const [startIndex, setStartIndex] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const maxStartIndex = Math.max(0, cards.length - VISIBLE_CARDS);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  const edgePeekOffsetPx = startIndex === 0 ? 0 : SIDE_PEEK_PX;
  const stepPx = CARD_WIDTH_PX + CARD_GAP_PX + SLIDE_FINE_TUNE_PX;
  const firstStepCorrectionPx = startIndex > 0 ? SIDE_PEEK_PX : 0;
  const translateX = MARGIN_PX + edgePeekOffsetPx - firstStepCorrectionPx - startIndex * stepPx;

  useEffect(() => {
    if (activeCard === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveCard(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeCard]);

  return (
    <div className="mt-8 w-full lg:max-w-[1150px]">
      <div className="relative left-[calc(50%-50vw)] w-screen overflow-x-hidden overflow-y-visible py-3">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${translateX}px)`,
            gap: `${CARD_GAP_PX}px`,
          }}
        >
          {cards.map((card, index) => {
            const cardId = index + 1;
            return (
              <button
                key={cardId}
                type="button"
                className="travel-card-hover-shell block text-left"
                style={{ flex: `0 0 ${CARD_WIDTH_PX}px` }}
                onClick={() => setActiveCard(cardId)}
                aria-label={`Open food card ${cardId}`}
              >
                <article className="overflow-hidden rounded-[1.9rem] bg-[rgba(245,245,247,1)] p-6" style={{ height: `${CARD_HEIGHT_REM}rem` }}>
                  <FoodCardContent card={card} />
                </article>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-[1.35rem]">
        <button
          type="button"
          onClick={handlePrev}
          disabled={startIndex === 0}
          aria-label="Previous"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[rgba(236,236,240,1)] hover:text-[rgba(104,104,108,1)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="photo-viewer-chevron photo-viewer-chevron--left scale-x-110 -translate-x-[1px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={startIndex === maxStartIndex}
          aria-label="Next"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[rgba(236,236,240,1)] hover:text-[rgba(104,104,108,1)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="photo-viewer-chevron photo-viewer-chevron--right scale-x-110 translate-x-[1px]" aria-hidden="true" />
        </button>
      </div>

      {activeCard !== null ? (
        <div
          className="fixed inset-0 z-[90] bg-[rgba(15,15,18,0.34)] p-6 backdrop-blur-[10px] sm:p-10 lg:p-14"
          onClick={() => setActiveCard(null)}
        >
          <div className="mx-auto h-full w-full max-w-[1280px]">
            <div
              className="relative h-full overflow-auto rounded-[2.1rem] bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-10 lg:p-12"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveCard(null)}
                aria-label="Close detail"
                className="absolute right-6 top-6 grid h-[2.26rem] w-[2.26rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:scale-[1.02] sm:right-8 sm:top-8"
              >
                <span className="photo-viewer-close-icon" aria-hidden="true" />
              </button>

              <div className="max-w-[42rem]">
                <p className="text-sm font-semibold text-neutral-800/80">美食详情</p>
                <h3 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                  {cards[activeCard - 1]?.title}
                </h3>
              </div>

              <div className="mt-8 rounded-[1.75rem] bg-[rgba(245,245,247,1)] p-8 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
                  <div className="overflow-hidden rounded-[1.35rem] bg-white">
                    <Image
                      src={cards[activeCard - 1]?.imageSrc ?? ''}
                      alt={cards[activeCard - 1]?.imageAlt ?? ''}
                      width={1400}
                      height={900}
                      className="h-[22rem] w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[0.95rem] font-semibold tracking-tight text-neutral-900">
                      {cards[activeCard - 1]?.eyebrow}
                    </p>
                    <p className="mt-4 text-[1rem] leading-[1.72] text-neutral-800">
                      {cards[activeCard - 1]?.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FoodCardContent({ card }: { card: FoodCardItem }) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isMultiLineTitle, setIsMultiLineTitle] = useState(false);

  useEffect(() => {
    const heading = titleRef.current;
    if (!heading) return;

    const updateTitleLineState = () => {
      const computedStyle = window.getComputedStyle(heading);
      const lineHeightPx = Number.parseFloat(computedStyle.lineHeight);
      if (!Number.isFinite(lineHeightPx) || lineHeightPx <= 0) {
        return;
      }
      const lineCount = Math.round(heading.scrollHeight / lineHeightPx);
      setIsMultiLineTitle(lineCount >= 2);
    };

    updateTitleLineState();
    const observer = new ResizeObserver(updateTitleLineState);
    observer.observe(heading);

    return () => {
      observer.disconnect();
    };
  }, [card.title]);

  const shouldAnchorImageBottom = card.body.length > 90 || isMultiLineTitle;
  const imageHeightClass = shouldAnchorImageBottom ? 'h-[11.2rem]' : 'h-[12.8rem]';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="text-[0.95rem] font-semibold tracking-tight text-neutral-900">{card.eyebrow}</p>
      <h3
        ref={titleRef}
        className={`mt-3 text-[1.5rem] font-semibold tracking-tight text-neutral-900 ${
          isMultiLineTitle ? 'leading-[1.43]' : 'leading-[1.1]'
        }`}
      >
        {card.title}
      </h3>
      <p className="mt-[1.23rem] text-[0.95rem] leading-[1.5] text-neutral-800">{card.body}</p>

      <div className="relative mt-auto overflow-hidden rounded-[1.35rem] bg-[rgba(245,245,247,1)]">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt}
          width={1400}
          height={900}
          className={`${imageHeightClass} w-full object-cover`}
        />
      </div>
    </div>
  );
}
