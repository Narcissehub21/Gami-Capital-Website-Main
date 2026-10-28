// Vercel Function: GET /api/block
// Latest Ethereum block number for the status bar on the home page.
// Fetched server side so visitors' browsers never contact a third-party node,
// and cached at the edge for 10 seconds so the node sees at most a few requests a minute.

const RPC = process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com';

export async function GET() {
  try {
    const r = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      signal: AbortSignal.timeout(4000),
    });
    const j = await r.json();
    const block = parseInt(j.result, 16);
    if (!block) throw new Error('no block');
    return Response.json({ block }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=30' } });
  } catch {
    return Response.json({ block: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
