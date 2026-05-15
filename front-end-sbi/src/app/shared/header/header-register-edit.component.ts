import {Component, Input, OnInit} from '@angular/core';

import {environment} from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-header-register-edit',
  templateUrl: './header-register-edit.component.html',
  styleUrls: ['../../../assets/css/styles.css']
})
export class HeaderRegisterEditComponent implements OnInit {

  public logoCompany = environment.logoName;

  @Input() muestra: boolean;

  constructor() {
    /*if (this.muestra === true) {
      this.tiempo();
    }*/
  }

  ngOnInit() {
  }


  tiempo () {
    // =============================================================
    // Con esto obtenemos la fecha actual extendida para la expiracion
    // =============================================================
    const initialDate = new Date();
    const temp = new Date(initialDate);
    const ant = 2 * 86399.9; // dias en segundos
    const finalDate = new Date(temp.setSeconds(ant));
    const day = finalDate.getDate() < 10 ? '0' + finalDate.getDate() : finalDate.getDate();
    const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const finalDateFormat = day + ' ' + monthList[finalDate.getMonth()] + ', '  + finalDate.getFullYear();

    // =============================================================

    // Set the date we're counting down to
    // var countDownDate = new Date("Jul 25, 2018 15:37:25").getTime();
    const countDownDate = finalDate.getTime();

    // Update the count down every 1 second
    const x = setInterval(function() {

      // Get todays date and time
      const now = new Date().getTime();

      // Find the distance between now an the count down date
      const distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Output the result in an element with id="demo"
      // document.getElementById("demo").innerHTML = days + 'd ' + hours + 'h '
      //  + minutes + 'm ' + seconds + 's ';

      // console.log(days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ');

      document.getElementById('countOrder').innerHTML = days + 'd ' + hours + 'h '
        + minutes + 'm ' + seconds + 's ';

      // document.getElementById("expFecha").innerHTML = finalDateFormat;

      // If the count down is over, write some text
      if (distance < 0) {
        clearInterval(x);
        // document.getElementById("demo").innerHTML = 'EXPIRED';
        document.getElementById('countOrder').innerHTML = 'EXPIRED';
      }
    }, 1000);
  }

}
