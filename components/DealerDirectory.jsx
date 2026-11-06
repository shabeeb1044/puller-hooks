function escapeLines(text) {
  return String(text || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function DealerDirectory({ regions = [] }) {
  const visibleRegions = (regions || []).filter(
    (region) => (region.dealers || []).length > 0
  );
  const totalDealers = visibleRegions.reduce(
    (sum, region) => sum + (region.dealers?.length || 0),
    0
  );

  if (!regions.length) return null;

  return (
    <section className="dealer-directory" id="find-dealer" aria-labelledby="dealer-directory-title">
      <div className="container">
        <header className="dealer-directory-head reveal">
          <div className="dealer-directory-brand">
            <img
              className="dealer-directory-logo"
              src="/images/logo-on-yellow.png"
              alt="PULLER"
              width="220"
              height="72"
              decoding="async"
            />
          </div>
          <p className="dealer-directory-kicker">
            <span className="dealer-directory-kicker-line" aria-hidden="true" />
            <span className="dealer-directory-kicker-text">Our Dealer</span>
            <span className="dealer-directory-kicker-line" aria-hidden="true" />
          </p>
          <h2 id="dealer-directory-title" className="section-title">
            Find an authorized PULLER dealer
          </h2>
          <p className="dealer-directory-lead">
            Browse our worldwide partner network. Each listing shows the partner name and address.
          </p>
        </header>

        {totalDealers ? (
          <div className="dealer-directory-groups">
            {visibleRegions.map((region) => (
              <section
                key={region.id || region.slug}
                className="dealer-directory-group"
                aria-labelledby={`dealer-region-${region.slug || region.id}`}
              >
                <h3
                  id={`dealer-region-${region.slug || region.id}`}
                  className="dealer-directory-region-title reveal"
                >
                  {region.name}
                </h3>
                <div className="dealer-directory-grid" role="list">
                  {region.dealers.map((dealer, index) => {
                    const lines = escapeLines(dealer.address);
                    return (
                      <article
                        key={dealer.id}
                        className="dealer-card reveal"
                        role="listitem"
                        style={{ transitionDelay: `${Math.min(index, 8) * 0.05}s` }}
                      >
                        <div className="dealer-card-inner">
                          <h4 className="dealer-card-title">{dealer.name}</h4>
                          <address className="dealer-card-address">
                            {lines.map((line) => (
                              <span key={line}>{line}</span>
                            ))}
                          </address>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="dealer-directory-empty reveal">
            No authorized dealers listed yet.
            {' '}
            <a className="text-link" href="#apply">Apply to become a dealer</a>.
          </p>
        )}
      </div>
    </section>
  );
}
