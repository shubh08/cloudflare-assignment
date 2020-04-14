addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  let response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants');
  let resultURLs = []
  if (response.ok) {
    const NAME = 'URL_SPLITTER'
    let json = await response.json();
    console.log('response', json.variants)
    resultURLs = json.variants
    const VARIANT1_RESPONSE = await fetchData(resultURLs[0], 1)
    const VARIANT2_RESPONSE = await fetchData(resultURLs[1], 2)
    const cookie = request.headers.get('cookie')
    if (cookie && cookie.includes(`${NAME}=variant1`)) {
      console.log('returned from variant1')
      return VARIANT1_RESPONSE
    } else if (cookie && cookie.includes(`${NAME}=variant2`)) {
      console.log('returned from variant2')
      return VARIANT2_RESPONSE
    }

    else {
      let resultVariantURL = Math.random() < 0.5 ? 'variant1' : 'variant2'
      let response = resultVariantURL === 'variant1' ? VARIANT1_RESPONSE : VARIANT2_RESPONSE
      console.log('Cookie set resultVariantURL', resultVariantURL)
      response.headers.append('Set-Cookie', `${NAME}=${resultVariantURL}; path=/`)
      return response

    }

  } else {
    alert("HTTP-Error: " + response.status);
    return new Response('Error worker!', {
      headers: { 'content-type': 'text/plain' },
    })
  }
}


/**
 * This function takes input parameter as url and variantVersion and returns
 * a modified response based on the variantVersion
 */

fetchData = async (url, variantVersion) => {
  let response = await fetch(url);
  return new HTMLRewriter().on('*', new ElementHandlerVariant1(variantVersion)).transform(response)
}


/**
 * This is ElementHandlerVariant1 class handler which takes input element and performs modifcations on the 
 * html elements. 
 */

class ElementHandlerVariant1 {
  constructor(variantVersion) {
    this.variantVersion = variantVersion
  }
  element(element) {
    if (element.tagName == 'title') {
      this.variantVersion == 1 ? element.setInnerContent('Variant 1 Shubham Title 1') : element.setInnerContent('Variant 2 Shubham Title 2')
    }
    if (element.tagName == 'h1') {
      if (element.getAttribute('id') == 'title')
        this.variantVersion == 1 ? element.setInnerContent('Variant 1 Shubham H1 TAG') : element.setInnerContent('Variant 2 Shubham  H1 TAG')
    }
    if (element.tagName == 'p') {
      if (element.getAttribute('id') == 'description')
        this.variantVersion == 1 ? element.setInnerContent('Welcome to Variant 1 Shubham') : element.setInnerContent('Welcome to Variant 2 Shubham')
    }
    if (element.tagName == 'a') {
      if (element.getAttribute('id') == 'url')
        if (this.variantVersion == 1) {
          element.setInnerContent('View my Website!')
          element.setAttribute('href', 'https://shubh08.github.io/my-portfolio/')
        }
        else {
          element.setInnerContent('View my LinkedIn!')
          element.setAttribute('href', 'https://www.linkedin.com/in/shubhamkumar567')
        }

    }
  }

}

