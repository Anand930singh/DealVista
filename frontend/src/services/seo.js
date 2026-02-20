// SEO utility for managing page meta tags
export const setPageMeta = (title, description, canonical) => {
  // Set page title
  document.title = `${title} - DealVista`;

  // Set or update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description;

  // Set or update canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonical;

  // Set Open Graph title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = title;

  // Set Open Graph description
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (!ogDescription) {
    ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    document.head.appendChild(ogDescription);
  }
  ogDescription.content = description;
};

export const SEO = {
  home: {
    title: 'DealVista - India\'s  Coupon Marketplace',
    description: 'भारत में verified coupons खोजें। Amazon, Swiggy, Zomato, PhonePe, Myntra पर discounts पाएं। अपने unused coupons share करें और reward points कमाएं।',
    canonical: 'https://coupon-collector.vercel.app',
  },
  browse: {
    title: 'Browse Verified Coupons',
    description: 'हजारों verified coupons browse करें। Amazon, Swiggy, Zomato, PhonePe, Myntra, Flipkart पर discounts खोजें। Category और platform के हिसाब से filter करें।',
    canonical: 'https://coupon-collector.vercel.app/browse',
  },
  auth: {
    title: 'Login & Sign Up - DealVista में Join करें',
    description: 'DealVista में अपना account बनाएं। Coupons share करें, reward points कमाएं, और exclusive deals पाएं।',
    canonical: 'https://coupon-collector.vercel.app/auth',
  },
  upload: {
    title: 'अपना Coupon List करें - Rewards कमाएं',
    description: 'अपने unused discount coupons को community के साथ share करें। Images upload करें, OCR से auto-fill करें और हर coupon के लिए 5 points कमाएं।',
    canonical: 'https://coupon-collector.vercel.app/upload',
  },
};
