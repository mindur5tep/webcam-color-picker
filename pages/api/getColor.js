import { connectToDatabase } from '../../lib/mongodb';  // 连接 MongoDB 的库

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 连接到数据库
      const { db } = await connectToDatabase();

      // 获取数据库中的最新颜色数据（按创建时间排序，获取最新的一个）
      const colorData = await db.collection('colors')
        .find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      if (colorData.length === 0) {
        return res.status(404).json({ message: 'No color data found' });
      }

      // 获取最新颜色数据
      const { rgb, hsl } = colorData[0];

      // 计算亮度值（lightness）
      const lightness = hsl.l;  // 假设数据库已经存储了亮度值（[0, 1]）

      // 构建返回的数据
      const result = {
        red: rgb.r,
        green: rgb.g,
        blue: rgb.b,
        lightness: lightness
      };

      // 返回数据
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching color:', error);
      res.status(500).json({ message: 'Error fetching color' });
    }
  } else {
    // 如果请求方法不是 GET，则返回 405 Method Not Allowed
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
