'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TravelCardExtractItem } from '@/lib/data/travel-card-extract';
import type { TravelExpandCard, TravelExpandMap } from '@/lib/types/travel-expand';

const VISIBLE_CARDS = 3;
const CARD_GAP_PX = 19.2;
const SIDE_PEEK_PX = 56;
const CARD_WIDTH_PX = 370.5;
const MARGIN_PX = 260;
const SLIDE_FINE_TUNE_PX = 0;
const CARD_HEIGHT_REM = 28;
const CARD_HEIGHT_MULTIPLIER = 1.1;
type CardItem = {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
};

const NANJING_CARD_ITEMS: CardItem[] = [
  {
    eyebrow: '前言',
    title: '当初是谁说要来南京的',
    body: '“当初是谁说要来南京的？” lucky嘟着嘴，收敛不住笑。是的，我已经记不清当初是谁第一个提出要来南京的，只记得要按照往年的惯例，和 lucky 在春节聚一聚。',
    imageSrc: '/assets/travel/nanjing-hero-wutong-street.jpg',
    imageAlt: '南京梧桐街景',
  },
  {
    eyebrow: '老门东',
    title: '走吧，没必要一直往里硬挤',
    body: '手是不好伸开的，脚是需要等待，才能向前迈一小步的；眼睛除了去看前面人的后脑勺，就只有街道两边开的商铺；一不留神，就找不到刚才还在一旁的阿呆了。',
    imageSrc: '/assets/travel/nanjing/nj-laomendong-crowd.jpg',
    imageAlt: '老门东人潮',
  },
  {
    eyebrow: '南京博物院',
    title: '看艺术作品是件私人的事',
    body: '看艺术作品是件私人的事，你得一个人看才行，我一边洗着手，一边想着。待再收到他们的消息时，我正在南京博物院的民国馆里走着。',
    imageSrc: '/assets/travel/nanjing/nj-nanjing-museum-caravaggio.jpeg',
    imageAlt: '南京博物院民国馆',
  },
  {
    eyebrow: '玄武湖',
    title: '你能帮我拍张照片吗',
    body: '我落在队伍后头，想用湖边的树作前景拍照。可我刚对着成片摇了摇头，身后就传来一位女士的声音：“不好意思，我相机落在家里了，你能帮我拍张照片吗？”',
    imageSrc: '/assets/travel/nanjing/nj-portrait-riverside-auntie.jpeg',
    imageAlt: '玄武湖边的人像拍摄',
  },
  {
    eyebrow: '先锋书店',
    title: '与老爹合照',
    body: '这些作家里，我读过的只有三位。分别是乔伊斯、陀思妥耶夫斯基，还有海明威，我最近在读的老爹。阿呆帮我和老爹照了张相。',
    imageSrc: '/assets/travel/nanjing/nj-portrait-korean-style-guy.jpeg',
    imageAlt: '先锋书店与海明威肖像',
  },
  {
    eyebrow: '夫子庙',
    title: '南京啊，我觉得不如…',
    body: '落日时分，红彤彤的太阳倒映在秦淮河上，几艘小型游船缓缓地开往岸边，船顶亮起橙黄的修饰灯，底下悬挂着红灯笼，湖面波光粼粼。',
    imageSrc: '/assets/travel/nanjing/nj-fuzimiao-night-crowd.jpg',
    imageAlt: '夫子庙夜景人潮',
  },
  {
    eyebrow: '红山动物园',
    title: '还好我结实，我直接给他顶回去了',
    body: '我站在原地，看着他怎样一步步穿过推搡的人群。直到一身因挤压有些变形的白色羽绒服，从黑色丛中钻出，沼泽地才把他吐了出来。',
    imageSrc: '/assets/travel/nanjing/nj-hongshan-zoo-entrance.jpg',
    imageAlt: '红山动物园入口',
  },
  {
    eyebrow: '小吃街与机车男',
    title: '随便骗骗咯',
    body: '那天晚上，我把 lucky 的 sd 卡插进电脑，在他一旁筛选照片。sd 卡显示 128GB，我又侧着看了 lucky 几眼，“看他那样子就知道他肯定不懂相机，随便骗骗咯。”',
    imageSrc: '/assets/travel/nanjing/nj-portrait-biker-man.jpeg',
    imageAlt: '机车男肖像',
  },
  {
    eyebrow: '鸡鸣寺',
    title: '虔诚的女人',
    body: '“保佑弟弟今年能考上一个好的大学。保佑爸爸身体健康，不要喝太多的酒。”她瞥了一眼手里的三炷香，确保它们笔直地朝向天上，在心里接着默念。',
    imageSrc: '/assets/travel/nanjing/nj-portrait-jiming-temple-prayer.jpeg',
    imageAlt: '鸡鸣寺祈愿',
  },
  {
    eyebrow: '中山陵',
    title: '一座巨大的墓碑',
    body: '临走前，在山顶往下眺望，天色灰濛濛的，白色透明的雨滴打在陵顶蓝色的屋顶上，人们仰着头，一致看向山顶，像是在瞻仰着什么。',
    imageSrc: '/assets/travel/nanjing/nj-zhongshanling-rain-steps.jpg',
    imageAlt: '中山陵雨天台阶',
  },
  {
    eyebrow: '明孝陵',
    title: '一个打着明国招牌、来圈钱的景点',
    body: '如果说中山陵是迈台阶去见蓝色宝盖的墓碑，明孝陵则是花钱去爬五层楼高的城墙。爬上去要穿过一个隧道，里面又黑又滑。',
    imageSrc: '/assets/travel/nanjing/nj-mingxiaoling-rain-wall.jpg',
    imageAlt: '明孝陵雨天城墙',
  },
];

const JAPAN_CARD_ITEMS: CardItem[] = [
  {
    eyebrow: '前言',
    title: '为什么不想写游记了呢',
    body: '为什么不想写游记了呢。是因为没有找到好的形式？过去总是流水账式地记下每时每刻所在做的事情。可新的形式又该怎么写呢？只记叙自己的观察和思考，最重要的自然是感受。',
    imageSrc: '/assets/travel/japan-front.jpeg',
    imageAlt: '为什么不想写游记了呢',
  },
  {
    eyebrow: '航程',
    title: '春秋航空没问题',
    body: '别看我们好像如上图所示一样，做好了一切出行的计划，期待着一场平稳落地的旅行；实际上，机票是出发10天前定下，电话卡5天前买好，京都的住宿3天前预约。',
    imageSrc: '/assets/travel/japan/01-flight-departure.jpeg',
    imageAlt: '春秋航空没问题',
  },
  {
    eyebrow: '高松',
    title: '我们上次来，也是这个老头',
    body: '那是一个上了年纪的中年人，黑白参半的头发、脸胖胖的，身上穿着蓝色的工作服，此刻正在巴士的入口，帮助旅客们搬运行李。',
    imageSrc: '/assets/travel/japan/02-takamatsu-rural-house.jpeg',
    imageAlt: '我们上次来，也是这个老头',
  },
  {
    eyebrow: '栗林公园',
    title: '在绿色的栗林公园吃红色的刨冰',
    body: '公园和中国江南的风景相似，它有着别雅的庭院：黑白格调的房屋旁，是笔挺的日本松、圆形的灌木丛和葱郁的草地。',
    imageSrc: '/assets/travel/japan/05-ritsurin-kakigori.jpeg',
    imageAlt: '在绿色的栗林公园吃红色的刨冰',
  },
  {
    eyebrow: '直岛',
    title: '海的那边就是直岛啊',
    body: '“海的那边就是直岛啊。” 我们三人站在港口铺上橙黄色的地砖上，看着眼前缓缓停靠的白色渡轮，惊叹远方天空和海水的蓝，那是不参杂任何杂质的蓝。',
    imageSrc: '/assets/travel/japan/07-naoshima-ferry-blue-sea.jpeg',
    imageAlt: '海的那边就是直岛啊',
  },
  {
    eyebrow: '直岛美术馆',
    title: '收获了一张最完美的建筑摄影',
    body: '在一个长7米宽5米的房间里，方形天花板上居中开了一个天窗，外面的阳光直射进来，作为空间的唯一光源。',
    imageSrc: '/assets/travel/japan/08-naoshima-museum-sign.jpeg',
    imageAlt: '收获了一张最完美的建筑摄影',
  },
  {
    eyebrow: '直岛徒步',
    title: '真是 fuck 季永伦了',
    body: '"真的不考虑租一辆自行车吗？" lucky朝向apate问到。那时我们正经过岛上的一家自行车店，门口整齐地摆放着自行车，银色的金属车身闪闪发亮。',
    imageSrc: '/assets/travel/japan/42-ferry-sunset-wide.jpeg',
    imageAlt: '真是 fuck 季永伦了',
  },
  {
    eyebrow: '返程',
    title: 'upgrade',
    body: '第一次见到他，是有事相求，我们要确定返船最晚的班次。那时我拿着手机翻译的日语，走向前台，看到他站在离前台不远的位置，好奇地打量着我。',
    imageSrc: '/assets/travel/japan/24-ferry-blue-hour.jpeg',
    imageAlt: 'upgrade',
  },
  {
    eyebrow: '屋岛',
    title: '一边打哈欠，一边拍夜景',
    body: '电车上，坐在我正前方的老爷爷，他下半身穿着黑色的皮鞋、蓝色条纹的长袜和黑色的长裤，上身搭配浅蓝色的条纹衬衫，脸上带着口罩，头上戴一顶米黄色的草帽。',
    imageSrc: '/assets/travel/japan/15-yashima-observatory.jpeg',
    imageAlt: '一边打哈欠，一边拍夜景',
  },
  {
    eyebrow: '京都',
    title: '伏见稻荷与清水寺',
    body: '京都是个很红的地方。在游览完景点后，红色会烙印在脑子里：不管是稻荷大社入口和大树齐高、开字型的红色鸟居，仿佛和人世划分界限，过了鸟居便是神明居住的地方。',
    imageSrc: '/assets/travel/japan/25-fushimi-inari-torii.jpeg',
    imageAlt: '伏见稻荷与清水寺',
  },
  {
    eyebrow: '清水寺',
    title: '俄国姑娘嘴里一直说着 perfect',
    body: '这张照片拍摄得并不好，人物逆光，显得脸和露出的手臂很黑；天空白得过亮。我是一点都不明白，为何离我五步远、站在一旁看着拍摄的俄国姑娘嘴里一直说着，perfect。',
    imageSrc: '/assets/travel/japan/28-kiyomizu-conan-shot.jpeg',
    imageAlt: '俄国姑娘嘴里一直说着 perfect',
  },
  {
    eyebrow: '鸭川',
    title: '什么才是京都的鸭川？',
    body: '河边的居酒屋灯火通明，灯光星星点点地连成一条线，屋外架起聚餐的高地，人们喝酒碰杯的哐当声，酒后抬高音量的说话声，夹杂在了土道旁的歌声里。',
    imageSrc: '/assets/travel/japan/30-kyoto-kamogawa-night.jpeg',
    imageAlt: '什么才是京都的鸭川？',
  },
  {
    eyebrow: '奈良',
    title: '我们这些人恐怕才是入侵者吧',
    body: '东大寺应该是我见过所有寺庙中，建筑风格最为气派的。它规格宏大，搭建的木材上锈迹斑斑，以经历时间考验后最真实的模样，面对着前来朝拜的人们。',
    imageSrc: '/assets/travel/japan/31-nara-deer-greeting.jpeg',
    imageAlt: '我们这些人恐怕才是入侵者吧',
  },
  {
    eyebrow: '奈良喂鹿',
    title: '这已经不再是喂食，而是向鹿们求饶',
    body: '整个下午，我都是在奈良公园度过的。从中饭的地方出发，穿过游客稀少的小径，我越往公园的方向走，人潮也就越来越密集，直到公园和街道的交界处达到顶峰。',
    imageSrc: '/assets/travel/japan/33-nara-luck-statue.jpeg',
    imageAlt: '这已经不再是喂食，而是向鹿们求饶',
  },
  {
    eyebrow: '奈良偶遇',
    title: '但她不知道的是其实我也不会日语',
    body: '坐在奈良公园的椅子上，看着一旁有三个上了年纪的老头们围在一起，在一辆自行车旁捣鼓着，好像在修车的样子；有几头鹿躺坐在树下阴凉的地方，稍远处的椅子空无一人。',
    imageSrc: '/assets/travel/japan/34-nara-portrait.jpeg',
    imageAlt: '但她不知道的是其实我也不会日语',
  },
  {
    eyebrow: '若草山',
    title: '像头被勾引的小鹿抵达山顶',
    body: '五点闭门之前，我在售票处用零钱换取了一张门票，坐在前台的是一个老爷爷，换票时看都没看我一眼。入口处，我将门票出示给检票员，过了闸机，来到一座种满植被的小山坡上。',
    imageSrc: '/assets/travel/japan/35-nara-mt-wakakusa-sunset.jpeg',
    imageAlt: '像头被勾引的小鹿抵达山顶',
  },
];

const SHANGHAI_CARD_ITEMS: CardItem[] = [
  {
    eyebrow: '前言',
    title: '该怎么组织游记的文字呢？',
    body: '该怎么组织游记的文字呢？以往总是按照时间顺序，事无巨细地记录下来，希望让以后的自己重读时，能重新捡起当时的回忆。',
    imageSrc: '/assets/travel/shanghai/story/bund-crowd-view.jpeg',
    imageAlt: '该怎么组织游记的文字呢？',
  },
  {
    eyebrow: '地铁',
    title: '精确到秒的上海地铁',
    body: '走得多，看得多，也算是一件好事。就像旅途最后一天，打出租车回民宿时，司机特别爱引用的一句话："读万卷书，不如行万里路。"',
    imageSrc: '/assets/travel/shanghai/story/metro-second-display.jpeg',
    imageAlt: '精确到秒的上海地铁',
  },
  {
    eyebrow: '车厢',
    title: '两小孩的国际象棋对局',
    body: '当我坐在地铁座位上时，看到两个年纪尚小、猜测刚上小学不久的孩子，居然手里拿着一副国际象棋棋盘。落座后，他们缓缓展开棋盘，把棋子一个个摆放到正确的位置上。',
    imageSrc: '/assets/travel/shanghai/story/metro-chess-kids.jpeg',
    imageAlt: '两小孩的国际象棋对局',
  },
  {
    eyebrow: '黄浦江',
    title: '夜骑 8 km',
    body: '夜晚的九点半我就在二楼的甲板等待，看着身旁和我一样的游客越来越多，直等到十点，船才从码头出发，耗时十分钟便停靠于江边了。',
    imageSrc: '/assets/travel/shanghai/story/huangpu-riverside-track.jpeg',
    imageAlt: '夜骑 8 km',
  },
  {
    eyebrow: '愚园路',
    title: '独自漫步',
    body: '在朋友赶来之前，我有大约一小时的自由时光。在这短短的时间里，我带着最强的好奇心，拿起放大镜，观察着上海愚园路的热闹街道。',
    imageSrc: '/assets/travel/shanghai/story/jingan-city-lawn.jpeg',
    imageAlt: '独自漫步',
  },
  {
    eyebrow: '静安寺',
    title: '静安寺至 Apple Store 的三人行',
    body: '与同伴们一同前行的好处是，可以分享所见所闻。虽然我感兴趣的，他们未必也有同样的兴趣，但归根结底，我们是同性，异性总能成为话题。',
    imageSrc: '/assets/travel/shanghai/story/jingan-apple-store.jpeg',
    imageAlt: '静安寺至 Apple Store 的三人行',
  },
  {
    eyebrow: '教堂',
    title: '偶遇法国人天主教洗礼',
    body: '在我的印象里，周日的教堂是给教徒做礼拜的日子，往往不对外开放。可我见到的这座，此刻却大门敞开，依稀能见到里面华丽的吊灯装饰。',
    imageSrc: '/assets/travel/shanghai/story/church-entrance.jpeg',
    imageAlt: '偶遇法国人天主教洗礼',
  },
  {
    eyebrow: '电影博物馆',
    title: '被打断的上海电影博物馆',
    body: '下到三楼，展示了五十到七十年代的更多影视作品。那段时光如此遥远，如果不是对刚成立的中国充满浓厚兴趣，怕是我不会专门去看。',
    imageSrc: '/assets/travel/shanghai/story/movie-museum-gate.jpeg',
    imageAlt: '被打断的上海电影博物馆',
  },
  {
    eyebrow: '外滩',
    title: '外滩打卡的失落',
    body: '其实，下午的漫步后，我和 Lucky 都有些疲惫了，走了快 1.5 万步，然而前程漫漫，外滩距离我们还有将近 3 公里，真是有苦说不出。',
    imageSrc: '/assets/travel/shanghai/story/bund-clocktower-night.jpeg',
    imageAlt: '外滩打卡的失落',
  },
  {
    eyebrow: '出租车',
    title: '与上海出租车司机的闲聊',
    body: '"这我就得跟你说了，人嘛，三十而立，古时候的话肯定有它的道理。三十岁，要有稳定的事业，建立家庭，这样才能说一个男人能立于社会上。"',
    imageSrc: '/assets/travel/shanghai/story/taxi-riverside-midnight.jpeg',
    imageAlt: '与上海出租车司机的闲聊',
  },
  {
    eyebrow: '迪士尼',
    title: '白天的迪士尼',
    body: '和兄弟们一起去迪士尼的那天，天气出奇地好。前一晚我还担心大家约得太随意，会不会有人睡过头，结果一切顺利，我们九点准时排队入园。',
    imageSrc: '/assets/travel/shanghai/story/disney-castle-day.jpeg',
    imageAlt: '白天的迪士尼',
  },
  {
    eyebrow: '烟花',
    title: '烟花的尾声',
    body: '我们今天的迪士尼之旅，也像烟花一样绚丽多彩 — 总功臣、发出邀请的lucky，翘班请假而来的掏粪，有着摄影特长的老头，暖心负责任的yd、胆小如鼠的apate，以及负责记录一切的我。',
    imageSrc: '/assets/travel/shanghai/story/disney-fireworks-castle.jpeg',
    imageAlt: '烟花的尾声',
  },
];

const DONGBEI_CARD_ITEMS: CardItem[] = [
  {
    eyebrow: '初到沈阳',
    title: '雪白和欢庆的世界',
    body: '第一次意识到自己已经来到了北方，是在飞机上。当我摘下耳机，刚从一场精彩的电影世界里走出来，抬头望向窗外时，我才意识到，曾几何时外面的景色已变成白茫茫的一片。',
    imageSrc: '/assets/travel/dongbei/0206/p1.jpeg',
    imageAlt: '雪白和欢庆的世界',
  },
  {
    eyebrow: '沈阳故宫',
    title: '实在没有可看的东西',
    body: '回头望去，沈阳故宫并没有给我留下任何印象。若不是有这些有限的照片合集，我定会想不起里面到底有些什么东西。即使有，也不过是些乱七八糟、不值得踱步停留观看的东西 。',
    imageSrc: '/assets/travel/dongbei/0207/c1.jpeg',
    imageAlt: '实在没有可看的东西',
  },
  {
    eyebrow: '冰雪新天地',
    title: '被砸的痛苦',
    body: '吃完中饭，我们打车到长春的冰雪新天地。据网上所说，这里是哈尔滨「冰雪大世界」的翻版，里面一样有冰雕，有为游客设立的雪上娱乐项目。可去完之后，我对其的总体评价不过尔尔。',
    imageSrc: '/assets/travel/dongbei/0208/c3.jpeg',
    imageAlt: '被砸的痛苦',
  },
  {
    eyebrow: '天定山',
    title: '体会到滑雪的快乐',
    body: '来之前，其实我对这样的行程安排曾有过质疑：下午玩了游乐园之后，晚上还会有体力去滑雪吗？可实际体验了之后才知道，下午的雪上项目称不上一点强度，不过是洒洒水花罢了 。',
    imageSrc: '/assets/travel/dongbei/0208/p8.jpeg',
    imageAlt: '体会到滑雪的快乐',
  },
  {
    eyebrow: '长白山',
    title: '速通老里克湖',
    body: '此趟来长白山之前，我就已经听我刚从东北回来的室友说过，那里的“老里克湖”就有如仙境，作为一个南方人，他第一次见到这么多的雪。',
    imageSrc: '/assets/travel/dongbei/changbai-portrait-white-fur-hat.jpeg',
    imageAlt: '速通老里克湖',
  },
  {
    eyebrow: '长白山',
    title: '早起去雾凇漂流',
    body: '早上好歹也起了早，想在下午离开前，最后一睹长白山景区的风景。整理好行李，搭上昨天相同司机的专车，我们前去了上午的目的地：雾凇漂流。',
    imageSrc: '/assets/travel/dongbei/changbai-portrait-earmuffs.jpeg',
    imageAlt: '早起去雾凇漂流',
  },
  {
    eyebrow: '北大湖',
    title: '拿命下来的中级道',
    body: '第一次听说这个地方，是从吉林搓澡工的口里得知的，他当时一得知来自南方的我们准备去北大湖滑雪时，就极力劝导我们，“别去了，那里是专业级别的赛道，很多滑雪比赛都在那里举行。”',
    imageSrc: '/assets/travel/dongbei/beidahu-snow-portrait.jpeg',
    imageAlt: '拿命下来的中级道',
  },
  {
    eyebrow: '哈尔滨夜景',
    title: '索菲亚教堂',
    body: '这个「索菲亚教堂」就在晚上餐厅的边上，走过去不到一公里。它边上有个很大的广场，夜晚的八点，正好举办着灯光秀的活动：只见五颜六色的光打在外表西式的建筑上。',
    imageSrc: '/assets/travel/dongbei/0212/p1.jpeg',
    imageAlt: '索菲亚教堂',
  },
  {
    eyebrow: '松花江',
    title: '行走在结冰的松花江',
    body: '来到昨晚结束的地方，当时天黑，只看到围栏底下是一个大型的游乐园，临近关门的时间，里面并没有多少人，我在路边还偶尔听到人们的谈论，“哈尔滨要开亚冬会...” 。',
    imageSrc: '/assets/travel/dongbei/0213/t2.jpeg',
    imageAlt: '行走在结冰的松花江',
  },
  {
    eyebrow: '哈尔滨大剧院',
    title: '初次欣赏戏剧《哈姆雷特》',
    body: '这个剧本，我在大约半年前读过。当时刚听完一期有关莎士比亚的播客，想着我居然这么多年都没有碰过他的经典，便随手拿了《哈姆雷特》去读 。',
    imageSrc: '/assets/travel/dongbei/0213/c2.jpeg',
    imageAlt: '初次欣赏戏剧《哈姆雷特》',
  },
  {
    eyebrow: '龙塔',
    title: '真有必要上这类塔嘛',
    body: '倒不是我真的想上这一类的高塔 - 那花了一张大米的门票、上去不过是看两眼就可以下来的地方，而是这附近已经没有别的游览项目了 。',
    imageSrc: '/assets/travel/dongbei/longta-night.jpeg',
    imageAlt: '真有必要上这类塔嘛',
  },
  {
    eyebrow: '哈尔滨漫步',
    title: '夜晚的城市漫步：松花江',
    body: '记得上午在哪里看到一个推荐本地「音乐长廊」的帖子，那里距离我有将近6km远，步行需要一个小时。而这正好符合我饭后散步的需要 。',
    imageSrc: '/assets/travel/dongbei/0215/t3.jpeg',
    imageAlt: '夜晚的城市漫步：松花江',
  },
  {
    eyebrow: '结尾',
    title: '此次东北旅行的总结',
    body: '也不是说非要写个总结，旅程才算真正的完结。只是在群里发完三人一起旅行的游记之后，被tf提醒了一下，我才想起，我本就有意去给这个游记加上真正的结尾：反思一下旅行的整体感受。',
    imageSrc: '/assets/travel/dongbei/harbin-window-snow-night.jpeg',
    imageAlt: '此次东北旅行的总结',
  },
];

const BEIJING_CARD_ITEMS: CardItem[] = [
  {
    eyebrow: '北京大学',
    title: '北京大学',
    body: '上午前去北京大学报道，当人脸能够直接刷进闸机，让自己产生了片刻的错觉，我能够成为一个北大学生，只不过为期2个星期。',
    imageSrc: '/assets/travel/beijing/pku-red-architecture.jpeg',
    imageAlt: '北京大学',
  },
  {
    eyebrow: '南锣鼓巷',
    title: '南锣鼓巷和天安门',
    body: '吃完晚饭后，我们便前往了附近的商业街：南锣鼓巷。提前看了大众点评上的评论，有一句总结的很好，"不来要后悔，来了也要后悔的地方"。',
    imageSrc: '/assets/travel/beijing/nanluo-sunglasses-cat.jpeg',
    imageAlt: '南锣鼓巷和天安门',
  },
  {
    eyebrow: '北大图书馆',
    title: '尝试进北大图书馆',
    body: '看来图书馆真的是一个学校的门面担当和身份认同的地方。暑期学校的学生，是没有资格进入这里的。',
    imageSrc: '/assets/travel/beijing/pku-library-outside.png',
    imageAlt: '尝试进北大图书馆',
  },
  {
    eyebrow: '清华园',
    title: '游清华园',
    body: '等到四点下课，我们一行三个人便前往了隔壁清华。我们从一个只有两个保安的小门进入，出示了北大的校园卡，就被放行了。',
    imageSrc: '/assets/travel/beijing/tsinghua-gate.png',
    imageAlt: '游清华园',
  },
  {
    eyebrow: '喜剧现场',
    title: '魔脱喜剧',
    body: '昨天就和呆傻说好，今天要面基，然后去看点只有老北京才有的东西。话剧似乎需要长时间的预约，那么就只剩下脱口秀了。',
    imageSrc: '/assets/travel/beijing/motuo-stage.png',
    imageAlt: '魔脱喜剧',
  },
  {
    eyebrow: '三里屯',
    title: '三里屯商业街',
    body: '这里是北京最大的三里屯商业街，前去的路上，迎面走来许多潮男潮女，这大概就是商业街的气息吧，哪里都是一样的',
    imageSrc: '/assets/travel/beijing/sanlitun-taikoo-li.png',
    imageAlt: '三里屯商业街',
  },
  {
    eyebrow: '出租车',
    title: '听北京老司机键政',
    body: '在来的路上，遇到一个挺有意思的司机，听声音，像是四五十岁的中年人。',
    imageSrc: '/assets/travel/beijing/taxi-driver-profile.jpeg',
    imageAlt: '听北京老司机键政',
  },
  {
    eyebrow: '圆明园',
    title: '游玩圆明园（走个过场）',
    body: '下午上课过程中，xmt问我晚上有什么安排，我犹豫了一下，告诉她我晚上打算去圆明园逛一下。',
    imageSrc: '/assets/travel/beijing/yuanmingyuan-stone-pavilion.jpeg',
    imageAlt: '游玩圆明园（走个过场）',
  },
  {
    eyebrow: '颐和园',
    title: '怒走颐和园',
    body: '有了上次和同伴们一起逛圆明园、自己却根本没有体会到一点漫步的快乐的经历后，我这次就选择独自前往颐和园',
    imageSrc: '/assets/travel/beijing/summer-palace-kunming-lake-overlook.jpeg',
    imageAlt: '怒走颐和园',
  },
  {
    eyebrow: '798',
    title: '798艺术区',
    body: '下午1点半，等公交的都是老爷爷和老太太们。逃离了外界的高温，躲进了车内，还幸运地有位置坐。',
    imageSrc: '/assets/travel/beijing/798-art-district-poster.jpeg',
    imageAlt: '798艺术区',
  },
  {
    eyebrow: '植物园',
    title: '植物园',
    body: '下午前去植物园，上午想了一圈，问了GPT一圈，也还是没有找到其他更好的去处。',
    imageSrc: '/assets/travel/beijing/botanical-garden-gate.jpeg',
    imageAlt: '植物园',
  },
  {
    eyebrow: '溜冰',
    title: '溜冰体验',
    body: '下课后，我们便去到了"国家速滑馆"，一样，北京还是那么喜欢在地名前面加上国家二字。检票进馆，一路上似乎没有见到很多人。',
    imageSrc: '/assets/travel/beijing/ice-skating-first-try.jpeg',
    imageAlt: '溜冰体验',
  },
];

export default function SpotSlider({
  slug,
  expandMap,
  extractItems,
}: {
  slug?: string;
  expandMap?: TravelExpandMap | null;
  extractItems?: TravelCardExtractItem[] | null;
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

    if (expandMap && Object.keys(expandMap).length > 0) {
      return buildCardItemsFromExpandMap(expandMap);
    }
    if (slug === 'japan') return JAPAN_CARD_ITEMS;
    if (slug === 'shanghai') return SHANGHAI_CARD_ITEMS;
    if (slug === 'dongbei') return DONGBEI_CARD_ITEMS;
    if (slug === 'beijing') return BEIJING_CARD_ITEMS;
    return NANJING_CARD_ITEMS;
  }, [slug, expandMap, extractItems]);
  const cardHeightRem = CARD_HEIGHT_REM * CARD_HEIGHT_MULTIPLIER;
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

  const activeCardData = activeCard !== null ? cards[activeCard - 1] : null;
  const activeExpandCard = activeCardData ? findBestExpandCard(activeCardData.title, activeCard, expandMap) : null;
  const detailBlocks =
    activeExpandCard && activeExpandCard.blocks.length > 0
      ? activeExpandCard.blocks.map((block) => ({
          text: block.body,
          imageSrc: block.imageSrc || activeCardData?.imageSrc || '',
          imageAlt: activeCardData?.imageAlt || activeCardData?.title || 'travel image',
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
              aria-label={`Open card ${cardId}`}
            >
              <article className="overflow-hidden rounded-[1.9rem] bg-white p-6" style={{ height: `${cardHeightRem}rem` }}>
                <CardContent card={card} />
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
          <span
            className="photo-viewer-chevron photo-viewer-chevron--left scale-x-110 -translate-x-[1px]"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={startIndex === maxStartIndex}
          aria-label="Next"
          className="grid h-[2.4rem] w-[2.4rem] place-items-center rounded-full bg-[rgba(236,236,240,1)] text-[rgba(104,104,108,1)] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[rgba(236,236,240,1)] hover:text-[rgba(104,104,108,1)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span
            className="photo-viewer-chevron photo-viewer-chevron--right scale-x-110 translate-x-[1px]"
            aria-hidden="true"
          />
        </button>
      </div>

      {activeCard !== null ? (
        <div
          className="fixed inset-0 z-[90] overflow-y-auto bg-[rgba(15,15,18,0.34)] p-6 backdrop-blur-[10px] sm:p-10 lg:p-14"
          onClick={() => setActiveCard(null)}
        >
          <div className="mx-auto w-full max-w-[1280px]">
            <div
              className="relative rounded-[2.1rem] bg-white p-7 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-10 lg:p-12"
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

              <div className="mx-[1rem] max-w-[42rem] sm:mx-[1.57rem] lg:mx-[2.09rem]">
                <p className="text-base font-semibold text-[rgba(29,29,31,1)]">
                  {activeExpandCard?.eyebrow || cards[activeCard - 1]?.eyebrow}
                </p>
                <h3 className="mt-3 text-[2.375rem] font-semibold leading-[1.2] tracking-tight text-[rgba(29,29,31,1)] sm:text-[3.125rem]">
                  {cards[activeCard - 1]?.title}
                </h3>
              </div>

              <div className="mt-16 mx-[1rem] space-y-5 sm:mx-[1.57rem] sm:space-y-6 lg:mx-[2.09rem]">
                {detailBlocks.map((block, blockIndex) => (
                  <div
                    key={`${activeCardData?.title ?? 'detail'}-${blockIndex}`}
                    className="min-h-[28rem] rounded-[1.75rem] bg-[rgba(245,245,247,1)] px-24 pt-12 pb-8 sm:min-h-[30rem] sm:px-[7.5rem] sm:pt-[3.75rem] sm:pb-10"
                  >
                    <div className="space-y-12">
                      <p className="w-full whitespace-pre-line text-[1.25rem] leading-[1.9] tracking-[0.01em] text-[rgba(29,29,31,1)]">
                        {block.text}
                      </p>
                      <div className="mx-4 overflow-hidden rounded-[1.35rem] sm:mx-5">
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

function buildCardItemsFromExpandMap(expandMap: TravelExpandMap): CardItem[] {
  return Object.values(expandMap)
    .sort((a, b) => a.cardIndex - b.cardIndex)
    .map((card: TravelExpandCard) => {
      const firstBlock = card.blocks[0];
      const firstParagraph = firstBlock?.body?.split(/\n\s*\n/).find((line) => line.trim().length > 0) ?? '';

      return {
        eyebrow: card.eyebrow || card.cardName,
        title: card.title,
        body: firstParagraph,
        imageSrc: firstBlock?.imageSrc || '',
        imageAlt: card.title,
      };
    });
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

function CardContent({
  card,
}: {
  card: {
    eyebrow: string;
    title: string;
    body: string;
    imageSrc: string;
    imageAlt: string;
  };
}) {
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
  const imageHeightClass = shouldAnchorImageBottom ? 'h-[12.3rem]' : 'h-[14.1rem]';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="text-[0.95rem] font-semibold tracking-tight text-neutral-900">{card.eyebrow}</p>
      <h3
        ref={titleRef}
        className={`mt-3 text-[1.5rem] font-semibold tracking-tight text-neutral-900 ${isMultiLineTitle ? 'leading-[1.43]' : 'leading-[1.1]'}`}
      >
        {card.title}
      </h3>
      <p className="mt-[1.32rem] text-[0.95rem] leading-[1.5] text-neutral-800">{card.body}</p>

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
          ? 'h-[86vh] w-full object-cover object-[50%_40%]'
          : 'h-auto w-full object-contain'
      }
    />
  );
}
