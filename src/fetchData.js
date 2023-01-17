const axios = require('axios').default;

const options = {
  params: {
    key: '32598481-51c6e368c4b2f2440a6e9b5e3',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
  },
};

async function fetchAndLoad() {
  try {
    const response = await axios.get('https://pixabay.com/api/', options);
    const data = response.data;
    return data;
  } catch (error) {
    console.log(error);
  }
}

export { options, fetchAndLoad };
