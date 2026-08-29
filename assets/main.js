const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.querySelector('.sr-only').textContent = isOpen ? '메뉴 열기' : '메뉴 닫기';
    siteNav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }));
}

document.querySelectorAll('[data-year]').forEach((year) => {
  year.textContent = new Date().getFullYear();
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (status) status.textContent = '고맙습니다. 정식 오픈 후 가장 먼저 소식을 전해드릴게요.';
    form.reset();
  });
});

const productLists = document.querySelectorAll('[data-product-list]');

const formatPrice = (price) => `${Number(price).toLocaleString('ko-KR')}원`;

const createProductCard = (product) => {
  const article = document.createElement('article');
  article.className = 'store-product-card';

  const imageLink = document.createElement('a');
  imageLink.className = 'store-product-image';
  imageLink.href = product.url;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute('aria-label', `${product.name} 구매 페이지 열기`);

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  image.loading = 'lazy';
  image.decoding = 'async';
  imageLink.appendChild(image);

  const info = document.createElement('div');
  info.className = 'store-product-info';

  const name = document.createElement('h3');
  name.textContent = product.name;

  const bottom = document.createElement('div');
  bottom.className = 'store-product-bottom';

  const price = document.createElement('strong');
  price.textContent = formatPrice(product.price);

  const button = document.createElement('a');
  button.className = 'buy-button';
  button.href = product.url;
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.innerHTML = '구매하기 <span aria-hidden="true">↗</span>';

  bottom.append(price, button);
  info.append(name, bottom);
  article.append(imageLink, info);
  return article;
};

const loadProducts = async () => {
  if (!productLists.length) return;

  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Product data could not be loaded.');
    const data = await response.json();
    const products = Array.isArray(data) ? data : data.products;
    if (!Array.isArray(products)) throw new Error('Invalid product data.');

    document.querySelectorAll('[data-product-count]').forEach((count) => {
      count.textContent = products.length;
    });

    productLists.forEach((list) => {
      const featured = products.filter((product) => product.featured);
      const items = list.dataset.productList === 'featured'
        ? (featured.length ? featured : products).slice(0, 3)
        : products;
      list.replaceChildren(...items.map(createProductCard));
    });
  } catch (error) {
    productLists.forEach((list) => {
      list.innerHTML = '<p class="product-error">제품 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>';
    });
  }
};

loadProducts();
