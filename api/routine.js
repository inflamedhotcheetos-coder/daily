export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const PAGE_IDS = {
    0: '349bce28-e7f9-812e-b1ea-f7dc04f7060c',
    1: '349bce28-e7f9-8163-a43a-ca08a206db6e',
    2: '349bce28-e7f9-81b4-8a02-d1ad33c05a35',
    3: '349bce28-e7f9-8183-8af9-feeff1363b10',
    4: '349bce28-e7f9-81f0-8927-f6494f566c9f',
    5: '349bce28-e7f9-818f-9311-cc96ca74e548',
    6: '349bce28-e7f9-8100-a97a-e858593d02ab',
  };

  const day = req.query.day !== undefined ? parseInt(req.query.day) : new Date().getDay();
  const pageId = PAGE_IDS[day];

  const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
      'Notion-Version': '2022-06-28',
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}
