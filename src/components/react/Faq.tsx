import { Button, Disclosure, DisclosureGroup, DisclosurePanel, Heading } from 'react-aria-components';
import '../../styles/gallery.css';

export default function Faq({ items, openFirst = true }: { items: readonly { q: string; a: string }[]; openFirst?: boolean }) {
  return (
    <DisclosureGroup className="gb-faq" defaultExpandedKeys={openFirst ? ['q0'] : []}>
      {items.map((f, i) => (
        <Disclosure key={f.q} id={`q${i}`} className="gb-faq__item">
          <Heading level={3} className="gb-faq__q">
            <Button slot="trigger" className="gb-faq__btn">
              <span>{f.q}</span>
              <span className="gb-pm" aria-hidden="true" />
            </Button>
          </Heading>
          <DisclosurePanel className="gb-faq__panel">
            <div className="gb-faq__a">
              <p>{f.a}</p>
            </div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}
