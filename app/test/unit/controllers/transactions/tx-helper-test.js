/* eslint-disable */
const assert = require('assert')
const txHelper = require('../../../ui/lib/tx-helper')

describe('txHelper', () => {
  it('always shows the oldest tx first', () => {
    const metamaskNetworkId = 1
    const txs = {
      a: { metamaskNetworkId, time: 3 },
      b: { metamaskNetworkId, time: 1 },
      c: { metamaskNetworkId, time: 2 }
    }

    const sorted = txHelper(txs, null, null, metamaskNetworkId)
    assert.strictEqual(sorted[0].time, 1, 'oldest tx first')
    assert.strictEqual(sorted[2].time, 3, 'newest tx last')
  })
})
