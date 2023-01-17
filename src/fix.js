// key (required)	str	Your API key: 32598481-51c6e368c4b2f2440a6e9b5e3
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const axios = require('axios').default;

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

console.log(formSearch.children.searchQuery.value);

formSearch.addEventListener('submit', onSubmitFormSearch);

const options = {
  params: {
    key: '32598481-51c6e368c4b2f2440a6e9b5e3',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
  },
};

async function onSubmitFormSearch(e) {
  e.preventDefault();
  gallery.innerHTML = '';
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

async function fetchAndLoad() {
  try {
    const response = await axios.get('https://pixabay.com/api', options);
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
  }
}

async function onInfinityLoad(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      console.log('load more');
      options.params.page += 1;
      console.log('total pages:', totalPages);
      console.log('page number:', options.params.page);
      const fetchNewData = await fetchAndLoad();
      const markupGallery = createMarkupGallery(fetchNewData.hits);
      gallery.insertAdjacentHTML('beforeend', markupGallery);
      lightbox.refresh();
      scrollWhenNewFetch();
    }
    if (totalPages === options.params.page) {
      observer.unobserve(observedSentinel);
      Notify.info("We're sorry, but you've reached the end of search results.");
      console.log('unobsrve');
    }
  });
}

function createMarkupGallery(data) {
  let markup = '';
  for (const element of data) {
    const {
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = element;
    markup += `<div class="photo-card">
  <a href="${largeImageURL}" class="photo-card__item"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes: </b>${likes}
    </p>
    <p class="info-item">
      <b>Views: </b>${views}
    </p>
    <p class="info-item">
      <b>Comments: </b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads: </b>${downloads}
    </p>
  </div>
</div>`;
  }

  return markup;
}

function scrollWhenNewFetch() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
