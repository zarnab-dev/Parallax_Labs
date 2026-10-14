# Cart — Lo-fi Wireframe (planning reference for a future week)

```
┌──────────────────────────────────────────────────────────┐
│ Logo            NorthlineGoods         [☀/🌙]  [🛒 Cart]  │
├──────────────────────────────────────────────────────────┤
│ Your cart                                                    │
│                                                              │
│  ┌────┐ Product title           Qty [– 1 +]   $49.00  [x]   │
│  │img │ Size M                                               │
│  └────┘                                                     │
│  ┌────┐ Product title           Qty [– 2 +]   $98.00  [x]   │
│  │img │ Size L                                               │
│  └────┘                                                     │
│                                                              │
│                                          Subtotal   $147.00  │
│                                          [ Checkout → ]      │
├──────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────┘
```

## Notes
- Captured now for architectural planning only — **not implemented in Week 1**.
- Quantity stepper drives optimistic UI updates with rollback (later week).
- "Checkout →" enters the XState machine: Cart → Shipping → Payment → Confirmation.
