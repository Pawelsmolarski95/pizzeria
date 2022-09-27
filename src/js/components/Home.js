import { templates} from '../settings.js';
class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }
  render(element){
    const thisHome = this;
    const generatedHTML = templates.homeContainer();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.carousel = document.querySelector('.main-carousel');
  }
  initWidgets(){
    const thisHome = this;
    // eslint-disable-next-line no-undef
    thisHome.flkty = new Flickity(thisHome.dom.carousel,{
      wrapAround: true,
      autoPlay: 1500,
      initialIndex: 1,
      prevNextButtons: false,
      cellAlign: 'left',
    }); 
  }
}

export default Home;