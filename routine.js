export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const PAGE_IDS = {
    0: '349bce28e7f9812eb1eaf7dc04f7060c', // Sunday
    1: '349bce28e7f98163a43aca08a206db6e', // Monday
    2: '349bce28e7f981b48a02d1ad33c05a35', // Tuesday
    3: '349bce28e7f981838af9feeff1363b10', // Wednesday
    4: '349bce28e7f981f08927f6494f566c9f', // Thursday
    5: '349bce28e7f9818f9311cc96ca74e548', // Friday
    6: '349bce28e7f98100a97ae858593d02ab', // Saturday
  };

  const day = req.query.day !== undefined ? parseInt(req.query.day) : new Date().getDay();
  const pageId = PAGE_IDS[day];

  try {
    // Fetch all blocks from the page
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
        'Notion-Version': '2022-06-28',
      }
    });

    const data = await response.json();

    // For each table block, fetch its children (the rows)
    const blocks = [];
    for (const block of data.results) {
      if (block.type === 'table') {
        const rowsRes = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`, {
          headers: {
            'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
            'Notion-Version': '2022-06-28',
          }
        });
        const rowsData = await rowsRes.json();
        block._rows = rowsData.results;
      }
      // For column_list, fetch children columns and their children
      if (block.type === 'column_list') {
        const colsRes = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children?page_size=100`, {
          headers: {
            'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
            'Notion-Version': '2022-06-28',
          }
        });
        const colsData = await colsRes.json();
        block._columns = [];
        for (const col of colsData.results) {
          const colChildRes = await fetch(`https://api.notion.com/v1/blocks/${col.id}/children?page_size=100`, {
            headers: {
              'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
              'Notion-Version': '2022-06-28',
            }
          });
          const colChildData = await colChildRes.json();
          // Fetch table rows inside columns
          const colBlocks = [];
          for (const b of colChildData.results) {
            if (b.type === 'table') {
              const rRes = await fetch(`https://api.notion.com/v1/blocks/${b.id}/children?page_size=100`, {
                headers: {
                  'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
                  'Notion-Version': '2022-06-28',
                }
              });
              const rData = await rRes.json();
              b._rows = rData.results;
            }
            colBlocks.push(b);
          }
          block._columns.push(colBlocks);
        }
      }
      blocks.push(block);
    }

    res.status(200).json({ blocks, day });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
