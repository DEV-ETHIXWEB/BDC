import { useEffect, useState } from 'react';
import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components';
import '../../styles/widgets.css';
import { Icon } from './Icon';
import { Crest, G } from './wd-shared';
import { SITE } from '../../data/site';

interface Props {
  nav: readonly { label: string; href: string }[];
  phone: string;
  phoneHref: string;
}

export default function MobileMenu({ nav, phone, phoneHref }: Props) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState('');

  useEffect(() => {
    const sync = () => setPath(location.pathname);
    sync();
    document.addEventListener('astro:page-load', sync);
    // The desktop nav takes over at 1080px, so an open menu must not linger past it.
    const mq = window.matchMedia('(min-width: 1080px)');
    const on = () => mq.matches && setOpen(false);
    mq.addEventListener('change', on);
    return () => { document.removeEventListener('astro:page-load', sync); mq.removeEventListener('change', on); };
  }, []);

  const current = (href: string) => path === href || path.startsWith(href + '/');

  return (
    <DialogTrigger isOpen={open} onOpenChange={setOpen}>
      <Button className="menu-trigger wd-menu-btn" aria-label="Open menu">
        <span className="wd-burger" aria-hidden="true"><i /><i /><i /></span>
      </Button>
      <ModalOverlay className="wd-menu-overlay" isDismissable>
        <Modal className="wd-menu">
          <Dialog className="wd-menu__dialog" aria-label="Site menu">
            {({ close }) => (
              <>
                <svg className="wd-menu__contours" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <path key={i} d={`M-40 ${520 + i * 46} C 120 ${430 + i * 40}, 240 ${640 + i * 30}, 420 ${540 + i * 40} S 700 ${420 + i * 46}, 860 ${500 + i * 36}`} />
                  ))}
                </svg>
                <div className="wd-menu__top">
                  <a className="wd-menu__brand" href="/" onClick={close} aria-label={`${SITE.name} home`}>
                    <Crest size={44} />
                    <span>BDC GUIDE SERVICE</span>
                  </a>
                  <Heading slot="title" className="sr-only">Menu</Heading>
                  <Button className="wd-menu__close" aria-label="Close menu" onPress={close}>
                    <Icon name="close" size={22} />
                  </Button>
                </div>

                <nav className="wd-menu__nav" aria-label="Site">
                  <ul>
                    {nav.map((n, i) => (
                      <li key={n.href} style={{ ['--i' as string]: i }}>
                        <a href={n.href} aria-current={current(n.href) ? 'page' : undefined} onClick={close}>{n.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="wd-menu__foot" style={{ ['--i' as string]: nav.length }}>
                  <a className="wd-menu__call" href={phoneHref}><G name="call" size={22} /><span><small>Call Captain Clinton</small><b>{phone}</b></span></a>
                  <a className="wd-menu__book" href="/oregon-fishing-charter-rates" onClick={close}>Book a trip</a>
                  <p className="wd-menu__addr">
                    <a href={`mailto:${SITE.email}`}><G name="mail" size={16} />{SITE.email}</a>
                    <span><G name="pin" size={16} />{SITE.address.city}, {SITE.address.region}</span>
                  </p>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
