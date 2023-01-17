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
    // q: 'dog',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: 1,
  },
};

async function onSubmitFormSearch(e) {
  e.preventDefault();
  observer.unobserve(observedSentinel);
  gallery.innerHTML = '';
  // console.log(formSearch.children.searchQuery.value);
  options.params.q = formSearch.children.searchQuery.value;
  options.params.page = 1;

  const data = await fetchAndLoad();
  const markupGallery = createMarkupGallery(data);
  gallery.insertAdjacentHTML('beforeend', markupGallery);
  lightbox.refresh();

  // await fetchAndLoad();
  if (totalPages > 1) {
    setTimeout(observer.observe(observedSentinel), 1000);
  }
}

async function fetchAndLoad() {
  try {
    const response = await axios.get('https://pixabay.com/api', options);
    const data = response.data.hits;
    totalImages = response.data.totalHits;
    totalPages = Math.ceil(response.data.totalHits / 40);
    console.log(response);
    if (totalImages) {
      Notify.info(`Hooray! We found ${totalImages} images.`);
    }

    if (!data.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    return data;
    // console.log(totalPages);
    createMarkupGallery(data);
  } catch (error) {
    console.log(error);
  }
}

async function createMarkupGallery(data) {
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
  // const lastItemElemkent = gallery.lastElementChild;

  // console.log(lastItemElemkent);

  return markup;

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
  if (options.params.page !== 1) {
    console.log('unscroll', options.params.page);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
  // if (lastItemElemkent) {
  //   const ifNeedScrollElem = lastItemElemkent.nextElementSibling;
  //   // console.log(lastItemElemkent.nextElementSibling);
  //   if (ifNeedScrollElem) {
  //     setTimeout(() => {
  //       lastItemElemkent.nextElementSibling.scrollIntoView({
  //         block: 'start',
  //         behavior: 'smooth',
  //       });
  //     }, 600);
  //   }
  // }
  // observer.unobserve(observedSentinel);

  // if (totalPages > 1) {
  //   setTimeout(observer.observe(observedSentinel), 1000);
  // }
}

function onInfinityLoad(entries) {
  // console.log('123');
  console.log('total pages:', totalPages);
  console.log('page number:', options.params.page);
  options.params.page += 1;
  // console.log(observer.observe);

  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      console.log('load more');
      await fetchAndLoad();
    }
    if (totalPages < options.params.page) {
      observer.unobserve(observedSentinel);
      console.log('unobsrve');
    }
  });
}
