# 5BLOC - Introduction to Blockchain Apps Creation

We will use [QuickNode](https://www.quicknode.com/docs/ethereum/quickstart) for Ethereum API access.

## 1. Check cURL Installation

Most *nix based systems have cURL support out of the box. Open your terminal and check the cURL version by running:

```bash
curl --version
```

## 2. Send a JSON-RPC Request

In your terminal, copy and paste the following cURL command to retrieve the latest block number:

```bash
curl -X POST YOUR_QUICKNODE_ENDPOINT_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

> **Note:** Replace `YOUR_QUICKNODE_ENDPOINT_URL` with your actual QuickNode endpoint.

## 3. Sample Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x1234567"
}
```
