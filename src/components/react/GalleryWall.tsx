import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Dialog, Modal, ModalOverlay, ToggleButton, ToggleButtonGroup } from 'react-aria-components';
import { Icon } from './Icon';
import '../../styles/gallery.css';

export interface WallItem {
  id: string;
  alt: string;
  caption: string;
  cat: string;
  ratio: number;
  thumb: { src: string; srcset: string; width: number; height: number };
  full: { src: string; srcset: string; width: number; height: number; maxDisplay: number };
}

export default function GalleryWall({ items, cats }: { items: WallItem[]; cats: string[] }) {
  const [cat, setCat] = useState<string>('All');
  const [open, setOpen] = useState<number | null>(null);
  const shown = cat === 'All' ? items : items.filter((i) => i.cat === cat);
  const count = (c: string) => (c === 'All' ? items.length : items.filter((i) => i.cat === c).length);
  const opener = useRef<HTMLElement | null>(null);

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + shown.length) % shown.length)), [shown.length]);
  const cur = open !== null ? shown[open] : null;
  const sx = useRef<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, go]);

  return (
    <div className="gb-wall">
      <div className="gb-filter" role="group" aria-label="Filter photos by catch">
        <ToggleButtonGroup
          className="gb-filter__group"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[cat]}
          onSelectionChange={(k) => setCat(String([...k][0] ?? 'All'))}
        >
          {['All', ...cats].map((c) => (
            <ToggleButton key={c} id={c} className="gb-chip">
              {c}
              <span className="gb-chip__n">{count(c)}</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <p className="gb-filter__status" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      <ul className="gb-plates" key={cat}>
        {shown.map((it, i) => (
          <li className="gb-plate" key={it.id} style={{ ['--i' as string]: i, ['--tilt' as string]: `${[-0.8, 0.6, -0.4, 0.9][i % 4]}deg` }}>
            <figure>
              <Button
                className="gb-plate__btn"
                aria-label={`Enlarge photo: ${it.caption}`}
                onPress={() => setOpen(i)}
                ref={(el) => { if (open === i) opener.current = el; }}
              >
                <img
                  src={it.thumb.src}
                  srcSet={it.thumb.srcset}
                  sizes="(min-width: 900px) 380px, (min-width: 560px) 46vw, 92vw"
                  width={it.thumb.width}
                  height={it.thumb.height}
                  alt={it.alt}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  fetchPriority={i < 2 ? 'high' : undefined}
                  decoding="async"
                  draggable={false}
                />
                <span className="gb-plate__zoom" aria-hidden="true"><Icon name="sparkle" size={18} /></span>
              </Button>
              <figcaption>
                <span>{it.caption}</span>
                <span className="gb-plate__cat">{it.cat}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <ModalOverlay className="gb-lb" isDismissable isOpen={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <Modal className="gb-lb__modal">
          <Dialog
            className="gb-lb__dialog"
            aria-label={cur ? `Photo viewer: ${cur.caption}` : 'Photo viewer'}
          >
            {({ close }) =>
              cur && (
                <>
                  <Button className="gb-lb__close" slot="close" aria-label="Close photo viewer" onPress={close}>
                    <Icon name="close" size={22} />
                  </Button>
                  <div
                    className="gb-lb__stage"
                    onPointerDown={(e) => { sx.current = e.clientX; }}
                    onPointerUp={(e) => {
                      if (sx.current === null) return;
                      const dx = e.clientX - sx.current;
                      sx.current = null;
                      if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
                    }}
                    onPointerCancel={() => { sx.current = null; }}
                  >
                    <img
                      key={cur.id}
                      className="gb-lb__img"
                      src={cur.full.src}
                      srcSet={cur.full.srcset}
                      sizes={`(max-width: ${cur.full.maxDisplay + 32}px) calc(100vw - 48px), ${cur.full.maxDisplay - 16}px`}
                      width={cur.full.width}
                      height={cur.full.height}
                      alt={cur.alt}
                      draggable={false}
                      style={{ ['--md' as string]: `${cur.full.maxDisplay}px`, aspectRatio: `${cur.full.width} / ${cur.full.height}` }}
                    />
                  </div>
                  <div className="gb-lb__bar">
                    <Button className="gb-lb__nav gb-lb__nav--prev" aria-label="Previous photo" onPress={() => go(-1)}>
                      <Icon name="arrowRight" size={24} className="gb-flip" />
                    </Button>
                    <p className="gb-lb__cap">
                      <strong>{cur.caption}</strong>
                      <span>{(open ?? 0) + 1} of {shown.length}</span>
                    </p>
                    <Button className="gb-lb__nav gb-lb__nav--next" aria-label="Next photo" onPress={() => go(1)}>
                      <Icon name="arrowRight" size={24} />
                    </Button>
                  </div>
                </>
              )
            }
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
