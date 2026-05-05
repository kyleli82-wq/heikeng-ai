export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { season, weather, temp, wind, fish, depth, fishstatus, rod, line, method } = req.body;

  if (!season) {
    return res.status(400).json({ error: '缺少参数' });
  }

  const prompt = `你是一个专业的黑坑钓鱼顾问，请根据以下条件给出详细的作钓建议：

【环境条件】
- 季节：${season}
- 天气：${weather}
- 气温：${temp}°C
- 风力：${wind}

【鱼塘信息】
- 目标鱼种：${fish}
- 水深：${depth}
- 最近鱼情：${fishstatus}

【钓手装备】
- 竿长：${rod}
- 线组：${line}
- 钓法：${method}

请按以下格式回答（不要用markdown，不要用#号标题，直接用文字）：

第一行：今日鱼情评级（只写"鱼情极佳"、"鱼情良好"、"鱼情一般"或"鱼情较差"其中一个）
第二行：浮漂调钓建议（一句话，20字以内）
第三行：饵料建议（一句话，20字以内）
空一行
然后写4-5条具体作钓建议，每条前面加"•"符号，每条80字以内，语气像老钓友在指导新手。`;

  try {
    const response = await fetch('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: '你是专业黑坑钓鱼顾问，熟悉各种钓法、饵料搭配和鱼情判断。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MiniMax error:', data);
      return res.status(500).json({ error: 'AI 服务异常，请稍后重试' });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ result: text });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
