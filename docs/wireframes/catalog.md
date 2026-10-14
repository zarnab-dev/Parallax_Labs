# Catalog — Lo-fi Wireframe

```
┌──────────────────────────────────────────────────────────┐
│ Logo            NorthlineGoods         [☀/🌙]  [🛒 Cart]  │
├──────────────────────────────────────────────────────────┤
│ Shop all products                                          │
│ 52 products                                                 │
│                                                              │
│ [ Search products…      ]  [Category ▾]        [▦][≡]      │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ image  │  │ image  │  │ image  │  │ image  │            │
│  │ title  │  │ title  │  │ title  │  │ title  │            │
│  │ ★4.2   │  │ ★4.2   │  │ ★4.2   │  │ ★4.2   │            │
│  │ $49.00 │  │ $49.00 │  │ $49.00 │  │ $49.00 │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │  ...   │  │  ...   │  │  ...   │  │  ...   │            │
│  └────────┘  └────────┘  └────────┘  └────────┘            │
│                                                              │
├──────────────────────────────────────────────────────────┤
│ Footer                                                       │
└──────────────────────────────────────────────────────────┘
```

## Notes
- Mobile-first: single column search/filter stack (search full-width, category
  below), 2-column product grid on small screens, up to 4 columns at desktop.
- List view replaces the card grid with horizontal rows (image left, details
  right) — same data, same components, different layout via `ViewToggle`.
- Loading state: skeleton cards replace product cards 1:1, same grid shape.
- Empty/error states occupy the same content region as the grid.
