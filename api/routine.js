export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const PAGE_IDS = {
    0: '349bce28-e7f9-812e-b1ea-f7dc04f7060c',
    1: '349bce28-e7f9-8163-a43a-ca08a206db6e',
    2: '349bce28-e7f9-81b4-8a02-d1ad33c05a35',
    3: '349bce28-e7f9-8183-8af9-feeff1363b10',
    4: '349bce28-e7f9-81f0-8927-f6494f566c9f',
    5: '349bce28-e7f9-818f-9311-cc96ca74e548',
    6: '349bce28-e7f9-8100-a97a-e858593d02ab',
  };

  const day = req.query.day !== undefined ? parseInt(req.query.day) : new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })).getDay();
  const pageId = PAGE_IDS[day];

  try {
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_SECRET}`,
        'Notion-Version': '2022-06-28',
      }
    });
    const data = await response.json();
    const blocks = [];
    for (const block of data.results) {
      if (block.type === 'column_list') {
       if (block.type === 'column_list') {
  const cols = await fetchChildren(block.id);
  block._columns = [];
  for (const col of cols.results) {
    const colChildren = await fetchChildren(col.id);
    const colBlocks = [];
    for (const b of colChildren.results) {
      if (b.type === 'synced_block') {
        const syncedId = b.synced_block?.synced_from?.block_id || b.id;
        const syncedChildren = await fetchChildren(syncedId);
        for (const sb of syncedChildren.results) {
          if (sb.type === 'table') {
            const rows = await fetchChildren(sb.id);
            sb._rows = rows.results;
          }
          colBlocks.push(sb);
        }
      } else if (b.type === 'table') {
        const rows = await fetchChildren(b.id);
        b._rows = rows.results;
        colBlocks.push(b);
      } else {
        colBlocks.push(b);
      }
    }
    block._columns.push(colBlocks);
  }
} else if (block.type === 'heading_2' || block.type === 'table') {
  if (block.type === 'table') {
    const rows = await fetchChildren(block.id);
    block._rows = rows.results;
  }
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
