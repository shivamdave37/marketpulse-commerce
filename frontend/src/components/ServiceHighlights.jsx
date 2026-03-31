const SERVICES = [
  {
    title: 'Superfast Delivery',
    description: 'Express-ready fulfillment messaging like major marketplace apps.'
  },
  {
    title: 'Easy Returns',
    description: 'Simple, confidence-building policies highlighted above the fold.'
  },
  {
    title: 'Secure Payments',
    description: 'Card, UPI, wallet, and COD-friendly checkout messaging.'
  },
  {
    title: 'Verified Reviews',
    description: 'Ratings and social proof surfaced on every product card.'
  }
];

export default function ServiceHighlights() {
  return (
    <section className="service-strip">
      {SERVICES.map((service) => (
        <article key={service.title} className="service-card">
          <strong>{service.title}</strong>
          <p>{service.description}</p>
        </article>
      ))}
    </section>
  );
}
