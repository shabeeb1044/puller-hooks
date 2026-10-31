/**
 * Convert an HTML fragment to JSX-friendly markup (class→className, etc.).
 */
function htmlToJsx(html) {
  let out = html;

  // HTML comments → JSX comments
  out = out.replace(/<!--([\s\S]*?)-->/g, (_m, body) => `{/*${body.replace(/\*\//g, '* /')}*/}`);

  // class / for attributes (avoid className already)
  out = out.replace(/\sclass=/g, ' className=');
  out = out.replace(/\sfor=/g, ' htmlFor=');

  // Self-close void elements that appear as <tag ...>
  const voids = [
    'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'col',
    'embed', 'param', 'track', 'wbr',
  ];
  for (const tag of voids) {
    const re = new RegExp(`<(${tag})(\\s[^>]*?)(?<!/)\\s*>`, 'gi');
    out = out.replace(re, (_m, t, attrs) => {
      const a = attrs || '';
      if (/\/>\s*$/.test(a)) return `<${t}${a}>`;
      return `<${t}${a} />`;
    });
  }

  // style="..." → style={{...}} for simple cases; leave complex as-is if already object-like
  out = out.replace(/\sstyle="([^"]*)"/g, (_m, css) => {
    const entries = css
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const i = pair.indexOf(':');
        if (i < 0) return null;
        let prop = pair.slice(0, i).trim();
        let val = pair.slice(i + 1).trim();
        prop = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (/^\d+(\.\d+)?$/.test(val)) {
          // keep unitless as number only for known props; otherwise string
          return `${prop}: ${val}`;
        }
        val = val.replace(/'/g, "\\'");
        return `${prop}: '${val}'`;
      })
      .filter(Boolean);
    return ` style={{ ${entries.join(', ')} }}`;
  });

  // xmlns / stroke-width etc. — SVG attrs with hyphens are fine in React for SVG
  // Fix boolean attributes without values
  out = out.replace(/\s(novalidate|required|deferred|async|muted|checked|selected|disabled|readonly|multiple|autofocus|autoplay|controls|loop|playsinline|default|open|hidden|reversed|scoped|seamless|ismap)(?=[\s>])/gi, (_m, attr) => {
    const lower = attr.toLowerCase();
    const map = {
      novalidate: 'noValidate',
      readonly: 'readOnly',
      autofocus: 'autoFocus',
      autoplay: 'autoPlay',
      playsinline: 'playsInline',
      ismap: 'isMap',
    };
    const name = map[lower] || lower;
    return ` ${name}`;
  });

  // tabindex → tabIndex
  out = out.replace(/\stabindex=/gi, ' tabIndex=');
  out = out.replace(/\scolspan=/gi, ' colSpan=');
  out = out.replace(/\srowspan=/gi, ' rowSpan=');
  out = out.replace(/\scellpadding=/gi, ' cellPadding=');
  out = out.replace(/\scellspacing=/gi, ' cellSpacing=');
  out = out.replace(/\sframeborder=/gi, ' frameBorder=');
  out = out.replace(/\sallowfullscreen=/gi, ' allowFullScreen');
  out = out.replace(/\scrossorigin=/gi, ' crossOrigin=');
  out = out.replace(/\sfetchpriority=/gi, ' fetchPriority=');
  out = out.replace(/\scharset=/gi, ' charSet=');

  return out;
}

function rewriteLinks(html) {
  let out = html;
  const map = [
    [/(\.\.\/)?index\.html/g, '/'],
    [/(\.\.\/)?contact\.html/g, '/contact'],
    [/(\.\.\/)?dealers\.html/g, '/dealers'],
    [/(\.\.\/)?our-story\.html/g, '/our-story'],
    [/(\.\.\/)?products\/hooks\.html/g, '/products/hooks'],
    [/hooks\.html/g, '/products/hooks'],
    [/(\.\.\/)?products\/hard-body-lures\.html/g, '/products/flash-striker'],
    [/hard-body-lures\.html/g, '/products/flash-striker'],
    [/(\.\.\/)?products\/flash-striker\.html/g, '/products/flash-striker'],
    [/flash-striker\.html/g, '/products/flash-striker'],
    [/flash-striker-(\d{2})\.html/g, '/products/flash-striker/$1'],
    [/\.\.\/images\//g, '/images/'],
    [/src="images\//g, 'src="/images/'],
    [/srcset="images\//g, 'srcset="/images/'],
    [/href="images\//g, 'href="/images/'],
    [/url\("images\//g, 'url("/images/'],
    [/\.\.\/fonts\//g, '/fonts/'],
    [/\.\.\/css\//g, '/css/'],
    [/\.\.\/js\//g, '/js/'],
    [/\.\.\/favicon\.ico/g, '/favicon.ico'],
    [/\.\.\/site\.webmanifest/g, '/site.webmanifest'],
    [/href="\.\.\/index\.html#/g, 'href="/#'],
    [/href="#i-/g, 'href="#i-'], // keep svg sprite refs
    [/href="\.\.\/index\.html#i-/g, 'href="#i-'],
    [/use href="\.\.\/index\.html#/g, 'use href="#'],
  ];
  for (const [re, to] of map) out = out.replace(re, to);
  // Fix leftover relative product image paths
  out = out.replace(/src="\.\.\/images\//g, 'src="/images/');
  return out;
}

module.exports = { htmlToJsx, rewriteLinks };
