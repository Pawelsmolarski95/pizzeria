import { classNames, select, settings, templates} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';
import utils from '../utils.js';

class Booking{
  constructor(element) {
    const thisBooking = this;

 
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectedTable = 0;
    thisBooking.starters = [];
  
  }
  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = { 
      eventsCurrent: [ 
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam],
      eventsRepeat:  [ 
        settings.db.repeatParam,
        endDateParam],
      booking: [ 
        startDateParam,
        endDateParam],
    };

    // console.log('getData params', params);

    const urls = {
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event    
                                     + '?' + params.eventsRepeat.join('&'),
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),

    ])
      .then(function(allResposnes){
        const bookingsResponse = allResposnes[0];
        const eventsCurrentResponse = allResposnes[1];
        const eventsRepeatResponse = allResposnes[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings,eventsCurrent,eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
      });
  }

  parseData(bookings,eventsCurrent,eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily')
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      
    }
    // console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  
  makeBooked(date, hour, duration, table){
    const thisBooking = this;
    
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;
    
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable  = true;
    }
    
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) >= 1
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }  

 

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);


    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.widgets.floorPlan);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.submitButton = thisBooking.dom.wrapper.querySelector(select.booking.submitButton);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(select.booking.starters);

    




    
  } 
  initTables(){
    const thisBooking = this;
    const clicked = event.target;
    const allTables = clicked.offsetParent.querySelectorAll('.table.selected');
    console.log(allTables);
    
    console.log(clicked);
    if(clicked.classList.contains('table')) {
      if(!clicked.classList.contains(classNames.booking.tableBooked)){
        const clickedTableId = clicked.getAttribute('data-table');

        if(!clicked.classList.contains(classNames.booking.tableSelected)){
          
          for(let table of allTables){
            table.classList.remove('selected');
          }
          clicked.classList.add(classNames.booking.tableSelected);
          thisBooking.selectedTable = clickedTableId;

        } else {
          clicked.classList.remove(classNames.booking.tableSelected);
          thisBooking.selectedTable = 0;
        }
      } else {
        window.alert('This table is already booked');
      }
    }  
  }
  
   
  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker); 
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    
    

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floor.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });
  
    // for(let i = 0; i < thisBooking.dom.starters.lenght; i++ ){
    thisBooking.dom.starters.addEventListener('click', function(event){
      
      const clickedStarter = event.target;
      if(clickedStarter.type == 'checkbox'){
        if(clickedStarter.checked){
          thisBooking.starters.push(clickedStarter.value);  
        } else {
          thisBooking.starters.splice(thisBooking.starters.indexOf(clickedStarter.value),1);
        }
      }
    });
  
    thisBooking.dom.submitButton.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

    console.log(thisBooking.starters);
    // }
  }

  sendBooking(){
    const thisBooking = this; 
    const url = settings.db.url + '/' + settings.db.booking ;
    const payload = {
      
      'date': thisBooking.datePicker.value,
      'hour': thisBooking.hourPicker.value,
      'table': parseInt(thisBooking.selectedTable),
      'duration': parseInt(thisBooking.hoursAmount.value),
      'ppl': parseInt(thisBooking.peopleAmount.value),
      'starters': thisBooking.starters,
      'phone': thisBooking.dom.phone.value,
      'address': thisBooking.dom.address.value
    };
    console.log('payload', payload);
   
    const options =  {
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('do API ', parsedResponse);
      });

    thisBooking.makeBooked(payload.date, payload.hour, payload.table, payload.duration);
    thisBooking.updateDOM();
  }

}
 





export default Booking;