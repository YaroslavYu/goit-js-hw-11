// key (required)	str	Your API key: 32598481-51c6e368c4b2f2440a6e9b5e3
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { fetchAndLoad, options } from './fetchData';
import { createMarkupGallery } from './createMarkup';
import { scrollWhenNewFetch } from './scrollWhenFetch';

const formSearch = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const observedSentinel = document.querySelector('.js-sentinel');

const observerParams = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onInfinityLoad, observerParams);
const lightbox = new SimpleLightbox('.gallery .photo-card__item');

let totalPages = 0;
let totalImages = 0;

formSearch.addEventListener('submit', onSubmitFormSearch);

async function onSubmitFormSearch(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  observer.unobserve(observedSentinel);

  options.params.q = formSearch.children.searchQuery.value;
  options.params.page = 1;

  const data = await fetchAndLoad();

  if (!data.hits.length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  } else {
    totalImages = data.totalHits;
    totalPages = Math.ceil(data.totalHits / 40);
    Notify.info(`Hooray! We found ${totalImages} images.`);
  }
  const markupGallery = createMarkupGallery(data.hits);
  gallery.insertAdjacentHTML('beforeend', markupGallery);
  lightbox.refresh();

  observer.observe(observedSentinel);
}

function onInfinityLoad(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      options.params.page += 1;
      const fetchNewData = await fetchAndLoad();
      const markupGallery = createMarkupGallery(fetchNewData.hits);
      gallery.insertAdjacentHTML('beforeend', markupGallery);
      lightbox.refresh();
      scrollWhenNewFetch();
    }
    if (totalPages === options.params.page) {
      observer.unobserve(observedSentinel);
      if (totalPages !== 1) {
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  });
}
