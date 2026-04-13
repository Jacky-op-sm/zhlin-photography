'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TravelFoodExtractItem } from '@/lib/data/travel-food-extract';
import type { TravelExpandMap } from '@/lib/types/travel-expand';

const VISIBLE_CARDS = 3;
const CARD_GAP_PX = 19.2;
const SIDE_PEEK_PX = 56;
const CARD_WIDTH_PX = 370.5;
const MARGIN_PX = 260;
const SLIDE_FINE_TUNE_PX = 0;
const CARD_HEIGHT_REM = 28;
const CARD_HEIGHT_MULTIPLIER = 1.1;
const MOBILE_BREAKPOINT_PX = 768;

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
    body: '除了被加收15%的管理费之外，北大的食堂确实很良心，第一次就想尝试一下北京的卤味，番茄牛腩的肉分量也很多，简直是ZJU不能比的。',
    imageSrc: '/assets/travel/beijing/food-0701-lunch.png',
    imageAlt: '北大食堂',
  },
  {
    eyebrow: '北京',
    title: '紫光园',
    body: '第一次吃北京正宗的烤鸭，留下了不错的印象，虽然鸭子的皮和肉和家里的差不太多，可这个卷起来的面皮，却是家里远不能比的。',
    imageSrc: '/assets/travel/beijing/beijing-roast-duck-dinner.jpeg',
    imageAlt: '紫光园',
  },
  {
    eyebrow: '清华园',
    title: '清华园早餐',
    body: '今天去吃的是包子店，这家连锁的店在北京似乎很常见。包子的价格不贵，6元/3个，倒是这个豆浆的价格，有点离谱，一碗需要6块钱。',
    imageSrc: '/assets/travel/beijing/food-0702-breakfast.png',
    imageAlt: '清华园早餐',
  },
  {
    eyebrow: '中关村',
    title: '中关村快餐',
    body: '找到了这家快餐店，里面人流量很多，人们吃完就走，看评价似乎还算不错的样子，毕竟对得起这个价格。我点的这个套餐只要20元，已经是吃的足够好了。',
    imageSrc: '/assets/travel/beijing/food-0702-zhongguancun.png',
    imageAlt: '中关村快餐',
  },
  {
    eyebrow: '清华园',
    title: '玉树园餐厅',
    body: '这家对外开放的玉树园餐厅，定位有点像浙大里面的麦斯威，座椅不是普通的学校大众食堂，吃的也相对精致一些。难得的，像是回到了在自己学校吃饭的样子。',
    imageSrc: '/assets/travel/beijing/food-0702-yushuyuan.png',
    imageAlt: '玉树园餐厅',
  },
  {
    eyebrow: '北京',
    title: '门框胡同百年卤煮',
    body: '一般，太一般了。炸酱面的口味正如呆傻所说，跟家里的豆瓣酱丝毫吃不出区别，上面的萝卜丝啊、黄瓜丝啊，都是素的，一点荤的都没有看到，但是面却巨多。',
    imageSrc: '/assets/travel/beijing/food-0703-luzhu.png',
    imageAlt: '门框胡同百年卤煮',
  },
  {
    eyebrow: '北京',
    title: '李先生牛肉面',
    body: '兜兜转转，去了一家卖面的地方，买了套餐券，神奇的是居然可以自己扫码核销。面中规中矩吧，唯一对得起它的价格的是，它有足够的真的牛肉粒。',
    imageSrc: '/assets/travel/beijing/food-0704-noodle.png',
    imageAlt: '李先生牛肉面',
  },
  {
    eyebrow: '北京',
    title: '南门涮肉',
    body: '这是一家似乎来北京，就一定要尝试的店。和家里火锅不同的是，铜锅里面放的是干干净净的水。肉每盘的分量都很足够，数量平均起码在20片以上。',
    imageSrc: '/assets/travel/beijing/food-0704-shuanrou.png',
    imageAlt: '南门涮肉',
  },
  {
    eyebrow: '北京',
    title: 'The Woods 轻食',
    body: '端上来的食物非常西式，净是一些烤蔬菜、烤水果、炒饭之类的东西，还有半只烤鸡。东西摆盘得不错，饮品是一杯牛油果奶昔。',
    imageSrc: '/assets/travel/beijing/food-0705-thewoods.png',
    imageAlt: 'The Woods 轻食',
  },
  {
    eyebrow: '北京',
    title: '重八牛府',
    body: '第一次吃麻酱，感到的是惊艳；第二次吃，就觉得是常规了。晚上肉啊、牛肉丸啊、其他蔬菜啊，只能用中规中矩来形容吧。没有惊艳的感觉。',
    imageSrc: '/assets/travel/beijing/food-0706-hotpot.png',
    imageAlt: '重八牛府',
  },
  {
    eyebrow: '什刹海',
    title: '悦界清吧',
    body: '晚上和呆傻在这家“悦界”喝酒听歌。走之前我们都觉得很划算，听了将近3个小时的演唱会不说，还能够坐着喝酒，玩牌，最后也才不过花了不到55的价格。',
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

export default function FoodSlider({
  slug,
  expandMap,
  extractItems,
}: {
  slug?: string;
  expandMap?: TravelExpandMap | null;
  extractItems?: TravelFoodExtractItem[] | null;
}) {
  const cards = useMemo(() => {
    if (extractItems && extractItems.length > 0) {
      return extractItems.map((item) => ({
        eyebrow: item.eyebrow,
        title: item.title,
        body: item.body,
        imageSrc: item.imageSrc,
        imageAlt: item.title,
      }));
    }

    if (slug === 'nanjing') return NANJING_FOOD_CARD_ITEMS;
    if (slug === 'shanghai') return SHANGHAI_FOOD_CARD_ITEMS;
    if (slug === 'beijing') return BEIJING_FOOD_CARD_ITEMS;
    if (slug === 'dongbei') return DONGBEI_FOOD_CARD_ITEMS;
    return JAPAN_FOOD_CARD_ITEMS;
  }, [slug, extractItems]);
  const [viewportWidth, setViewportWidth] = useState<number>(1200);
  const [startIndex, setStartIndex] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const isMobile = viewportWidth < MOBILE_BREAKPOINT_PX;
  const visibleCards = isMobile ? 1 : VISIBLE_CARDS;
  const cardGapPx = isMobile ? 12 : CARD_GAP_PX;
  const sidePeekPx = isMobile ? 20 : SIDE_PEEK_PX;
  const cardWidthPx = isMobile
    ? Math.max(248, Math.min(360, viewportWidth - 52))
    : CARD_WIDTH_PX;
  const marginPx = isMobile ? 16 : MARGIN_PX;
  const maxStartIndex = Math.max(0, cards.length - visibleCards);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  const edgePeekOffsetPx = startIndex === 0 ? 0 : sidePeekPx;
  const stepPx = cardWidthPx + cardGapPx + SLIDE_FINE_TUNE_PX;
  const firstStepCorrectionPx = startIndex > 0 ? sidePeekPx : 0;
  const translateX = marginPx + edgePeekOffsetPx - firstStepCorrectionPx - startIndex * stepPx;

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth, { passive: true });
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  useEffect(() => {
    setStartIndex((prev) => Math.min(prev, maxStartIndex));
  }, [maxStartIndex]);

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

  const activeCardData = activeCard !== null ? cards[activeCard - 1] : null;
  const activeExpandCard = activeCardData ? findBestExpandCard(activeCardData.title, activeCard, expandMap) : null;
  const detailBlocks =
    activeExpandCard && activeExpandCard.blocks.length > 0
      ? activeExpandCard.blocks.map((block) => ({
          text: block.body,
          imageSrc: block.imageSrc || activeCardData?.imageSrc || '',
          imageAlt: activeCardData?.imageAlt || activeCardData?.title || 'food image',
        }))
      : [
          {
            text: activeCardData?.body ?? '',
            imageSrc: activeCardData?.imageSrc ?? '',
            imageAlt: activeCardData?.imageAlt ?? '',
          },
        ];

  return (
    <div className="mt-8 w-full lg:max-w-[1150px]">
      <div className="relative left-[calc(50%-50vw)] w-screen overflow-x-hidden overflow-y-visible py-3">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${translateX}px)`,
            gap: `${cardGapPx}px`,
          }}
        >
          {cards.map((card, index) => {
            const cardId = index + 1;
            return (
            <button
              key={cardId}
              type="button"
              className="travel-card-hover-shell block text-left"
              style={{ flex: `0 0 ${cardWidthPx}px` }}
              onClick={() => setActiveCard(cardId)}
              aria-label={`Open food card ${cardId}`}
            >
              <article
                className="overflow-hidden rounded-[1.9rem] bg-[rgba(245,245,247,1)] p-6"
                style={{ height: `${CARD_HEIGHT_REM * CARD_HEIGHT_MULTIPLIER}rem` }}
              >
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
          className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(15,15,18,0.34)] p-3 backdrop-blur-[10px] sm:p-10 lg:p-14"
          onClick={() => setActiveCard(null)}
        >
          <div className="mx-auto w-full max-w-[1280px]">
            <div
              className="relative rounded-[1.5rem] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:rounded-[2.1rem] sm:p-10 lg:p-12"
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

              <div className="mx-0 max-w-[42rem] sm:mx-[1.57rem] lg:mx-[2.09rem]">
                <p className="text-sm font-semibold text-[rgba(29,29,31,1)] sm:text-base">
                  {activeExpandCard?.eyebrow || cards[activeCard - 1]?.eyebrow}
                </p>
                <h3 className="mt-2 text-[2rem] font-semibold leading-[1.18] tracking-tight text-[rgba(29,29,31,1)] sm:mt-3 sm:text-[3.125rem]">
                  {activeExpandCard?.title || cards[activeCard - 1]?.title}
                </h3>
              </div>

              <div className="mt-8 mx-0 space-y-4 sm:mt-16 sm:mx-[1.57rem] sm:space-y-6 lg:mx-[2.09rem]">
                {detailBlocks.map((block, blockIndex) => (
                  <div
                    key={`${activeCardData?.title ?? 'detail'}-${blockIndex}`}
                    className="rounded-[1.2rem] bg-[rgba(245,245,247,1)] px-5 pb-5 pt-6 sm:min-h-[30rem] sm:rounded-[1.75rem] sm:px-[4.25rem] sm:pb-10 sm:pt-[3.25rem] lg:px-[7.5rem] lg:pt-[3.75rem]"
                  >
                    <div className="space-y-6 sm:space-y-10 lg:space-y-12">
                      <p className="w-full whitespace-pre-line text-[1rem] leading-[1.8] tracking-[0.01em] text-[rgba(29,29,31,1)] sm:text-[1.15rem] lg:text-[1.25rem]">
                        {block.text}
                      </p>
                      <div className="mx-0 overflow-hidden rounded-[1rem] sm:mx-3 sm:rounded-[1.35rem] lg:mx-5">
                        <DetailImage src={block.imageSrc} alt={block.imageAlt} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function findBestExpandCard(title: string, cardIndex: number | null, expandMap?: TravelExpandMap | null) {
  if (!expandMap) return null;
  const cards = Object.values(expandMap);
  if (cards.length === 0) return null;

  const normalizedTitle = normalizeCompareText(title);
  const exactMatch = cards.find((card) => normalizeCompareText(card.title) === normalizedTitle);
  if (exactMatch) return exactMatch;

  const fuzzyMatch = cards.find((card) => {
    const target = normalizeCompareText(card.title);
    return target.includes(normalizedTitle) || normalizedTitle.includes(target);
  });
  if (fuzzyMatch) return fuzzyMatch;

  if (cardIndex !== null) {
    const indexMatch = cards.find((card) => card.cardIndex === cardIndex);
    if (indexMatch) return indexMatch;
  }

  return null;
}

function normalizeCompareText(text: string): string {
  return text.replace(/\s+/g, '').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '').toLowerCase();
}

function DetailImage({ src, alt }: { src: string; alt: string }) {
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <Image
      src={src}
      alt={alt}
      width={1400}
      height={900}
      onLoadingComplete={(img) => {
        setIsPortrait(img.naturalHeight > img.naturalWidth);
      }}
      className={
        isPortrait
          ? 'h-[55vh] w-full object-cover object-[50%_40%] sm:h-[70vh] lg:h-[86vh]'
          : 'h-auto max-h-[50vh] w-full object-contain sm:max-h-[70vh] lg:max-h-none'
      }
    />
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
  const imageHeightClass = shouldAnchorImageBottom
    ? 'h-[11.3rem] sm:h-[12.3rem]'
    : 'h-[12.9rem] sm:h-[14.1rem]';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="text-[0.85rem] font-semibold tracking-tight text-neutral-900 sm:text-[0.95rem]">{card.eyebrow}</p>
      <h3
        ref={titleRef}
        className={`mt-3 text-[1.3rem] font-semibold tracking-tight text-neutral-900 sm:text-[1.5rem] ${
          isMultiLineTitle ? 'leading-[1.38]' : 'leading-[1.1]'
        }`}
      >
        {card.title}
      </h3>
      <p className="mt-4 text-[0.9rem] leading-[1.52] text-neutral-800 sm:mt-[1.32rem] sm:text-[0.95rem]">{card.body}</p>

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
