import { settings, select, classNames ,templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js'; 
class Cart {
  constructor(element){
    const thisCart = this;
    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    console.log('new Cart', thisCart);
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    //create element using utils.createElemnetFromHTML
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
     
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    // console.log('thisCard products', thisCart.products);
    // console.log('adding product', menuProduct);
    thisCart.update();
  }
  update(){
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = 0;


    for(let product of thisCart.products ){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
      
    if (thisCart.subtotalPrice != 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      // thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      // thisCart.deliveryFee.innerHTML = 0;
    }
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    
      

      
    for (let totalPrice of thisCart.dom.totalPrice) {
      totalPrice.innerHTML = thisCart.totalPrice;
    }
  }
  remove(event){
    const thisCart = this;
    console.log('event', event);
    event.dom.wrapper.remove();
    const productToRemove = thisCart.products.indexOf(event);
    console.log('cart', productToRemove);
    thisCart.products.splice(productToRemove, 1);
    thisCart.update();

  }
  sendOrder(){
    const thisCart = this; 
    const url = settings.db.url + '/' + settings.db.orders ;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.totalPrice - settings.cart.defaultDeliveryFee,
      totalNumber:thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: []
    };
    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
    console.log('payload', payload);
    const options =  {
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };
    fetch(url, options);
  }
}
export default Cart;