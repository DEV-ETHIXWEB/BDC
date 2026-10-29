// Markdown posts get the same furniture the hand-built .astro pages have, without the author
// writing any HTML.
//
// Two jobs:
//  1. A paragraph holding nothing but an image becomes the frame of a <figure class="pg-shot">,
//     and the alt text is repeated as a visible caption. The post photos are portrait phone shots
//     (3:4, see PHOTO_META), so at the 68ch prose width they run about 900px tall and a reader
//     scrolls a whole screen past one picture. The frame crops them to a letterbox plate instead.
//  2. Top-level structural blocks get data-reveal so they animate in on scroll, per the motion
//     contract in docs/design-system.md. Paragraphs are deliberately left alone: revealing every
//     one of them makes a long article twitch the whole way down.
//
// This is a Sätteri hast plugin rather than a rehype one. `markdown.rehypePlugins` still works in
// Astro 7, but only by swapping the whole processor back to unified, which would re-render the
// existing posts through a different pipeline for no gain.
//
// The image node is wrapped, never moved: Astro resolves markdown images through its own hast
// plugins, and lifting the <img> out of its paragraph risks invalidating that.
import { defineHastPlugin } from 'satteri';

const REVEAL = { h2: 'up', h3: 'up', ul: 'fade', ol: 'fade', blockquote: 'fade', table: 'fade' };
const FILTER = ['p', ...Object.keys(REVEAL)];

const isBlank = (n) => n?.type === 'text' && !n.value.trim();

/** The one image inside a paragraph, or null when the paragraph holds anything else. */
function loneImage(node) {
  const kids = (node.children || []).filter((c) => !isBlank(c));
  // An image wrapped in a link is a deliberate choice by the author; leave it as written.
  return kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img' ? kids[0] : null;
}

export const articleFurniture = defineHastPlugin({
  name: 'bdc-article-furniture',
  element: {
    filter: FILTER,
    visit(node, ctx) {
      // Only the blocks the author wrote at the top level of the post. A list nested inside
      // another block is part of that block and reveals with it.
      if (ctx.parent(node)?.type !== 'root') return;

      if (node.tagName === 'p') {
        const img = loneImage(node);
        if (!img) return;
        const alt = typeof img.properties?.alt === 'string' ? img.properties.alt.trim() : '';
        ctx.wrapNode(node, {
          type: 'element',
          tagName: 'figure',
          properties: { className: ['pg-shot'], 'data-reveal': 'scale' },
          // Declared children are kept after the wrapped node, giving figure > [frame, caption].
          children: alt
            ? [{
                type: 'element',
                tagName: 'figcaption',
                // The <img> still carries this text as its alt, so don't read it out twice.
                properties: { 'aria-hidden': 'true' },
                children: [{ type: 'text', value: alt }],
              }]
            : [],
        });
        ctx.setProperty(node, 'className', ['pg-shot__frame']);
        return;
      }

      if (!node.properties?.['data-reveal']) ctx.setProperty(node, 'data-reveal', REVEAL[node.tagName]);
    },
  },
});

export default articleFurniture;
