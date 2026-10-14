# Checkout — Lo-fi Wireframe (planning reference for a future week)

```
┌──────────────────────────────────────────────────────────┐
│ Logo            NorthlineGoods                              │
├──────────────────────────────────────────────────────────┤
│  Cart ── Shipping ── Payment ── Confirmation   (step bar)    │
│                                                              │
│   ┌────────────────────────────┐                            │
│   │  Step form fields           │                            │
│   │  (varies per step)          │                            │
│   └────────────────────────────┘                            │
│                                                              │
│   [ ← Back ]                          [ Continue → ]        │
├──────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────┘
```

## Notes
- Captured now for architectural planning only — **not implemented in Week 1**.
- State machine (XState): `cart → shipping → payment → confirmation`, with
  guarded transitions and the ability to navigate back without losing state.
