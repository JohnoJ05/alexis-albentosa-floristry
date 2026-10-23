# Alexis Albentosa Floristry

Mobile-first website for Alexis Albentosa Floristry — weddings & events, North Yorkshire.

Plain HTML, CSS and JavaScript. No build step, so it can be hosted as-is (e.g. GitHub Pages).

## Pages

| File | Page |
| --- | --- |
| `index.html` | Welcome — hero, what I do, gallery preview, where I'm based, reviews |
| `about.html` | About — story timeline, brand values, services, how it works |
| `portfolio.html` | Portfolio — filterable gallery, featured weddings, brands, reviews |
| `enquire.html` | Enquiries — three-step form that opens a pre-filled email |

Shared styles live in `assets/css/styles.css` and behaviour (menu drawer, swipe carousels, tabs, accordion, gallery filter, enquiry form) in `assets/js/main.js`.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Filling in content

Text in `[SQUARE BRACKETS]` is a placeholder to replace with real copy.

- **Photos** — tinted shapes (`.ph`, `.oval`, `.work-item`) are photo placeholders. Put an `<img>` inside each one; it fills the shape.
- **Portfolio filter** — each `.work-item` in `portfolio.html` needs `data-cat="Weddings"`, `"Events"` or `"Commercial"`.
- **Enquiry email** — set `data-email` on the form in `enquire.html`, and replace `[EMAIL]` / `[EMAIL ADDRESS]` in every page footer.
- **Colours** — tokens are at the top of `styles.css`.
