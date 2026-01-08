# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

5BLOC is an introductory project for blockchain application development using QuickNode's Ethereum JSON-RPC API.

## QuickNode API Usage

The project uses QuickNode endpoints for Ethereum interactions. Example request to get the latest block number:

```bash
curl -X POST YOUR_QUICKNODE_ENDPOINT_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Replace `YOUR_QUICKNODE_ENDPOINT_URL` with an actual QuickNode endpoint.

## Reference

- QuickNode Ethereum Quickstart: https://www.quicknode.com/docs/ethereum/quickstart
