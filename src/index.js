// key (required)	str	Your API key: 32598481-51c6e368c4b2f2440a6e9b5e3
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const axios = require('axios').default;

const formSearch = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const observedSentinel = document.querySelector('.js-sentinel');

const observerParams = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onInfinityLoad, observerParams);

console.log(formSearch.children.searchQuery.value);

formSearch.addEventListener('submit', onSubmitFormSearch);

const options = {
  params: {
    key: '32598481-51c6e368c4b2f2440a6e9b5e3',
    // q: 'dog',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 20,
    page: 1,
  },
};

async function onSubmitFormSearch(e) {
  e.preventDefault();
  console.log(formSearch.children.searchQuery.value);
  options.params.q = formSearch.children.searchQuery.value;
  await fetchAndLoad();

  // try {
  //   const response = await axios.get('https://pixabay.com/api', options);
  //   const data = response.data.hits;
  //   console.log(response);

  //   console.log(data);
  //   createMarkupGallery(data);
  //   observer.observe(observedSentinel);
  // } catch (error) {
  //   console.error(error);
  // }
}

// axios
//   .get('https://pixabay.com/api/?key=32598481-51c6e368c4b2f2440a6e9b5e3&q=dog')
//   .then(console.log);

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
  <a href="${largeImageURL} class="photo-card__item"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
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
  await gallery.insertAdjacentHTML('beforeend', markup);
  const lightbox = new SimpleLightbox('.gallery .photo-card__item', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  observer.observe(observedSentinel);
}

function onInfinityLoad(entries, observer) {
  // console.log('123');
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log(entry.isIntersecting, 'fdf');
      fetchAndLoad();
    }
  });
}

async function fetchAndLoad() {
  try {
    const response = await axios.get('https://pixabay.com/api', options);
    const data = response.data.hits;
    console.log(response);

    console.log(data);
    createMarkupGallery(data);
    options.params.page += 1;
  } catch (error) {
    console.error(error);
  }
}
