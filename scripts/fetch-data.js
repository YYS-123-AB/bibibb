import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

const origins = ['德', '日', '美', '中', '英', '法', '韩', '意'];
const vehicleClasses = ['微型车', '小型车', '紧凑型', '中型车', '中大型', '大型车', 'SUV', 'MPV', '跑车', '皮卡'];
const energyTypes = ['fuel', 'hybrid', 'phev', 'bev', 'erev', 'h2'];

const carBrands = {
  '德': [
    { brand: '奔驰', logo: '🔱', manufacturers: ['北京奔驰', '进口奔驰'] },
    { brand: '宝马', logo: '🚗', manufacturers: ['华晨宝马', '进口宝马'] },
    { brand: '奥迪', logo: '🏎️', manufacturers: ['一汽奥迪', '进口奥迪'] },
    { brand: '大众', logo: '🚙', manufacturers: ['一汽大众', '上汽大众'] },
    { brand: '保时捷', logo: '🏁', manufacturers: ['保时捷'] },
  ],
  '日': [
    { brand: '丰田', logo: '🚘', manufacturers: ['一汽丰田', '广汽丰田'] },
    { brand: '本田', logo: '🚗', manufacturers: ['东风本田', '广汽本田'] },
    { brand: '日产', logo: '🚙', manufacturers: ['东风日产'] },
    { brand: '马自达', logo: '🏎️', manufacturers: ['长安马自达', '一汽马自达'] },
    { brand: '雷克萨斯', logo: '🔱', manufacturers: ['雷克萨斯'] },
  ],
  '美': [
    { brand: '特斯拉', logo: '⚡', manufacturers: ['特斯拉'] },
    { brand: '别克', logo: '🚗', manufacturers: ['上汽通用别克'] },
    { brand: '福特', logo: '🚙', manufacturers: ['长安福特'] },
    { brand: '雪佛兰', logo: '🏎️', manufacturers: ['上汽通用雪佛兰'] },
    { brand: '凯迪拉克', logo: '🔱', manufacturers: ['上汽通用凯迪拉克'] },
  ],
  '中': [
    { brand: '比亚迪', logo: '🐉', manufacturers: ['比亚迪'] },
    { brand: '蔚来', logo: '🌟', manufacturers: ['蔚来'] },
    { brand: '小鹏', logo: '🦅', manufacturers: ['小鹏'] },
    { brand: '理想', logo: '💡', manufacturers: ['理想'] },
    { brand: '吉利', logo: '🚗', manufacturers: ['吉利汽车'] },
    { brand: '长城', logo: '🛡️', manufacturers: ['长城汽车'] },
    { brand: '长安', logo: '🚙', manufacturers: ['长安汽车'] },
  ],
  '英': [
    { brand: '路虎', logo: '🔱', manufacturers: ['奇瑞捷豹路虎'] },
    { brand: '捷豹', logo: '🐆', manufacturers: ['奇瑞捷豹路虎'] },
    { brand: '宾利', logo: '💎', manufacturers: ['宾利'] },
    { brand: '劳斯莱斯', logo: '👑', manufacturers: ['劳斯莱斯'] },
    { brand: '迈凯伦', logo: '🏁', manufacturers: ['迈凯伦'] },
  ],
  '法': [
    { brand: '标致', logo: '🦁', manufacturers: ['东风标致'] },
    { brand: '雪铁龙', logo: '🚗', manufacturers: ['东风雪铁龙'] },
    { brand: 'DS', logo: '💎', manufacturers: ['DS汽车'] },
    { brand: '雷诺', logo: '💎', manufacturers: ['雷诺'] },
    { brand: '布加迪', logo: '🏁', manufacturers: ['布加迪'] },
  ],
  '韩': [
    { brand: '现代', logo: '🚗', manufacturers: ['北京现代'] },
    { brand: '起亚', logo: '🚙', manufacturers: ['东风悦达起亚'] },
    { brand: '捷尼赛思', logo: '🔱', manufacturers: ['捷尼赛思'] },
    { brand: '三星', logo: '💎', manufacturers: ['雷诺三星'] },
    { brand: '双龙', logo: '🐉', manufacturers: ['双龙汽车'] },
  ],
  '意': [
    { brand: '法拉利', logo: '🏁', manufacturers: ['法拉利'] },
    { brand: '兰博基尼', logo: '🐂', manufacturers: ['兰博基尼'] },
    { brand: '玛莎拉蒂', logo: '🔱', manufacturers: ['玛莎拉蒂'] },
    { brand: '帕加尼', logo: '💎', manufacturers: ['帕加尼'] },
    { brand: '阿尔法·罗密欧', logo: '🚗', manufacturers: ['阿尔法·罗密欧'] },
  ],
};

const configHighlights = [
  { icon: '🤖', text: 'L2+ 智能驾驶辅助' },
  { icon: '🛡️', text: '10 安全气囊系统' },
  { icon: '🌌', text: '全景可开启天窗' },
  { icon: '🔥', text: '前排座椅加热/通风' },
  { icon: '🎯', text: '自动泊车入位' },
  { icon: '📱', text: 'CarPlay/CarLife 互联' },
  { icon: '🔊', text: '宝华韦健音响' },
  { icon: '🌡️', text: '四区自动空调' },
  { icon: '💡', text: '矩阵 LED 大灯' },
  { icon: '🔋', text: '无线充电板' },
  { icon: '📷', text: '360 全景影像' },
  { icon: '🛣️', text: 'HUD 抬头显示' },
  { icon: '🔒', text: '无钥匙进入/启动' },
  { icon: '🧭', text: 'AR 实景导航' },
  { icon: '🎮', text: '后排娱乐系统' },
  { icon: '🪟', text: '双层隔音玻璃' },
  { icon: '⚙️', text: '空气悬挂系统' },
  { icon: '🎨', text: 'Nappa 真皮座椅' },
];

const prosList = [
  '动力响应迅猛，加速体验出色',
  '底盘调校扎实，操控稳定性强',
  '内饰用料考究，豪华感营造到位',
  '储物空间丰富，日常使用便捷',
  'NVH 控制优秀，静谧性极佳',
  '油耗表现优异，燃油经济性好',
  '保值率高，二手车市场受欢迎',
  '智能车机流畅，功能丰富实用',
  '座椅乘坐舒适，长途不累',
  '安全配置齐全，驾驶更放心',
  '外观设计时尚，回头率高',
  '通过性强，适合复杂路况',
  '品牌认可度高，有面子',
  '空间宽敞，家用商务皆宜',
  '续航扎实，纯电出行无忧',
];

const consList = [
  '优惠幅度小，性价比一般',
  '胎噪偏大，高速行驶明显',
  '车机偶有卡顿，有待优化',
  '后排中间地台凸起影响乘坐',
  '保养成本偏高，后期支出大',
  '内饰设计陈旧，缺乏新意',
  '车漆较薄，容易产生划痕',
  '储物格设计不合理，用着不便',
  '倒车影像清晰度有待提升',
  '悬架偏硬，过减速带颠簸明显',
  '转向偏重，女性驾驶稍费力',
  '低速换挡偶有顿挫感',
  '配置分配不均，低配太素',
  '快充速度一般，需耐心等待',
  '后排头部空间偏小，局促感明显',
];

const modelNames = [
  'A3', 'A4L', 'A6L', 'A8L', 'Q3', 'Q5L', 'Q7', '3系', '5系', '7系', 'X1', 'X3', 'X5',
  'C级', 'E级', 'S级', 'GLC', 'GLE', 'GLS', '速腾', '迈腾', '帕萨特', '途观L', '途昂',
  '卡罗拉', '凯美瑞', '亚洲龙', '汉兰达', 'RAV4', '思域', '雅阁', 'CR-V', '冠道',
  '轩逸', '天籁', '奇骏', '途乐', '昂克赛拉', '阿特兹', 'CX-5', 'Model 3', 'Model Y',
  'Model S', 'Model X', '君越', '昂科威', 'GL8', '蒙迪欧', '锐界', '探险者', '迈锐宝',
  '汉', '唐', '宋', '元', '海豚', '海豹', 'ES6', 'ES8', 'ET7', 'P7', 'G9', 'L9', 'L8',
  'L7', '博越', '星越', '哈弗H6', '坦克300', '坦克500', 'CS75', 'UNI-K',
  '揽胜', '揽运', '发现', 'XEL', 'XFL', 'F-PACE', '飞驰', '慕尚', '添越',
  '508', '4008', '5008', '凡尔赛', '天逸', '途胜', '胜达', '索纳塔', 'K5', '智跑',
  '488', 'F8', 'SF90', 'Huracan', 'Urus', 'Aventador', 'Ghibli', 'Levante', '总裁',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function randomSubset(arr, count) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = randomInt(0, copy.length - 1);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function getPriceRange(priceMin, priceMax) {
  return `¥${priceMin}-${priceMax}万`;
}

function generateCars() {
  const cars = [];
  let id = 1;

  let energyCounter = 0;
  for (const origin of origins) {
    const brands = carBrands[origin];
    for (const brandInfo of brands) {
      for (let v = 0; v < 3; v++) {
        const vehicleClass = vehicleClasses[(id + v) % vehicleClasses.length];
        const energyType = energyTypes[energyCounter % energyTypes.length];
        energyCounter++;
        const priceBuckets = [5, 12, 22, 38, 55, 85];
        const priceMin = priceBuckets[(id + v) % 6];
        const priceMax = priceMin + randomInt(5, 40);
        const isNewEnergy = ['hybrid', 'phev', 'bev', 'erev', 'h2'].includes(energyType);

        const suffixMap = { fuel: '', hybrid: ' 混动', phev: ' PHEV', bev: ' EV', erev: ' 增程', h2: ' 氢能' };
        const modelName = modelNames[id % modelNames.length] + suffixMap[energyType];

        const car = {
          id: id++,
          brand: brandInfo.brand,
          brandLogoEmoji: brandInfo.logo,
          model: modelName,
          manufacturer: randomItem(brandInfo.manufacturers),
          originCountry: origin,
          origin: origin,
          vehicleClass: vehicleClass,
          energyType: energyType,
          priceRange: getPriceRange(priceMin, priceMax),
          priceMinWan: priceMin,
          priceMaxWan: priceMax,
          rating: (randomInt(38, 50) / 10),
          hotScore: randomInt(1000, 99999),
          cover: `https://picsum.photos/seed/car${id}/800/600`,
          images: [
            `https://picsum.photos/seed/car${id}a/1200/800`,
            `https://picsum.photos/seed/car${id}b/1200/800`,
            `https://picsum.photos/seed/car${id}c/1200/800`,
            `https://picsum.photos/seed/car${id}d/1200/800`,
          ],
          dimensions: {
            length: randomInt(3600, 5600),
            width: randomInt(1600, 2100),
            height: randomInt(1400, 1950),
            wheelbase: randomInt(2300, 3400),
          },
          seats: [4, 5, 6, 7][id % 4],
          trunkL: randomInt(300, 2500),
          powertrain: {
            engine: energyType === 'bev' || energyType === 'h2' ? null : `${randomInt(100, 300) / 10}L ${randomItem(['L4', 'V6', 'V8', 'L3', 'H4'])} ${randomItem(['自然吸气', '涡轮增压', '双涡轮增压'])}`,
            motor: energyType === 'fuel' ? null : `永磁同步 ${randomInt(80, 450)}kW`,
            maxPowerKW: randomInt(80, 550),
            maxTorqueNM: randomInt(150, 900),
            gearbox: energyType === 'bev' ? '单速固定齿比变速箱' : randomItem(['7速双离合', '8AT', '9AT', '10AT', 'CVT无级变速', '6速手自一体']),
            driveType: randomItem(['前置前驱', '前置四驱', '后置后驱', '中置四驱', '双电机四驱', '三电机四驱']),
            suspensionFront: randomItem(['麦弗逊独立悬挂', '双叉臂独立悬挂', '多连杆独立悬挂']),
            suspensionRear: randomItem(['多连杆独立悬挂', '扭力梁非独立', '双叉臂独立悬挂', '空气悬挂']),
            brakeFront: randomItem(['通风盘式', '陶瓷通风盘式']),
            brakeRear: randomItem(['盘式', '通风盘式']),
          },
          highlights: randomSubset(configHighlights, 10),
          energyCons: {
            wltcL100km: energyType === 'bev' || energyType === 'h2' ? null : (randomInt(40, 150) / 10),
            cltcRangeKM: ['fuel'].includes(energyType) ? null : randomInt(250, 1200),
            batteryKWH: ['fuel', 'hybrid', 'h2'].includes(energyType) ? null : (randomInt(150, 1300) / 10),
            fastChargeMin: ['fuel', 'hybrid'].includes(energyType) ? null : randomInt(15, 120),
          },
          pros: randomSubset(prosList, 5),
          cons: randomSubset(consList, 5),
          isNewEnergy: isNewEnergy,
          relatedIds: [],
          tags: randomSubset(['热销', '新能源', '豪华', '家用', '性能', '越野', '商务', '科技', '省油', '舒适', '安全', '智能'], randomInt(1, 4)),
        };

        cars.push(car);
      }
    }
  }

  for (const car of cars) {
    const sameBrand = cars.filter(c => c.brand === car.brand && c.id !== car.id);
    const samePrice = cars.filter(c => {
      const avg = (c.priceMinWan + c.priceMaxWan) / 2;
      const carAvg = (car.priceMinWan + car.priceMaxWan) / 2;
      return Math.abs(avg - carAvg) <= 15 && c.id !== car.id;
    });
    const related = [...new Set([...sameBrand.slice(0, 3), ...samePrice.slice(0, 3)])];
    car.relatedIds = related.slice(0, 6).map(c => c.id);
  }

  return cars;
}

function fetchRemoteData() {
  return new Promise((resolve, reject) => {
    const urls = [
      'https://raw.githubusercontent.com/some/car-data/main/data.json',
    ];
    const url = urls[0];
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 5000);

    try {
      const req = https.get(url, (res) => {
        clearTimeout(timeout);
        if (res.statusCode !== 200) {
          reject(new Error(`Status: ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', () => {
        clearTimeout(timeout);
        reject(new Error('Network error'));
      });
    } catch (e) {
      clearTimeout(timeout);
      reject(e);
    }
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  console.log('🚗 正在获取车型数据...');

  ensureDir(DATA_DIR);

  let cars = null;
  try {
    cars = await fetchRemoteData();
    if (!Array.isArray(cars) || cars.length < 10) {
      throw new Error('Invalid data format');
    }
    console.log(`✅ 远程数据获取成功，共 ${cars.length} 款车型`);
  } catch (err) {
    console.log(`⚠️  远程数据获取失败: ${err.message}`);
    console.log('🔄 正在生成示例数据...');
    cars = generateCars();
    console.log(`✅ 示例数据生成成功，共 ${cars.length} 款车型`);
  }

  const output = {
    generateTime: new Date().toISOString(),
    version: '1.0.0',
    total: cars.length,
    cars: cars,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`📁 数据已保存到: ${DATA_FILE}`);
}

main().catch((err) => {
  console.error('❌ 处理失败:', err);
  process.exit(1);
});
