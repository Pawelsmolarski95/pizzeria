import { settings, select, classNames, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';
// import AmountWidget from './components/AmountWidget.js';
// import CartProduct from './components/CartProduct.js';
const app = {
  initPages: function(){
    const thisApp = this;
    
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '' );

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages) {
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    
    thisApp.activePage(pageMatchingHash);

    
    
    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        // get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');
        //run app.activePage with this id
        thisApp.activePage(id);
        //change URL hash
        window.location.hash = '#/' + id;
      });
      
    }
    
  },
  activePage: function(pageId){
    const thisApp = this;
    //add class active to maching page, remove this class from non-maching
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    //add class active to maching page, remove this class from non-maching
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initMenu: function(){
    const thisApp = this;
    
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('pasrsedRespose', parsedResponse);
        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        //execute initMenu method
        thisApp.initMenu();
      });
    console.log('thisApp.date', JSON.stringify(thisApp.data));
  },
  initBooking: function(){
    const thisApp = this;
    const widgetReservation = document.querySelector(select.containerOf.booking);
    thisApp.book = new Booking(widgetReservation);

  },  
  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  initHome: function(){
    const thisApp = this;
    const homeElem = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(homeElem);
    thisApp.links = document.querySelectorAll('.box__link');
    
    for(let link of thisApp.links){
      link.addEventListener('click', function(event){
        event.preventDefault();
        const clicked = event.target;
        const id = clicked.getAttribute('href').replace('#', '');
        thisApp.activePage(id);
        window.location.hash = '#/' + id;

      });
    }
  },
  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
    
      
  },
}; 
  

app.init();