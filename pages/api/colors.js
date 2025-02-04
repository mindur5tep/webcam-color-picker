// pages/api/colors.js
import { connectToDatabase } from "../../lib/mongodb"; // 你需要配置 MongoDB

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uuid, hex, rgb, hsl } = req.body;

    // 连接到数据库（假设使用 MongoDB）
    const { db } = await connectToDatabase();

    try {
      // 插入颜色数据到数据库
      const colorData = {
        uuid,
        hex,
        rgb,
        hsl,
        createdAt: new Date(),
      };

      await db.collection("colors").insertOne(colorData);

      // 返回成功响应
      res.status(200).json({ message: "Color saved successfully" });
    } catch (error) {
      console.error("Error saving color:", error);
      res.status(500).json({ message: "Error saving color" });
    }
  } else {
    // 如果不是 POST 请求，返回 405 Method Not Allowed
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
